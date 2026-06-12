import { NotImplementedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConceptRegistryService } from './concept-registry.service';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

function makeConceptRow(overrides: Record<string, unknown> = {}) {
  return {
    canonicalId: 'math.algebra.linear-equations-abc123',
    displayName: 'Linear Equations',
    topic: 'math',
    aliases: ['linear-equations'],
    prerequisites: [],
    related: [],
    status: 'ai_generated',
    sessionCount: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('ConceptRegistryService', () => {
  let service: ConceptRegistryService;
  let prisma: { conceptRegistry: jest.Mocked<Record<string, jest.Mock>> };
  let aiService: { embed: jest.Mock };

  beforeEach(async () => {
    prisma = {
      conceptRegistry: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    aiService = { embed: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConceptRegistryService,
        { provide: PrismaService, useValue: prisma },
        { provide: AiService, useValue: aiService },
      ],
    }).compile();

    service = module.get<ConceptRegistryService>(ConceptRegistryService);
  });

  describe('resolveOrCreate', () => {
    it('returns existing canonical_id on exact match', async () => {
      const existing = makeConceptRow();
      prisma.conceptRegistry.findFirst.mockResolvedValue(existing);
      prisma.conceptRegistry.update.mockResolvedValue(existing);

      const result = await service.resolveOrCreate('Linear Equations', 'math');

      expect(result.canonicalId).toBe(existing.canonicalId);
      expect(result.isNew).toBe(false);
      expect(result.merged).toBe(false);
      expect(prisma.conceptRegistry.findFirst).toHaveBeenCalledTimes(1);
    });

    it('creates a new concept if no match found', async () => {
      prisma.conceptRegistry.findFirst.mockResolvedValue(null);
      aiService.embed.mockRejectedValue(new NotImplementedException());
      prisma.conceptRegistry.findMany.mockResolvedValue([]);
      prisma.conceptRegistry.create.mockResolvedValue(makeConceptRow({ canonicalId: 'new-id' }));

      const result = await service.resolveOrCreate('Quadratic Formula', 'math');

      expect(result.isNew).toBe(true);
      expect(result.merged).toBe(false);
      expect(prisma.conceptRegistry.create).toHaveBeenCalledTimes(1);
    });

    it('merges via alias if embedding similarity > 0.92', async () => {
      prisma.conceptRegistry.findFirst.mockResolvedValue(null);
      const embedding = Array.from({ length: 768 }, () => 0.1);
      aiService.embed.mockResolvedValue(embedding);

      const existing = makeConceptRow({ canonicalId: 'math.algebra.quadratic-xyz' });
      prisma.conceptRegistry.findMany.mockResolvedValue([existing]);
      prisma.conceptRegistry.update.mockResolvedValue(existing);

      // Inject a matching embedding so similarity > 0.92
      const spyGetEmbedding = jest
        .spyOn(service as unknown as { getConceptEmbedding: (id: string) => Promise<number[] | null> }, 'getConceptEmbedding')
        .mockResolvedValue(embedding);

      const result = await service.resolveOrCreate('Quadratic Eq', 'math');

      expect(result.merged).toBe(true);
      expect(result.canonicalId).toBe(existing.canonicalId);
      expect(prisma.conceptRegistry.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { canonicalId: existing.canonicalId } }),
      );

      spyGetEmbedding.mockRestore();
    });
  });
});
