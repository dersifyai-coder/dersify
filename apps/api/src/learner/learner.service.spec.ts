import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { LearnerService } from './learner.service';
import { PrismaService } from '../prisma/prisma.service';
import { AddMisconceptionDto, MisconceptionType } from './dto/add-misconception.dto';

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
  };

  beforeEach(async () => {
    prisma = {
      learnerKnowledgeState: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
        findMany: jest.fn(),
      },
      misconception: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      profile: {
        findUniqueOrThrow: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LearnerService,
        { provide: PrismaService, useValue: prisma },
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
    const dto: AddMisconceptionDto = {
      conceptId: 'math.algebra.linear-equations-abc',
      topic: 'math',
      description: 'Confused about negative sign',
      misconceptionType: MisconceptionType.Terminology,
    };

    it('increments frequency on duplicate', async () => {
      const existing = makeMisconceptionRow({ frequency: 2 });
      prisma.misconception.findFirst.mockResolvedValue(existing);
      const updated = { ...existing, frequency: 3 };
      prisma.misconception.update.mockResolvedValue(updated);

      const result = await service.addMisconception('learner-uuid', dto);

      expect(prisma.misconception.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { frequency: { increment: 1 } },
        }),
      );
      expect(result.frequency).toBe(3);
    });

    it('creates new misconception when no duplicate exists', async () => {
      prisma.misconception.findFirst.mockResolvedValue(null);
      const created = makeMisconceptionRow();
      prisma.misconception.create.mockResolvedValue(created);

      await service.addMisconception('learner-uuid', dto);

      expect(prisma.misconception.create).toHaveBeenCalledTimes(1);
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
});
