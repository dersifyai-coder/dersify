import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { z } from 'zod';
import {
  AI_TIMEOUT_MS,
  ChatMessage,
  EMBEDDING_DIMENSION,
  MODEL_ROUTING,
} from './ai.constants';
import { AiUnavailableException } from './exceptions/ai-unavailable.exception';
import { type AppConfig } from '../config/configuration';

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`AI timeout after ${ms}ms`)), ms);
    timer.unref();
    promise.then(
      (value) => { clearTimeout(timer); resolve(value); },
      (err: unknown) => { clearTimeout(timer); reject(err as Error); },
    );
  });
}

function resolveSessionTurnKey(
  operation: keyof typeof MODEL_ROUTING,
  learnerTier: string,
): keyof typeof MODEL_ROUTING {
  if (operation === 'session_turn_pro' || operation === 'session_turn_free') {
    return learnerTier === 'free' ? 'session_turn_free' : 'session_turn_pro';
  }
  return operation;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly geminiClient: GoogleGenerativeAI;
  private readonly openaiClient: OpenAI;

  constructor(private readonly configService: ConfigService<AppConfig>) {
    const googleApiKey = this.configService.get('googleAi', { infer: true })?.apiKey ?? '';
    const openaiApiKey = this.configService.get('openai', { infer: true })?.apiKey ?? '';
    this.geminiClient = new GoogleGenerativeAI(googleApiKey);
    this.openaiClient = new OpenAI({ apiKey: openaiApiKey });
  }

  async chat(
    operation: keyof typeof MODEL_ROUTING,
    messages: ChatMessage[],
    learnerTier: 'free' | 'pro' | 'teams' = 'free',
  ): Promise<string> {
    const resolvedOp = resolveSessionTurnKey(operation, learnerTier);
    const route = MODEL_ROUTING[resolvedOp];

    if (!('primary' in route)) {
      throw new AiUnavailableException(
        `Operation "${operation}" is not a chat operation — use embed() for embeddings`,
      );
    }

    const chatRoute = route as { primary: string; fallback: string };
    const startMs = Date.now();

    try {
      const { text, tokensIn, tokensOut } = await this.callGemini(chatRoute.primary, messages);
      this.logCall({
        operation: resolvedOp,
        model: chatRoute.primary,
        provider: 'google',
        tokensIn,
        tokensOut,
        latencyMs: Date.now() - startMs,
        learnerTier,
      });
      return text;
    } catch (primaryErr) {
      this.logger.warn('ai_primary_failed', {
        operation: resolvedOp,
        provider: 'google',
        model: chatRoute.primary,
        reason: (primaryErr as Error).message,
        timestamp: new Date().toISOString(),
      });
    }

    try {
      const { text, tokensIn, tokensOut } = await this.callOpenAI(chatRoute.fallback, messages);
      this.logCall({
        operation: resolvedOp,
        model: chatRoute.fallback,
        provider: 'openai',
        tokensIn,
        tokensOut,
        latencyMs: Date.now() - startMs,
        learnerTier,
      });
      return text;
    } catch (fallbackErr) {
      this.logger.error('ai_fallback_failed', {
        operation: resolvedOp,
        provider: 'openai',
        model: chatRoute.fallback,
        reason: (fallbackErr as Error).message,
        timestamp: new Date().toISOString(),
      });
    }

    throw new AiUnavailableException(`Both providers failed for operation: ${operation}`);
  }

  async chatWithSchema<T>(
    operation: keyof typeof MODEL_ROUTING,
    messages: ChatMessage[],
    schema: z.ZodType<T>,
    learnerTier?: string,
  ): Promise<T> {
    const tier = (learnerTier as 'free' | 'pro' | 'teams') ?? 'free';
    const response = await this.chat(operation, messages, tier);

    const firstParsed = this.tryParse(response);
    const firstResult = schema.safeParse(firstParsed);
    if (firstResult.success) return firstResult.data;

    const correctionMessages: ChatMessage[] = [
      ...messages,
      { role: 'assistant', content: response },
      {
        role: 'user',
        content: `Your response was invalid. Respond with valid JSON only. Errors: ${JSON.stringify(
          firstResult.error.issues.slice(0, 3),
        )}`,
      },
    ];

    const retryResponse = await this.chat(operation, correctionMessages, tier);
    const retryParsed = this.tryParse(retryResponse);
    const retryResult = schema.safeParse(retryParsed);
    if (retryResult.success) return retryResult.data;

    throw new AiUnavailableException(
      `Schema validation failed after retry for operation: ${operation}`,
    );
  }

  async embed(text: string): Promise<number[]> {
    try {
      const model = this.geminiClient.getGenerativeModel({
        model: MODEL_ROUTING.embedding_primary.model,
      });
      const result = await withTimeout(model.embedContent(text), AI_TIMEOUT_MS);
      return result.embedding.values;
    } catch (primaryErr) {
      this.logger.warn('embed_primary_failed', {
        provider: 'google',
        reason: (primaryErr as Error).message,
      });
    }

    try {
      const response = await withTimeout(
        this.openaiClient.embeddings.create({
          model: MODEL_ROUTING.embedding_fallback.model,
          input: text,
          dimensions: EMBEDDING_DIMENSION,
        }),
        AI_TIMEOUT_MS,
      );
      const embedding = response.data[0]?.embedding;
      if (!embedding) throw new Error('Empty embedding returned');
      return embedding;
    } catch (fallbackErr) {
      this.logger.error('embed_fallback_failed', {
        provider: 'openai',
        reason: (fallbackErr as Error).message,
      });
    }

    throw new AiUnavailableException('Both embedding providers failed');
  }

  private async callGemini(
    modelId: string,
    messages: ChatMessage[],
  ): Promise<{ text: string; tokensIn: number; tokensOut: number }> {
    const systemInstruction = messages.find((m) => m.role === 'system')?.content;
    const conversationMessages = messages.filter((m) => m.role !== 'system');

    const contents = conversationMessages.map((m) => ({
      role: m.role === 'assistant' ? ('model' as const) : ('user' as const),
      parts: [{ text: m.content }],
    }));

    const model = this.geminiClient.getGenerativeModel({
      model: modelId,
      ...(systemInstruction ? { systemInstruction } : {}),
    });

    const result = await withTimeout(model.generateContent({ contents }), AI_TIMEOUT_MS);
    const text = result.response.text();
    const meta = result.response.usageMetadata;

    return {
      text,
      tokensIn: meta?.promptTokenCount ?? 0,
      tokensOut: meta?.candidatesTokenCount ?? 0,
    };
  }

  private async callOpenAI(
    modelId: string,
    messages: ChatMessage[],
  ): Promise<{ text: string; tokensIn: number; tokensOut: number }> {
    const oaiMessages = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const response = await withTimeout(
      this.openaiClient.chat.completions.create({ model: modelId, messages: oaiMessages }),
      AI_TIMEOUT_MS,
    );

    const text = response.choices[0]?.message?.content ?? '';
    return {
      text,
      tokensIn: response.usage?.prompt_tokens ?? 0,
      tokensOut: response.usage?.completion_tokens ?? 0,
    };
  }

  private tryParse(response: string): unknown {
    const stripped =
      response.match(/```(?:json)?\n?([\s\S]*?)\n?```/)?.[1]?.trim() ?? response.trim();
    try {
      return JSON.parse(stripped) as unknown;
    } catch {
      return response.trim();
    }
  }

  private logCall(params: {
    operation: string;
    model: string;
    provider: string;
    tokensIn: number;
    tokensOut: number;
    latencyMs: number;
    learnerTier?: string;
  }): void {
    this.logger.log(
      JSON.stringify({ event: 'ai_call', ...params }),
    );
  }
}
