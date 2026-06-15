import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { AiService } from '../ai/ai.service';
import { ContextService } from '../context/context.service';
import { ContextBudgetManager } from '../context/context-budget.manager';
import { SignalDetectorService } from '../context/signal-detector.service';
import { initSessionInsights } from '../context/session-insights';
import { LearnerService } from '../learner/learner.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { QUEUE_SESSION_CONSOLIDATION } from '../queue/queue.constants';
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
  $transaction: jest.fn(),
};

const mockAiService = {
  chat: jest.fn(),
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
    mockRedisService.get.mockResolvedValue(null);
    mockRedisService.set.mockResolvedValue('OK');
    mockRedisService.del.mockResolvedValue(1);
    mockAiService.chat.mockResolvedValue('Hello! Let us dive into React hooks.');
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

  describe('endSession', () => {
    it('sets endedAt and deletes Redis insights', async () => {
      mockPrisma.session.findUnique.mockResolvedValue(makeSession());

      await service.endSession(LEARNER_ID, SESSION_ID);

      expect(mockPrisma.session.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ endedAt: expect.any(Date) }),
        }),
      );
      expect(mockRedisService.del).toHaveBeenCalledWith(`dersify:insights:${SESSION_ID}`);
    });

    it('throws NotFoundException for unknown session', async () => {
      mockPrisma.session.findUnique.mockResolvedValue(null);

      await expect(service.endSession(LEARNER_ID, SESSION_ID)).rejects.toThrow(NotFoundException);
    });
  });
});
