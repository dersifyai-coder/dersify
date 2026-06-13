import { Test, TestingModule } from '@nestjs/testing';
import { SignalDetectorService } from './signal-detector.service';
import { AiService } from '../ai/ai.service';
import { initSessionInsights } from './session-insights';

function makeMetrics(overrides: {
  turnIndex?: number;
  topic?: string;
  consecutiveShortMessages?: number;
  baselineResponseTimeMs?: number;
} = {}) {
  return {
    baselineResponseTimeMs: 3000,
    turnIndex: 5,
    topic: 'mathematics',
    consecutiveShortMessages: 0,
    ...overrides,
  };
}

describe('SignalDetectorService', () => {
  let service: SignalDetectorService;
  let aiService: { chatWithSchema: jest.Mock };

  beforeEach(async () => {
    aiService = { chatWithSchema: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignalDetectorService,
        { provide: AiService, useValue: aiService },
      ],
    }).compile();

    service = module.get<SignalDetectorService>(SignalDetectorService);
  });

  describe('confusion detection', () => {
    it('detects confusion from explicit phrase "i don\'t get it"', async () => {
      const insights = initSessionInsights('beginner');
      const result = await service.analyze(
        "i don't get it at all",
        insights,
        makeMetrics({ turnIndex: 2 }),
      );
      const types = result.signals.map((s) => s.type);
      expect(types).toContain('confusion');
    });

    it('detects confusion from "confused"', async () => {
      const insights = initSessionInsights('beginner');
      const result = await service.analyze(
        'I am so confused by this',
        insights,
        makeMetrics({ turnIndex: 2 }),
      );
      expect(result.signals.map((s) => s.type)).toContain('confusion');
    });

    it('does not trigger confusion on a single short message without prior context', async () => {
      const insights = initSessionInsights('beginner');
      const result = await service.analyze(
        'Ok',
        insights,
        makeMetrics({ consecutiveShortMessages: 0, turnIndex: 2 }),
      );
      // disengagement fires for < 4 words, not confusion
      expect(result.signals.map((s) => s.type)).not.toContain('confusion');
    });

    it('triggers confusion when second consecutive short message arrives', async () => {
      const insights = initSessionInsights('beginner');
      // 5 words → ≥4 (no disengagement) and <8 (counts as "short"); with prior short msg → confusion
      const result = await service.analyze(
        'maybe something else perhaps here',
        insights,
        makeMetrics({ consecutiveShortMessages: 1, turnIndex: 3 }),
      );
      expect(result.signals.map((s) => s.type)).toContain('confusion');
    });

    it('uses "current concept" as about when no topic is given (confusion phrase path)', async () => {
      // Also tests that omitting consecutiveShortMessages hits the default-value branch
      const result = await service.analyze(
        "i don't get it at all",
        initSessionInsights('beginner'),
        { baselineResponseTimeMs: 3000, turnIndex: 2 }, // no topic, no consecutiveShortMessages
      );
      expect(result.signals[0]).toMatchObject({ type: 'confusion', about: 'current concept' });
    });

    it('uses "current concept" as about when no topic is given (consecutive-short path)', async () => {
      const result = await service.analyze(
        'maybe something else here', // 4 words, no phrase, consecutiveShortMessages=1
        initSessionInsights('beginner'),
        { baselineResponseTimeMs: 3000, turnIndex: 2, consecutiveShortMessages: 1 }, // no topic
      );
      expect(result.signals[0]).toMatchObject({ type: 'confusion', about: 'current concept' });
    });
  });

  describe('momentum detection', () => {
    it('detects momentum from "i see, makes sense"', async () => {
      const insights = initSessionInsights('intermediate');
      const result = await service.analyze(
        'i see, makes sense now',
        insights,
        makeMetrics({ turnIndex: 4 }),
      );
      expect(result.signals.map((s) => s.type)).toContain('momentum');
    });

    it('detects momentum from "got it"', async () => {
      const insights = initSessionInsights('intermediate');
      const result = await service.analyze('got it!', insights, makeMetrics({ turnIndex: 4 }));
      expect(result.signals.map((s) => s.type)).toContain('momentum');
    });

    it('detects momentum when message is longer than 80 words', async () => {
      const longMessage = Array.from({ length: 85 }, (_, i) => `word${i}`).join(' ');
      const insights = initSessionInsights('intermediate');
      const result = await service.analyze(longMessage, insights, makeMetrics({ turnIndex: 4 }));
      expect(result.signals.map((s) => s.type)).toContain('momentum');
    });

    it('uses "current concept" when no topic is given (momentum phrase path)', async () => {
      const result = await service.analyze(
        'i see makes sense now',
        initSessionInsights('intermediate'),
        { baselineResponseTimeMs: 3000, turnIndex: 2 }, // no topic
      );
      expect(result.signals[0]).toMatchObject({ type: 'momentum', concept: 'current concept' });
    });

    it('uses "current concept" when no topic is given (long-message path)', async () => {
      const longMessage = Array.from({ length: 85 }, (_, i) => `word${i}`).join(' ');
      const result = await service.analyze(
        longMessage,
        initSessionInsights('intermediate'),
        { baselineResponseTimeMs: 3000, turnIndex: 2 }, // no topic
      );
      expect(result.signals[0]).toMatchObject({ type: 'momentum', concept: 'current concept' });
    });
  });

  describe('off_topic detection', () => {
    it('detects off_topic when turnIndex > 3 and no keyword overlap with topic', async () => {
      const insights = initSessionInsights('intermediate');
      const result = await service.analyze(
        'I love going to the beach on weekends',
        insights,
        makeMetrics({ turnIndex: 5, topic: 'calculus derivatives integration' }),
      );
      expect(result.signals.map((s) => s.type)).toContain('off_topic');
    });

    it('does not detect off_topic when turnIndex <= 3', async () => {
      const insights = initSessionInsights('intermediate');
      const result = await service.analyze(
        'I love going to the beach on weekends',
        insights,
        makeMetrics({ turnIndex: 3, topic: 'calculus derivatives integration' }),
      );
      expect(result.signals.map((s) => s.type)).not.toContain('off_topic');
    });

    it('does not detect off_topic when message overlaps with topic keywords', async () => {
      const insights = initSessionInsights('intermediate');
      const result = await service.analyze(
        'How do derivatives work in calculus?',
        insights,
        makeMetrics({ turnIndex: 5, topic: 'calculus derivatives' }),
      );
      expect(result.signals.map((s) => s.type)).not.toContain('off_topic');
    });

    it('treats short-keyword topic (all words ≤ 2 chars) as fully matching — no off_topic', async () => {
      // 'AI' → extractKeywords filters word length > 2 → empty set → computeTopicOverlap returns 1
      // overlap = 1, not < 0.1 → no off_topic even though semantically unrelated
      const result = await service.analyze(
        'I love going to the beach on weekends',
        initSessionInsights('intermediate'),
        makeMetrics({ turnIndex: 5, topic: 'AI' }),
      );
      expect(result.signals.map((s) => s.type)).not.toContain('off_topic');
    });
  });

  describe('disengagement detection', () => {
    it('detects disengagement on empty-like messages', async () => {
      const insights = initSessionInsights('beginner');
      const result = await service.analyze('ok', insights, makeMetrics({ turnIndex: 4 }));
      expect(result.signals.map((s) => s.type)).toContain('disengagement');
    });

    it('detects disengagement on empty string (wordCount === 0 branch)', async () => {
      const insights = initSessionInsights('beginner');
      const result = await service.analyze('', insights, makeMetrics({ turnIndex: 4 }));
      expect(result.signals.map((s) => s.type)).toContain('disengagement');
    });

    it('detects disengagement on punctuation-only messages', async () => {
      const insights = initSessionInsights('beginner');
      const result = await service.analyze('...', insights, makeMetrics({ turnIndex: 4 }));
      expect(result.signals.map((s) => s.type)).toContain('disengagement');
    });
  });

  describe('disengagement detection (emoji/punctuation-only with word count >= 4)', () => {
    it('detects disengagement when message is only emoji with 4+ space-separated tokens', async () => {
      const insights = initSessionInsights('beginner');
      // 4 tokens → wordCount >= 4 (skips first branch), but isOnlyPunctuationOrEmoji → true
      const result = await service.analyze(
        '😀 😎 🎉 💫',
        insights,
        makeMetrics({ turnIndex: 4 }),
      );
      expect(result.signals.map((s) => s.type)).toContain('disengagement');
    });
  });

  describe('struggle detection', () => {
    it('detects struggle when no other signals, short message, and prior struggles exist', async () => {
      const insights = { ...initSessionInsights('beginner'), consecutiveStruggles: 1, consecutiveMomentum: 0 };
      const result = await service.analyze(
        'trying to understand still',  // 4 words, no confusion phrase
        insights,
        makeMetrics({ consecutiveShortMessages: 0, turnIndex: 2 }),
      );
      expect(result.signals.map((s) => s.type)).toContain('struggle');
    });

    it('uses "current concept" as concept when no topic is given', async () => {
      const insights = { ...initSessionInsights('beginner'), consecutiveStruggles: 1, consecutiveMomentum: 0 };
      const result = await service.analyze(
        'trying to understand still',
        insights,
        { baselineResponseTimeMs: 3000, turnIndex: 2 }, // no topic
      );
      expect(result.signals[0]).toMatchObject({ type: 'struggle', concept: 'current concept' });
    });
  });

  describe('breakthrough detection', () => {
    it('detects breakthrough from "aha" phrase when message is longer than 5 words', async () => {
      const insights = initSessionInsights('intermediate');
      const result = await service.analyze(
        'aha I now understand why closures work this way',  // contains "aha", 9 words
        insights,
        makeMetrics({ turnIndex: 2, topic: 'closures' }),
      );
      expect(result.signals.map((s) => s.type)).toContain('breakthrough');
    });

    it('uses "current concept" as concept when no topic is given', async () => {
      const result = await service.analyze(
        'aha I now understand why this works correctly',
        initSessionInsights('intermediate'),
        { baselineResponseTimeMs: 3000, turnIndex: 2 }, // no topic
      );
      expect(result.signals[0]).toMatchObject({ type: 'breakthrough', concept: 'current concept' });
    });
  });

  describe('urgency derivation', () => {
    it('returns urgency=high when consecutiveStruggles >= 3 (even for confusion signal)', async () => {
      const insights = { ...initSessionInsights('beginner'), consecutiveStruggles: 3 };
      const result = await service.analyze(
        "I don't get this at all",
        insights,
        makeMetrics({ turnIndex: 2 }),
      );
      expect(result.urgency).toBe('high');
    });
  });

  describe('AI escalation', () => {
    it('sets requiresAiEscalation=true when two competing signals are detected', async () => {
      // A message that triggers both confusion AND off_topic signals results in competing signals
      const insights = initSessionInsights('intermediate');
      // off_topic fires (turnIndex > 3, no overlap), and we craft a case where both fire
      const result = await service.analyze(
        "I don't get it — also I was thinking about cooking recipes",
        insights,
        makeMetrics({ turnIndex: 5, topic: 'calculus derivatives' }),
      );
      // The result should indicate escalation was needed (even if AI timed out)
      expect(result.requiresAiEscalation).toBe(true);
    });

    it('returns rule-based result when AI escalation times out (fire-and-forget)', async () => {
      aiService.chatWithSchema.mockRejectedValue(new Error('timeout'));

      const insights = initSessionInsights('intermediate');
      // 30-80 words, no topic → no off_topic → signals.length === 0 → isAmbiguous → escalation
      const ambiguousMessage = Array.from({ length: 40 }, (_, i) => `word${i}`).join(' ');
      const result = await service.analyze(
        ambiguousMessage,
        insights,
        makeMetrics({ turnIndex: 4, topic: undefined }),
      );

      // Should not throw — returns gracefully with rule-based or empty signals
      expect(Array.isArray(result.signals)).toBe(true);
    });

    it('uses AI escalation result when AI responds in time', async () => {
      aiService.chatWithSchema.mockResolvedValue({
        signals: [{ type: 'confusion', about: 'algebra' }],
        urgency: 'low',
      });

      const insights = initSessionInsights('intermediate');
      // 30-80 words, no topic → no off_topic signal → signals.length === 0 → isAmbiguous → escalation
      const ambiguousMessage = Array.from({ length: 35 }, (_, i) => `word${i}`).join(' ');
      const result = await service.analyze(
        ambiguousMessage,
        insights,
        makeMetrics({ turnIndex: 4, topic: undefined }),
      );

      expect(result.signals[0]?.type).toBe('confusion');
      expect(result.urgency).toBe('low');
      expect(result.requiresAiEscalation).toBe(false);
    });

    it('timer callback fires to reject signal detection when AI hangs past timeout', async () => {
      jest.useFakeTimers();
      try {
        // Return a promise that never resolves — forces the 4s timer to fire
        aiService.chatWithSchema.mockReturnValue(new Promise(() => {}));

        const ambiguousMessage = Array.from({ length: 40 }, (_, i) => `word${i}`).join(' ');
        const analyzePromise = service.analyze(
          ambiguousMessage,
          initSessionInsights('intermediate'),
          makeMetrics({ turnIndex: 4, topic: undefined }),
        );

        // Fire all pending timers (the 4s signal-detection timeout)
        jest.runAllTimers();

        const result = await analyzePromise;
        expect(Array.isArray(result.signals)).toBe(true);
      } finally {
        jest.useRealTimers();
      }
    });
  });
});
