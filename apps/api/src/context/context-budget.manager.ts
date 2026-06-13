import { Injectable, Logger } from '@nestjs/common';
import { SessionMessage } from '@dersify/database';
import { AiService } from '../ai/ai.service';
import { AiUnavailableException } from '../ai/exceptions/ai-unavailable.exception';
import { SESSION_TOKEN_HARD_LIMIT } from '../ai/ai.constants';
import { buildSessionSummaryPrompt } from '../ai/prompts/session-summary.prompt';
import { SessionSummaryOutputSchema } from '../ai/prompts/session-summary.prompt';

const COMPRESSION_THRESHOLD = SESSION_TOKEN_HARD_LIMIT * 0.6;
const SESSION_END_THRESHOLD = SESSION_TOKEN_HARD_LIMIT * 0.95;
const COMPRESSION_OLDEST_N = 5;

@Injectable()
export class ContextBudgetManager {
  private readonly logger = new Logger(ContextBudgetManager.name);

  constructor(private readonly aiService: AiService) {}

  estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  shouldCompress(totalTokens: number): boolean {
    return totalTokens > COMPRESSION_THRESHOLD;
  }

  shouldEndSession(totalTokens: number): boolean {
    return totalTokens > SESSION_END_THRESHOLD;
  }

  async buildCompressionSummary(messages: SessionMessage[]): Promise<string> {
    const oldest = messages.slice(0, COMPRESSION_OLDEST_N);
    if (oldest.length === 0) return '';

    const startTurn = oldest[0]?.turnIndex ?? 0;
    const endTurn = oldest[oldest.length - 1]?.turnIndex ?? 0;

    const promptMessages = buildSessionSummaryPrompt({
      messages: oldest.map((m) => ({ role: m.role, content: m.content })),
      startTurn,
      endTurn,
    });

    try {
      const summary = await this.aiService.chatWithSchema(
        'session_summary',
        promptMessages,
        SessionSummaryOutputSchema,
      );
      return `[Turn ${startTurn}–${endTurn} summary]: ${summary}`;
    } catch (err) {
      if (err instanceof AiUnavailableException) {
        this.logger.warn('compression_summary_ai_unavailable', { startTurn, endTurn });
        return `[Turn ${startTurn}–${endTurn} summary]: Summary unavailable — AI service unreachable during compression.`;
      }
      throw err;
    }
  }
}
