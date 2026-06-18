import { Test, TestingModule } from '@nestjs/testing';
import { MisconceptionService, MisconceptionData } from './misconception.service';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { AiUnavailableException } from '../ai/exceptions/ai-unavailable.exception';

function makeMisconceptionRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'misconception-uuid',
    learnerId: 'learner-uuid',
    conceptId: 'python.lists.mutability',
    topic: 'python',
    description: 'Learner confused list mutability with tuple immutability',
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

const BASE_DATA: MisconceptionData = {
  conceptId: 'python.lists.mutability',
  topic: 'python',
  description: 'Learner confused list mutability with tuple immutability',
  misconceptionType: 'terminology',
};

describe('MisconceptionService', () => {
  let service: MisconceptionService;
  let prisma: {
    conceptRegistry: { findUnique: jest.Mock };
    misconception: {
      findMany: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };
  let aiService: { chatWithSchema: jest.Mock };

  beforeEach(async () => {
    prisma = {
      conceptRegistry: { findUnique: jest.fn() },
      misconception: {
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    aiService = { chatWithSchema: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MisconceptionService,
        { provide: PrismaService, useValue: prisma },
        { provide: AiService, useValue: aiService },
      ],
    }).compile();

    service = module.get<MisconceptionService>(MisconceptionService);
  });

  describe('generateRemediation', () => {
    const ctx = {
      topic: 'python',
      conceptId: 'python.lists.mutability',
      conceptDisplayName: 'List Mutability',
      learnerStatement: 'Lists are immutable just like tuples.',
      aiCorrection: 'Lists are mutable — you can change their contents.',
    };

    it('returns a valid MisconceptionDetail on AI success', async () => {
      const aiResult = {
        misconceptionType: 'terminology',
        description: 'Learner confused list mutability with tuple immutability.',
        severity: 'surface',
        remediationStrategy:
          'Ask the learner to modify a list element in the REPL and observe the result before explaining.',
      };
      aiService.chatWithSchema.mockResolvedValue(aiResult);

      const result = await service.generateRemediation(ctx);

      expect(result).toEqual(aiResult);
      expect(aiService.chatWithSchema).toHaveBeenCalledWith(
        'misconception_detection',
        expect.any(Array),
        expect.any(Object),
      );
    });

    it('returns null gracefully when AiService throws AiUnavailableException', async () => {
      aiService.chatWithSchema.mockRejectedValue(
        new AiUnavailableException('Both providers failed'),
      );

      const result = await service.generateRemediation(ctx);

      expect(result).toBeNull();
    });

    it('rethrows non-AI errors', async () => {
      aiService.chatWithSchema.mockRejectedValue(new Error('Unexpected network error'));

      await expect(service.generateRemediation(ctx)).rejects.toThrow('Unexpected network error');
    });
  });

  describe('addOrUpdateMisconception', () => {
    beforeEach(() => {
      prisma.conceptRegistry.findUnique.mockResolvedValue({ displayName: 'List Mutability' });
    });

    it('inserts a new row when no similar misconception exists', async () => {
      prisma.misconception.findMany.mockResolvedValue([]);
      const created = makeMisconceptionRow();
      prisma.misconception.create.mockResolvedValue(created);

      const result = await service.addOrUpdateMisconception('learner-uuid', BASE_DATA);

      expect(prisma.misconception.create).toHaveBeenCalledTimes(1);
      expect(prisma.misconception.update).not.toHaveBeenCalled();
      expect(result.id).toBe('misconception-uuid');
    });

    it('inserts a new row for a distinct concept', async () => {
      prisma.misconception.findMany.mockResolvedValue([]);
      const created = makeMisconceptionRow({ conceptId: 'python.dicts.keys' });
      prisma.misconception.create.mockResolvedValue(created);

      await service.addOrUpdateMisconception('learner-uuid', {
        ...BASE_DATA,
        conceptId: 'python.dicts.keys',
        description: 'Learner thought dict keys must be strings',
      });

      expect(prisma.misconception.create).toHaveBeenCalledTimes(1);
    });

    it('increments frequency when a similar description exists (70%+ keyword overlap)', async () => {
      const existing = makeMisconceptionRow({
        description: 'Learner confused list mutability with tuple immutability type',
        frequency: 1,
      });
      prisma.misconception.findMany.mockResolvedValue([existing]);
      const updated = makeMisconceptionRow({ frequency: 2 });
      prisma.misconception.update.mockResolvedValue(updated);

      const result = await service.addOrUpdateMisconception('learner-uuid', BASE_DATA);

      expect(prisma.misconception.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ frequency: { increment: 1 } }),
        }),
      );
      expect(prisma.misconception.create).not.toHaveBeenCalled();
      expect(result.frequency).toBe(2);
    });

    it('does not increment frequency for a completely different description', async () => {
      const existing = makeMisconceptionRow({
        description: 'Unrelated misconception about something completely different here',
        frequency: 1,
      });
      prisma.misconception.findMany.mockResolvedValue([existing]);
      const created = makeMisconceptionRow({ id: 'new-uuid' });
      prisma.misconception.create.mockResolvedValue(created);

      await service.addOrUpdateMisconception('learner-uuid', BASE_DATA);

      expect(prisma.misconception.create).toHaveBeenCalledTimes(1);
      expect(prisma.misconception.update).not.toHaveBeenCalled();
    });

    it('generates and stores remediationStrategy when learnerStatement and aiCorrection provided', async () => {
      const aiResult = {
        misconceptionType: 'terminology',
        description: 'Learner confused list mutability.',
        severity: 'surface' as const,
        remediationStrategy:
          'Ask the learner to modify a list element and observe the result before explaining.',
      };
      aiService.chatWithSchema.mockResolvedValue(aiResult);
      prisma.misconception.findMany.mockResolvedValue([]);
      const created = makeMisconceptionRow({ remediationStrategy: aiResult.remediationStrategy });
      prisma.misconception.create.mockResolvedValue(created);

      await service.addOrUpdateMisconception('learner-uuid', {
        ...BASE_DATA,
        learnerStatement: 'Lists are immutable.',
        aiCorrection: 'Lists are mutable in Python.',
      });

      const createCall = prisma.misconception.create.mock.calls[0][0] as {
        data: { remediationStrategy: string };
      };
      expect(createCall.data.remediationStrategy).toBe(aiResult.remediationStrategy);
    });

    it('stores misconception without remediation when AI call fails', async () => {
      aiService.chatWithSchema.mockRejectedValue(
        new AiUnavailableException('Both providers failed'),
      );
      prisma.misconception.findMany.mockResolvedValue([]);
      const created = makeMisconceptionRow({ remediationStrategy: null });
      prisma.misconception.create.mockResolvedValue(created);

      await service.addOrUpdateMisconception('learner-uuid', {
        ...BASE_DATA,
        learnerStatement: 'Lists are immutable.',
        aiCorrection: 'Lists are mutable in Python.',
      });

      const createCall = prisma.misconception.create.mock.calls[0][0] as {
        data: { remediationStrategy: null };
      };
      expect(createCall.data.remediationStrategy).toBeNull();
    });

    it('updates remediationStrategy on duplicate when new one is longer (better)', async () => {
      const existing = makeMisconceptionRow({
        description: 'Learner confused list mutability with tuple immutability',
        remediationStrategy: 'Short strategy.',
        frequency: 1,
      });
      prisma.misconception.findMany.mockResolvedValue([existing]);

      const aiResult = {
        misconceptionType: 'terminology',
        description: 'Learner confused list mutability.',
        severity: 'surface' as const,
        remediationStrategy:
          'Ask the learner to modify a list element and observe the result. Then compare with tuple modification attempt.',
      };
      aiService.chatWithSchema.mockResolvedValue(aiResult);
      const updated = makeMisconceptionRow({
        frequency: 2,
        remediationStrategy: aiResult.remediationStrategy,
      });
      prisma.misconception.update.mockResolvedValue(updated);

      await service.addOrUpdateMisconception('learner-uuid', {
        ...BASE_DATA,
        learnerStatement: 'Lists are immutable.',
        aiCorrection: 'Lists are mutable in Python.',
      });

      const updateCall = prisma.misconception.update.mock.calls[0][0] as {
        data: { remediationStrategy: string };
      };
      expect(updateCall.data.remediationStrategy).toBe(aiResult.remediationStrategy);
    });
  });
});
