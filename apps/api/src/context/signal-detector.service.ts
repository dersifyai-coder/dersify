import { Injectable, Logger } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { AiUnavailableException } from '../ai/exceptions/ai-unavailable.exception';
import { buildSignalDetectionPrompt, SignalDetectionOutputSchema } from '../ai/prompts/signal-detection.prompt';
import { SessionInsights, SessionSignal, SignalDetectionResult } from './session-insights';

const SIGNAL_DETECTION_AI_TIMEOUT_MS = 4_000;

const CONFUSION_PHRASES = [
  "i don't get",
  "i don't understand",
  'confused',
  'lost',
  'what?',
  'huh',
  'makes no sense',
  "don't follow",
];

const MOMENTUM_PHRASES = [
  'i see',
  'got it',
  'makes sense',
  'that makes sense',
  'i understand now',
  'ok so',
  'oh i see',
];

const BREAKTHROUGH_PHRASES = ['oh!', 'now i understand', "that's why", 'that explains', 'aha'];

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function extractKeywords(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2),
  );
}

function computeTopicOverlap(message: string, topic: string): number {
  const topicKeywords = extractKeywords(topic);
  if (topicKeywords.size === 0) return 1;
  const messageKeywords = extractKeywords(message);
  let matches = 0;
  for (const kw of topicKeywords) {
    if (messageKeywords.has(kw)) matches++;
  }
  return matches / topicKeywords.size;
}

function isOnlyPunctuationOrEmoji(text: string): boolean {
  return /^[\s\p{P}\p{S}\p{Emoji}]+$/u.test(text.trim());
}

function withAiTimeout<T>(promise: Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`Signal detection AI timeout after ${SIGNAL_DETECTION_AI_TIMEOUT_MS}ms`)),
      SIGNAL_DETECTION_AI_TIMEOUT_MS,
    );
    timer.unref();
    promise.then(
      (value) => { clearTimeout(timer); resolve(value); },
      (err: unknown) => { clearTimeout(timer); reject(err as Error); },
    );
  });
}

@Injectable()
export class SignalDetectorService {
  private readonly logger = new Logger(SignalDetectorService.name);

  constructor(private readonly aiService: AiService) {}

  async analyze(
    message: string,
    insights: SessionInsights,
    sessionMetrics: {
      baselineResponseTimeMs: number;
      turnIndex: number;
      topic?: string;
      consecutiveShortMessages?: number;
    },
  ): Promise<SignalDetectionResult> {
    const lowerMsg = message.toLowerCase();
    const words = wordCount(message);
    const { turnIndex, topic, consecutiveShortMessages = 0 } = sessionMetrics;

    const signals: SessionSignal[] = [];

    // ── Disengagement ─────────────────────────────────────────────────────────
    if (words === 0 || words < 4) {
      signals.push({ type: 'disengagement' });
    } else if (isOnlyPunctuationOrEmoji(message)) {
      signals.push({ type: 'disengagement' });
    }

    // ── Confusion ─────────────────────────────────────────────────────────────
    if (signals.length === 0 || signals[0]?.type !== 'disengagement') {
      const hasConfusionPhrase = CONFUSION_PHRASES.some((p) => lowerMsg.includes(p));
      if (hasConfusionPhrase) {
        signals.push({ type: 'confusion', about: topic ?? 'current concept' });
      } else if (words < 8 && consecutiveShortMessages >= 1) {
        // Two consecutive short messages (this + at least one before)
        signals.push({ type: 'confusion', about: topic ?? 'current concept' });
      }
    }

    // ── Struggle ──────────────────────────────────────────────────────────────
    const hasShortAfterExplanation = words < 15 && insights.consecutiveMomentum === 0;
    if (
      signals.length === 0 &&
      hasShortAfterExplanation &&
      insights.consecutiveStruggles >= 1
    ) {
      signals.push({ type: 'struggle', concept: topic ?? 'current concept', severity: 1 });
    }

    // ── Breakthrough ──────────────────────────────────────────────────────────
    const hasBreakthroughPhrase = BREAKTHROUGH_PHRASES.some((p) => lowerMsg.includes(p));
    if (hasBreakthroughPhrase && words > 5) {
      signals.push({ type: 'breakthrough', concept: topic ?? 'current concept' });
    }

    // ── Momentum ──────────────────────────────────────────────────────────────
    if (!hasBreakthroughPhrase) {
      const hasMomentumPhrase = MOMENTUM_PHRASES.some((p) => lowerMsg.includes(p));
      if (hasMomentumPhrase) {
        signals.push({ type: 'momentum', concept: topic ?? 'current concept' });
      } else if (words > 80) {
        signals.push({ type: 'momentum', concept: topic ?? 'current concept' });
      }
    }

    // ── Off-topic ─────────────────────────────────────────────────────────────
    if (turnIndex > 3 && topic) {
      const overlap = computeTopicOverlap(message, topic);
      if (overlap < 0.1) {
        signals.push({ type: 'off_topic' });
      }
    }

    // ── AI escalation decision ─────────────────────────────────────────────────
    const isAmbiguous = signals.length === 0 && words >= 30 && words <= 80;
    const isCompeting = signals.length >= 2;
    const requiresAiEscalation = isAmbiguous || isCompeting;

    if (requiresAiEscalation) {
      try {
        const escalated = await withAiTimeout(
          this.aiEscalate(message, insights, sessionMetrics),
        );
        return escalated;
      } catch (err) {
        if (!(err instanceof AiUnavailableException)) {
          this.logger.warn('signal_detection_ai_timeout', { turnIndex });
        }
        // Fire-and-forget: return rule-based result on timeout
      }
    }

    const urgency = this.deriveUrgency(signals, insights);
    return { signals, urgency, requiresAiEscalation };
  }

  private async aiEscalate(
    message: string,
    insights: SessionInsights,
    sessionMetrics: { topic?: string },
  ): Promise<SignalDetectionResult> {
    const promptMessages = buildSignalDetectionPrompt({
      message,
      topic: sessionMetrics.topic ?? 'general',
      currentMode: insights.currentMode,
    });

    const output = await this.aiService.chatWithSchema(
      'signal_detection',
      promptMessages,
      SignalDetectionOutputSchema,
    );

    const signals = output.signals as SessionSignal[];
    return { signals, urgency: output.urgency, requiresAiEscalation: false };
  }

  private deriveUrgency(
    signals: SessionSignal[],
    insights: SessionInsights,
  ): 'none' | 'low' | 'high' {
    const hasHighSeverityStruggle = signals.some(
      (s) => s.type === 'struggle' && s.severity === 3,
    );
    if (hasHighSeverityStruggle || insights.consecutiveStruggles >= 3) return 'high';

    const hasStruggle = signals.some((s) => s.type === 'struggle' || s.type === 'confusion');
    if (hasStruggle) return 'low';

    return 'none';
  }
}
