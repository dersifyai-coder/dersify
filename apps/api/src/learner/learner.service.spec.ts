import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { LearnerService } from './learner.service';
import { PrismaService } from '../prisma/prisma.service';
import { MisconceptionService, MisconceptionData } from './misconception.service';

function makeStateRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'state-uuid',
    learnerId: 'learner-uuid',
    conceptId: 'math.algebra.linear-equations-abc',
    topic: 'math',
    stability: 0,
    difficulty: 0.3,
    elapsedDays: 0,
    scheduledDays: 0,
    reps: 0,
    lapses: 0,
    fsrsState: 0,
    due: new Date(),
    confidence: 0,
    lastReviewedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    concept: {
      canonicalId: 'math.algebra.linear-equations-abc',
      displayName: 'Linear Equations',
      topic: 'math',
      sessionCount: 3,
    },
    ...overrides,
  };
}

function makeMisconceptionRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'misconception-uuid',
    learnerId: 'learner-uuid',
    conceptId: 'math.algebra.linear-equations-abc',
    topic: 'math',
    description: 'Confused about negative sign',
    misconceptionType: 'terminology',
    severity: 'surface',
    remediationStrategy: null,
    frequency: 1,
    resolved: false,
    resolvedInSession: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('LearnerService', () => {
  let service: LearnerService;
  let prisma: {
    learnerKnowledgeState: jest.Mocked<Record<string, jest.Mock>>;
    misconception: jest.Mocked<Record<string, jest.Mock>>;
    profile: jest.Mocked<Record<string, jest.Mock>>;
    session: jest.Mocked<Record<string, jest.Mock>>;
  };
  let misconceptionService: { addOrUpdateMisconception: jest.Mock };

  beforeEach(async () => {
    prisma = {
      learnerKnowledgeState: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
        findMany: jest.fn(),
      },
      misconception: {
        findMany: jest.fn(),
        update: jest.fn(),
      },
      profile: {
        findUniqueOrThrow: jest.fn(),
      },
      session: {
        count: jest.fn(),
        findFirst: jest.fn(),
      },
    };

    misconceptionService = { addOrUpdateMisconception: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LearnerService,
        { provide: PrismaService, useValue: prisma },
        { provide: MisconceptionService, useValue: misconceptionService },
      ],
    }).compile();

    service = module.get<LearnerService>(LearnerService);
  });

  describe('upsertKnowledgeState', () => {
    const LEARNER = 'learner-uuid';
    const CONCEPT = 'math.algebra.linear-equations-abc';
    const NOW = new Date('2026-01-01T12:00:00Z');

    it('creates new state if none exists', async () => {
      prisma.learnerKnowledgeState.findUnique.mockResolvedValue(null);
      const created = makeStateRow({ reps: 1, fsrsState: 2 });
      prisma.learnerKnowledgeState.upsert.mockResolvedValue(created);

      const result = await service.upsertKnowledgeState(LEARNER, CONCEPT, 'math', 3, NOW);

      expect(prisma.learnerKnowledgeState.upsert).toHaveBeenCalledTimes(1);
      const upsertArg = prisma.learnerKnowledgeState.upsert.mock.calls[0][0];
      expect(upsertArg.create.learnerId).toBe(LEARNER);
      expect(upsertArg.create.conceptId).toBe(CONCEPT);
      expect(result.reps).toBe(1);
    });

    it('updates existing state with FSRS result', async () => {
      const existing = makeStateRow({ reps: 1, fsrsState: 2, stability: 4.1543 });
      prisma.learnerKnowledgeState.findUnique.mockResolvedValue(existing);
      const updated = makeStateRow({ reps: 2, fsrsState: 2, stability: 100 });
      prisma.learnerKnowledgeState.upsert.mockResolvedValue(updated);

      const result = await service.upsertKnowledgeState(LEARNER, CONCEPT, 'math', 4, NOW);

      const upsertArg = prisma.learnerKnowledgeState.upsert.mock.calls[0][0];
      expect(upsertArg.update.reps).toBe(2);
      expect(result.reps).toBe(2);
    });
  });

  describe('getTopicKnowledgeSummary', () => {
    it('correctly partitions states by confidence threshold', async () => {
      const high = makeStateRow({ confidence: 0.8, fsrsState: 2 });
      const mid = makeStateRow({ id: 'mid', confidence: 0.45, fsrsState: 2 });
      const low = makeStateRow({ id: 'low', confidence: 0.1, fsrsState: 1 });
      prisma.learnerKnowledgeState.findMany.mockResolvedValue([high, mid, low]);

      const summary = await service.getTopicKnowledgeSummary('learner-uuid', 'math');

      expect(summary.confirmed).toHaveLength(1);
      expect(summary.confirmed[0].confidence).toBe(0.8);

      expect(summary.shaky).toHaveLength(1);
      expect(summary.shaky[0].confidence).toBe(0.45);

      expect(summary.newConcepts).toHaveLength(1);
      expect(summary.newConcepts[0].confidence).toBe(0.1);
    });
  });

  describe('addMisconception', () => {
    const data: MisconceptionData = {
      conceptId: 'math.algebra.linear-equations-abc',
      topic: 'math',
      description: 'Confused about negative sign',
      misconceptionType: 'terminology',
    };

    it('delegates to MisconceptionService.addOrUpdateMisconception', async () => {
      const row = makeMisconceptionRow();
      misconceptionService.addOrUpdateMisconception.mockResolvedValue(row);

      const result = await service.addMisconception('learner-uuid', data);

      expect(misconceptionService.addOrUpdateMisconception).toHaveBeenCalledWith(
        'learner-uuid',
        data,
      );
      expect(result.id).toBe('misconception-uuid');
    });

    it('invalidates the Layer 1 cache for the topic after adding', async () => {
      const row = makeMisconceptionRow();
      misconceptionService.addOrUpdateMisconception.mockResolvedValue(row);

      await service.addMisconception('learner-uuid', data);

      // Verify cache is cleared: a subsequent getActiveMisconceptions call should hit the DB
      prisma.misconception.findMany.mockResolvedValue([row]);
      await service.getActiveMisconceptions('learner-uuid', 'math');
      expect(prisma.misconception.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('resolveMisconception', () => {
    it('throws NotFoundException when misconception does not exist', async () => {
      const { PrismaClientKnownRequestError } = jest.requireActual('@prisma/client/runtime/library');
      prisma.misconception.update.mockRejectedValue(
        new PrismaClientKnownRequestError('Not found', { code: 'P2025', clientVersion: '5.0.0' }),
      );

      await expect(
        service.resolveMisconception('learner-uuid', 'bad-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getProgressDashboard', () => {
    const LEARNER = 'learner-uuid';
    const PAST = new Date('2000-01-01T00:00:00Z');
    const FUTURE_FAR = new Date('2099-01-01T00:00:00Z');
    const LAST_REVIEWED = new Date('2026-01-14T12:00:00Z');

    function makeProgressState(overrides: Record<string, unknown> = {}) {
      return makeStateRow({
        reps: 1,
        fsrsState: 2,
        confidence: 0.8,
        due: FUTURE_FAR,
        lastReviewedAt: LAST_REVIEWED,
        ...overrides,
      });
    }

    function mockSessionAndProfile(sessionCount = 0, lastSessionAt: Date | null = null) {
      prisma.session.count.mockResolvedValue(sessionCount);
      prisma.session.findFirst.mockResolvedValue(lastSessionAt ? { startedAt: lastSessionAt } : null);
      prisma.profile.findUniqueOrThrow.mockResolvedValue({ calibrationScore: 0.1 });
    }

    it('returns empty topics array for brand new learner', async () => {
      prisma.learnerKnowledgeState.findMany.mockResolvedValue([]);
      mockSessionAndProfile(0, null);

      const result = await service.getProgressDashboard(LEARNER);

      expect(result.topics).toHaveLength(0);
      expect(result.dueToday).toHaveLength(0);
      expect(result.totalConceptsLearned).toBe(0);
      expect(result.totalSessions).toBe(0);
      expect(result.lastSessionAt).toBeNull();
    });

    it('forgettingCurveHealth = 100 when all concepts are safe', async () => {
      const safeState = makeProgressState({ confidence: 0.9, due: FUTURE_FAR, fsrsState: 2, reps: 1 });
      prisma.learnerKnowledgeState.findMany.mockResolvedValue([safeState]);
      mockSessionAndProfile(1, LAST_REVIEWED);

      const result = await service.getProgressDashboard(LEARNER);

      expect(result.topics[0].forgettingCurveHealth).toBe(100);
      expect(result.topics[0].safeCount).toBe(1);
      expect(result.topics[0].newCount).toBe(0);
    });

    it('forgettingCurveHealth = 0 when all concepts are new', async () => {
      const newState = makeProgressState({ fsrsState: 0, reps: 0, confidence: 0.0, due: FUTURE_FAR });
      prisma.learnerKnowledgeState.findMany.mockResolvedValue([newState]);
      mockSessionAndProfile(0, null);

      const result = await service.getProgressDashboard(LEARNER);

      expect(result.topics[0].forgettingCurveHealth).toBe(0);
      expect(result.topics[0].newCount).toBe(1);
      expect(result.topics[0].safeCount).toBe(0);
    });

    it('groups concepts by due status correctly', async () => {
      const safeState = makeProgressState({ id: 'safe', confidence: 0.9, due: FUTURE_FAR, fsrsState: 2, reps: 1 });
      const slippingState = makeProgressState({ id: 'slip', confidence: 0.45, due: FUTURE_FAR, fsrsState: 2, reps: 1 });
      const dueState = makeProgressState({ id: 'due', confidence: 0.5, due: PAST, fsrsState: 2, reps: 1 });
      const newState = makeProgressState({ id: 'new', fsrsState: 0, reps: 0, confidence: 0.0 });

      prisma.learnerKnowledgeState.findMany.mockResolvedValue([safeState, slippingState, dueState, newState]);
      mockSessionAndProfile(2, LAST_REVIEWED);

      const result = await service.getProgressDashboard(LEARNER);

      const topic = result.topics[0];
      expect(topic.safeCount).toBe(1);
      expect(topic.slippingCount).toBe(1);
      expect(topic.dueCount).toBe(1);
      expect(topic.newCount).toBe(1);
    });

    it('dueToday includes only concepts with due <= today across all topics', async () => {
      const dueMath = makeProgressState({
        id: 'due-math',
        topic: 'math',
        due: PAST,
        fsrsState: 2,
        reps: 1,
      });
      const notDueMath = makeProgressState({
        id: 'notdue-math',
        topic: 'math',
        due: FUTURE_FAR,
        fsrsState: 2,
        reps: 1,
      });
      const duePhysics = makeProgressState({
        id: 'due-physics',
        topic: 'physics',
        conceptId: 'physics.velocity',
        concept: { canonicalId: 'physics.velocity', displayName: 'Velocity', topic: 'physics', sessionCount: 1 },
        due: PAST,
        fsrsState: 2,
        reps: 1,
      });

      prisma.learnerKnowledgeState.findMany.mockResolvedValue([dueMath, notDueMath, duePhysics]);
      mockSessionAndProfile(1, LAST_REVIEWED);

      const result = await service.getProgressDashboard(LEARNER);

      expect(result.dueToday).toHaveLength(2);
      const dueTopics = result.dueToday.map((d) => d.topic).sort();
      expect(dueTopics).toEqual(['math', 'physics']);
    });
  });
});
