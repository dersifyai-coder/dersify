import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { AiService } from '../ai/ai.service';
import { AiUnavailableException } from '../ai/exceptions/ai-unavailable.exception';
import { ConceptRegistryService } from '../concept-registry/concept-registry.service';
import { ContextService } from '../context/context.service';
import { ContextBudgetManager } from '../context/context-budget.manager';
import { SignalDetectorService } from '../context/signal-detector.service';
import { initSessionInsights } from '../context/session-insights';
import { LearnerService } from '../learner/learner.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { QUEUE_SESSION_CONSOLIDATION } from '../queue/queue.constants';
import type { ExchangeEvaluationContext } from '../ai/prompts/exchange-evaluation.prompt';
import { SessionService } from './session.service';

const mockPrisma = {
  session: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  sessionMessage: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  learnerKnowledgeState: {
    findFirst: jest.fn(),
  },
  errorEvent: {
    create: jest.fn(),
  },
  $transaction: jest.fn(),
};

const mockAiService = {
  chat: jest.fn(),
  chatWithSchema: jest.fn(),
};

const mockConceptRegistryService = {
  resolveOrCreate: jest.fn(),
};

const mockContextService = {
  buildSystemPrompt: jest.fn(),
};

const mockBudgetManager = {
  estimateTokens: jest.fn().mockReturnValue(10),
  shouldCompress: jest.fn().mockReturnValue(false),
  shouldEndSession: jest.fn().mockReturnValue(false),
  buildCompressionSummary: jest.fn(),
};

const mockSignalDetector = {
  analyze: jest.fn(),
};

const mockLearnerService = {
  getDueConceptsForTopic: jest.fn(),
  invalidateCachesForTopic: jest.fn(),
  upsertKnowledgeState: jest.fn(),
  addMisconception: jest.fn(),
};

const mockRedisService = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
};

const mockSubscriptionService = {
  checkSessionAllowed: jest.fn(),
  checkExchangeAllowed: jest.fn(),
  getTier: jest.fn(),
};

const mockConsolidationQueue = {
  add: jest.fn(),
};

const LEARNER_ID = 'learner-uuid-1234';
const SESSION_ID = 'session-uuid-5678';

function makeSession(overrides = {}) {
  return {
    id: SESSION_ID,
    learnerId: LEARNER_ID,
    topic: 'React hooks',
    priorKnowledgeSignal: 'beginner',
    timeAvailableMinutes: 30,
    currentPhase: 'core',
    currentMode: 'exploration',
    exchangesCount: 0,
    tokenBudgetUsed: 0,
    startedAt: new Date(),
    endedAt: null,
    lastActivityAt: new Date(),
    focusState: null,
    strugglesCount: 0,
    momentumCount: 0,
    conceptsCovered: [],
    ...overrides,
  };
}

describe('SessionService', () => {
  let service: SessionService;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockSubscriptionService.checkSessionAllowed.mockResolvedValue({ allowed: true });
    mockSubscriptionService.checkExchangeAllowed.mockResolvedValue({ allowed: true });
    mockSubscriptionService.getTier.mockResolvedValue('free');
    mockLearnerService.getDueConceptsForTopic.mockResolvedValue([]);
    mockLearnerService.upsertKnowledgeState.mockResolvedValue({});
    mockLearnerService.addMisconception.mockResolvedValue({});
    mockRedisService.get.mockResolvedValue(null);
    mockRedisService.set.mockResolvedValue('OK');
    mockRedisService.del.mockResolvedValue(1);
    mockAiService.chat.mockResolvedValue('Hello! Let us dive into React hooks.');
    mockAiService.chatWithSchema.mockResolvedValue({
      conceptId: 'react-hooks',
      retentionQuality: 3,
      understandingSignal: 'partial',
      misconceptionDetected: { found: false },
    });
    mockConceptRegistryService.resolveOrCreate.mockResolvedValue({
      canonicalId: 'react.react-hooks',
      isNew: false,
      merged: false,
    });
    mockPrisma.errorEvent.create.mockResolvedValue({});
    mockContextService.buildSystemPrompt.mockResolvedValue({
      systemPrompt: 'You are Dersify...',
      conversationHistory: [],
    });
    mockSignalDetector.analyze.mockResolvedValue({ signals: [], urgency: 'none', requiresAiEscalation: false });
    mockPrisma.$transaction.mockImplementation((ops: unknown[]) =>
      Promise.all((ops as Array<Promise<unknown>>).map((op) => op)),
    );
    mockPrisma.sessionMessage.findMany.mockResolvedValue([]);
    mockPrisma.session.update.mockResolvedValue(makeSession());
    mockConsolidationQueue.add.mockResolvedValue({ id: 'job-1' });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AiService, useValue: mockAiService },
        { provide: ConceptRegistryService, useValue: mockConceptRegistryService },
        { provide: ContextService, useValue: mockContextService },
        { provide: ContextBudgetManager, useValue: mockBudgetManager },
        { provide: SignalDetectorService, useValue: mockSignalDetector },
        { provide: LearnerService, useValue: mockLearnerService },
        { provide: RedisService, useValue: mockRedisService },
        { provide: SubscriptionService, useValue: mockSubscriptionService },
        {
          provide: getQueueToken(QUEUE_SESSION_CONSOLIDATION),
          useValue: mockConsolidationQueue,
        },
      ],
    }).compile();

    service = module.get<SessionService>(SessionService);
  });

  // ─── startSession ──────────────────────────────────────────────────────────

  describe('startSession', () => {
    it('creates a session row and initializes SessionInsights in Redis', async () => {
      mockPrisma.session.findFirst.mockResolvedValue(null);
      mockPrisma.learnerKnowledgeState.findFirst.mockResolvedValue(null);
      const createdSession = makeSession();
      mockPrisma.session.create.mockResolvedValue(createdSession);
      mockPrisma.sessionMessage.create.mockResolvedValue({});

      await service.startSession(LEARNER_ID, {
        topic: 'React hooks',
        prior_knowledge_signal: 'beginner',
        time_available_minutes: 30,
      });

      expect(mockPrisma.session.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ learnerId: LEARNER_ID, topic: 'React hooks' }),
        }),
      );
      expect(mockRedisService.set).toHaveBeenCalledWith(
        `dersify:insights:${SESSION_ID}`,
        expect.any(String),
        expect.any(Number),
      );
    });

    it('returns resumeType=continue if session active within 2h', async () => {
      const recentSession = makeSession({ endedAt: null, lastActivityAt: new Date() });
      mockPrisma.session.findFirst.mockResolvedValue(recentSession);
      mockPrisma.sessionMessage.findFirst.mockResolvedValue({
        content: 'Last AI message',
        turnIndex: 0,
        role: 'assistant',
      });

      const result = await service.startSession(LEARNER_ID, {
        topic: 'React hooks',
        prior_knowledge_signal: 'beginner',
        time_available_minutes: 30,
      });

      expect(result.resumeType).toBe('continue');
      expect(result.sessionId).toBe(SESSION_ID);
      expect(mockPrisma.session.create).not.toHaveBeenCalled();
    });

    it('returns resumeType=smart if session is 2-24h old', async () => {
      const staleMs = 3 * 60 * 60 * 1000; // 3h
      const oldSession = makeSession({
        lastActivityAt: new Date(Date.now() - staleMs),
        endedAt: new Date(Date.now() - staleMs),
      });
      mockPrisma.session.findFirst.mockResolvedValue(oldSession);
      mockPrisma.sessionMessage.findMany.mockResolvedValue([]);
      mockBudgetManager.buildCompressionSummary.mockResolvedValue('Summary of last session');

      const result = await service.startSession(LEARNER_ID, {
        topic: 'React hooks',
        prior_knowledge_signal: 'beginner',
        time_available_minutes: 30,
      });

      expect(result.resumeType).toBe('smart');
      expect(result.sessionId).toBe(SESSION_ID);
      expect(mockPrisma.session.create).not.toHaveBeenCalled();
    });

    it('creates a new session if prior session is >24h old', async () => {
      const veryOldMs = 25 * 60 * 60 * 1000;
      const oldSession = makeSession({
        lastActivityAt: new Date(Date.now() - veryOldMs),
      });
      mockPrisma.session.findFirst.mockResolvedValue(oldSession);
      mockPrisma.learnerKnowledgeState.findFirst.mockResolvedValue(null);
      const createdSession = makeSession({ id: 'new-session-id' });
      mockPrisma.session.create.mockResolvedValue(createdSession);
      mockPrisma.sessionMessage.create.mockResolvedValue({});

      const result = await service.startSession(LEARNER_ID, {
        topic: 'React hooks',
        prior_knowledge_signal: 'beginner',
        time_available_minutes: 30,
      });

      expect(result.resumeType).toBe('new');
      expect(mockPrisma.session.create).toHaveBeenCalled();
    });

    it('creates a new session if no prior session exists', async () => {
      mockPrisma.session.findFirst.mockResolvedValue(null);
      mockPrisma.learnerKnowledgeState.findFirst.mockResolvedValue(null);
      mockPrisma.session.create.mockResolvedValue(makeSession());
      mockPrisma.sessionMessage.create.mockResolvedValue({});

      const result = await service.startSession(LEARNER_ID, {
        topic: 'React hooks',
        prior_knowledge_signal: 'none',
        time_available_minutes: 30,
      });

      expect(result.resumeType).toBe('new');
      expect(mockPrisma.session.create).toHaveBeenCalled();
    });

    it('skips activation phase for first session on topic (no prior knowledge states)', async () => {
      mockPrisma.session.findFirst.mockResolvedValue(null);
      mockPrisma.learnerKnowledgeState.findFirst.mockResolvedValue(null);
      mockPrisma.session.create.mockResolvedValue(makeSession({ currentPhase: 'core' }));
      mockPrisma.sessionMessage.create.mockResolvedValue({});

      const result = await service.startSession(LEARNER_ID, {
        topic: 'React hooks',
        prior_knowledge_signal: 'none',
        time_available_minutes: 30,
      });

      expect(result.phase).toBe('core');
      expect(mockPrisma.session.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ currentPhase: 'core' }),
        }),
      );
    });
  });

  // ─── sendMessage ───────────────────────────────────────────────────────────

  describe('sendMessage', () => {
    it('saves both user and AI message to session_messages', async () => {
      mockPrisma.session.findUnique.mockResolvedValue(makeSession());
      mockPrisma.sessionMessage.findMany.mockResolvedValue([]);
      const savedMessages: unknown[] = [];
      mockPrisma.$transaction.mockImplementation(async (ops: unknown[]) => {
        for (const op of ops as Array<Promise<unknown>>) {
          savedMessages.push(await op);
        }
        return savedMessages;
      });
      mockPrisma.sessionMessage.create.mockImplementation(
        ({ data }: { data: unknown }) => Promise.resolve(data),
      );
      mockPrisma.session.update.mockResolvedValue(makeSession({ exchangesCount: 1 }));

      await service.sendMessage(LEARNER_ID, SESSION_ID, { content: 'What are hooks?' });

      const createCalls = (mockPrisma.sessionMessage.create.mock as jest.Mock['mock']).calls as Array<[{ data: { role: string } }]>;
      const roles = createCalls.map(([arg]) => arg.data.role);
      expect(roles).toContain('user');
      expect(roles).toContain('assistant');
    });

    it('updates exchangesCount on each send', async () => {
      mockPrisma.session.findUnique.mockResolvedValue(makeSession({ exchangesCount: 2 }));
      mockPrisma.sessionMessage.findMany.mockResolvedValue([]);
      mockPrisma.session.update.mockResolvedValue(makeSession({ exchangesCount: 3 }));

      const result = await service.sendMessage(LEARNER_ID, SESSION_ID, { content: 'Tell me more' });

      expect(result.exchangesCount).toBe(3);
    });

    it('calls SignalDetector and updates SessionInsights', async () => {
      mockPrisma.session.findUnique.mockResolvedValue(makeSession());
      mockPrisma.sessionMessage.findMany.mockResolvedValue([]);
      const insights = initSessionInsights('beginner');
      mockRedisService.get.mockResolvedValue(JSON.stringify(insights));
      mockSignalDetector.analyze.mockResolvedValue({
        signals: [{ type: 'momentum', concept: 'hooks' }],
        urgency: 'none',
        requiresAiEscalation: false,
      });

      await service.sendMessage(LEARNER_ID, SESSION_ID, { content: 'I see, got it!' });

      expect(mockSignalDetector.analyze).toHaveBeenCalledWith(
        'I see, got it!',
        expect.objectContaining({ selfReportedLevel: 'beginner' }),
        expect.any(Object),
      );
      expect(mockRedisService.set).toHaveBeenCalledWith(
        `dersify:insights:${SESSION_ID}`,
        expect.stringContaining('"momentumSignals":1'),
        expect.any(Number),
      );
    });

    it('throws ForbiddenException if session belongs to a different learner', async () => {
      mockPrisma.session.findUnique.mockResolvedValue(makeSession({ learnerId: 'other-learner' }));

      await expect(
        service.sendMessage(LEARNER_ID, SESSION_ID, { content: 'Hello' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('triggers phase transition to consolidation at 85% of time', async () => {
      const startedAt = new Date(Date.now() - 26 * 60 * 1000); // 26 min elapsed, 30 min total = 86%
      mockPrisma.session.findUnique.mockResolvedValue(
        makeSession({ startedAt, timeAvailableMinutes: 30, currentPhase: 'core' }),
      );
      mockPrisma.sessionMessage.findMany.mockResolvedValue([]);
      mockPrisma.session.update.mockResolvedValue(makeSession({ currentPhase: 'consolidation' }));

      const result = await service.sendMessage(LEARNER_ID, SESSION_ID, {
        content: 'Let me try to explain this back',
      });

      expect(result.phase).toBe('consolidation');
    });
  });

  // ─── endSession ────────────────────────────────────────────────────────────

  const MOCK_SUMMARY = {
    title: 'React hooks: managing state',
    whatWeCovered: ['You explored how useState works.'],
    whatYouHave: ['You can correctly use useState to track values.'],
    nextFocus: ['Practice useEffect with a real dependency array.'],
    estimatedRetention: 72,
  };

  describe('endSession', () => {
    it('sets endedAt, deletes Redis insights, and returns summary', async () => {
      mockPrisma.session.findUnique.mockResolvedValue(makeSession());
      mockAiService.chatWithSchema.mockResolvedValue(MOCK_SUMMARY);

      const result = await service.endSession(LEARNER_ID, SESSION_ID);

      expect(mockPrisma.session.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ endedAt: expect.any(Date) }),
        }),
      );
      expect(mockRedisService.del).toHaveBeenCalledWith(`dersify:insights:${SESSION_ID}`);
      expect(result.summary).toMatchObject(MOCK_SUMMARY);
    });

    it('includes consolidation question when phase is not consolidation and concepts exist', async () => {
      const insightsWithConcepts = {
        ...initSessionInsights('beginner'),
        conceptsEngaged: ['useState'],
        calibrationDelta: 0,
      };
      mockRedisService.get.mockResolvedValue(JSON.stringify(insightsWithConcepts));
      mockPrisma.session.findUnique.mockResolvedValue(makeSession({ currentPhase: 'core' }));
      mockAiService.chatWithSchema.mockResolvedValue(MOCK_SUMMARY);
      mockAiService.chat.mockResolvedValue('How would you explain useState to a beginner?');

      const result = await service.endSession(LEARNER_ID, SESSION_ID);

      expect(result.consolidationQuestion).toBe('How would you explain useState to a beginner?');
    });

    it('returns null consolidation question when phase is consolidation', async () => {
      mockPrisma.session.findUnique.mockResolvedValue(makeSession({ currentPhase: 'consolidation' }));
      mockAiService.chatWithSchema.mockResolvedValue(MOCK_SUMMARY);

      const result = await service.endSession(LEARNER_ID, SESSION_ID);

      expect(result.consolidationQuestion).toBeNull();
    });

    it('throws ConflictException when session is already ended', async () => {
      mockPrisma.session.findUnique.mockResolvedValue(makeSession({ endedAt: new Date() }));

      await expect(service.endSession(LEARNER_ID, SESSION_ID)).rejects.toThrow(ConflictException);
    });

    it('throws NotFoundException for unknown session', async () => {
      mockPrisma.session.findUnique.mockResolvedValue(null);

      await expect(service.endSession(LEARNER_ID, SESSION_ID)).rejects.toThrow(NotFoundException);
    });

    it('enqueues consolidation job with topic, calibrationDelta, and conceptsEngaged', async () => {
      mockPrisma.session.findUnique.mockResolvedValue(makeSession());
      mockAiService.chatWithSchema.mockResolvedValue(MOCK_SUMMARY);

      await service.endSession(LEARNER_ID, SESSION_ID);

      expect(mockConsolidationQueue.add).toHaveBeenCalledWith(
        'consolidate',
        expect.objectContaining({
          sessionId: SESSION_ID,
          learnerId: LEARNER_ID,
          topic: 'React hooks',
          calibrationDelta: expect.any(Number),
          conceptsEngaged: expect.any(Array),
        }),
        expect.any(Object),
      );
    });
  });

  // ─── evaluateExchange ──────────────────────────────────────────────────────

  describe('evaluateExchange', () => {
    const baseContext: ExchangeEvaluationContext = {
      topic: 'React hooks',
      conceptInFocus: 'useState',
      sessionPhase: 'core',
      aiMessage: 'What does useState return?',
      learnerResponse: 'An array with a value and a setter.',
    };
    const baseInsights = initSessionInsights('beginner');

    it('calls upsertKnowledgeState with the resolved conceptId and correct FSRS rating', async () => {
      mockAiService.chatWithSchema.mockResolvedValue({
        conceptId: 'usestate-hook',
        retentionQuality: 4,
        understandingSignal: 'confirmed',
        misconceptionDetected: { found: false },
      });
      mockConceptRegistryService.resolveOrCreate.mockResolvedValue({
        canonicalId: 'react.usestate-hook',
        isNew: false,
        merged: false,
      });

      await service.evaluateExchange(LEARNER_ID, SESSION_ID, baseContext, baseInsights);

      expect(mockConceptRegistryService.resolveOrCreate).toHaveBeenCalledWith(
        'usestate-hook',
        'React hooks',
      );
      expect(mockLearnerService.upsertKnowledgeState).toHaveBeenCalledWith(
        LEARNER_ID,
        'react.usestate-hook',
        'React hooks',
        4,
      );
    });

    it('calls addMisconception when misconceptionDetected.found is true', async () => {
      mockAiService.chatWithSchema.mockResolvedValue({
        conceptId: 'usestate-hook',
        retentionQuality: 2,
        understandingSignal: 'confused',
        misconceptionDetected: {
          found: true,
          concept: 'useState',
          description: 'Learner thinks useState is asynchronous',
          severity: 'surface',
          type: 'overgeneralization',
        },
      });
      mockConceptRegistryService.resolveOrCreate.mockResolvedValue({
        canonicalId: 'react.usestate-hook',
        isNew: false,
        merged: false,
      });

      await service.evaluateExchange(LEARNER_ID, SESSION_ID, baseContext, baseInsights);

      expect(mockLearnerService.addMisconception).toHaveBeenCalledWith(
        LEARNER_ID,
        expect.objectContaining({
          conceptId: 'react.usestate-hook',
          topic: 'React hooks',
          description: 'Learner thinks useState is asynchronous',
          misconceptionType: 'overgeneralization',
        }),
      );
    });

    it('does NOT call addMisconception when misconceptionDetected.found is false', async () => {
      await service.evaluateExchange(LEARNER_ID, SESSION_ID, baseContext, baseInsights);

      expect(mockLearnerService.addMisconception).not.toHaveBeenCalled();
    });

    it('resolves conceptId through ConceptRegistryService before any DB write', async () => {
      const callOrder: string[] = [];
      mockConceptRegistryService.resolveOrCreate.mockImplementation(async () => {
        callOrder.push('resolveOrCreate');
        return { canonicalId: 'react.concept', isNew: false, merged: false };
      });
      mockLearnerService.upsertKnowledgeState.mockImplementation(async () => {
        callOrder.push('upsertKnowledgeState');
        return {};
      });

      await service.evaluateExchange(LEARNER_ID, SESSION_ID, baseContext, baseInsights);

      expect(callOrder.indexOf('resolveOrCreate')).toBeLessThan(
        callOrder.indexOf('upsertKnowledgeState'),
      );
    });

    it('inserts an ErrorEvent row with the correct fields', async () => {
      mockAiService.chatWithSchema.mockResolvedValue({
        conceptId: 'usestate-hook',
        retentionQuality: 1,
        understandingSignal: 'confused',
        misconceptionDetected: { found: false },
      });
      mockConceptRegistryService.resolveOrCreate.mockResolvedValue({
        canonicalId: 'react.usestate-hook',
        isNew: false,
        merged: false,
      });

      await service.evaluateExchange(LEARNER_ID, SESSION_ID, baseContext, baseInsights);

      expect(mockPrisma.errorEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            sessionId: SESSION_ID,
            learnerId: LEARNER_ID,
            conceptId: 'react.usestate-hook',
            topic: 'React hooks',
            understandingSignal: 'confused',
            retentionQuality: 1,
            errorType: 'recall_failure',
          }),
        }),
      );
    });

    it('updates demonstratedLevel in SessionInsights using weighted average', async () => {
      const insights = { ...baseInsights, demonstratedLevel: 0 };
      // retentionQuality 4 → scale 5; newDemonstrated = 0 * 0.7 + 5 * 0.3 = 1.5
      mockAiService.chatWithSchema.mockResolvedValue({
        conceptId: 'hooks',
        retentionQuality: 4,
        understandingSignal: 'confirmed',
        misconceptionDetected: { found: false },
      });

      await service.evaluateExchange(LEARNER_ID, SESSION_ID, baseContext, insights);

      const savedInsights = JSON.parse(
        (mockRedisService.set.mock as jest.Mock['mock']).calls.at(-1)?.[1] as string,
      ) as { demonstratedLevel: number };
      expect(savedInsights.demonstratedLevel).toBeCloseTo(1.5);
    });

    it('does NOT throw when AiService throws AiUnavailableException (graceful degradation)', async () => {
      mockAiService.chatWithSchema.mockRejectedValue(
        new AiUnavailableException('Both providers failed'),
      );

      await expect(
        service.evaluateExchange(LEARNER_ID, SESSION_ID, baseContext, baseInsights),
      ).resolves.toBeUndefined();

      expect(mockLearnerService.upsertKnowledgeState).not.toHaveBeenCalled();
      expect(mockPrisma.errorEvent.create).not.toHaveBeenCalled();
    });

    it('sendMessage does not await evaluateExchange (fire-and-forget confirmed)', async () => {
      // chatWithSchema hangs — if sendMessage awaited it, this test would never resolve
      mockAiService.chatWithSchema.mockReturnValue(new Promise<never>(() => { /* never resolves */ }));

      mockPrisma.session.findUnique.mockResolvedValue(makeSession());
      mockPrisma.sessionMessage.findMany.mockResolvedValue([]);

      await expect(
        service.sendMessage(LEARNER_ID, SESSION_ID, { content: 'What are hooks?' }),
      ).resolves.toBeDefined();
    });
  });
});
