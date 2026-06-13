import { Test, TestingModule } from '@nestjs/testing';
import { RagService } from './rag.service';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { AiUnavailableException } from '../ai/exceptions/ai-unavailable.exception';

const mockPrisma = {
  learnerSource: { count: jest.fn() },
  $queryRaw: jest.fn(),
};

const mockAiService = { embed: jest.fn() };

const mockRedis = {
  get: jest.fn().mockResolvedValue(null),
  setex: jest.fn().mockResolvedValue('OK'),
};

describe('RagService', () => {
  let service: RagService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RagService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AiService, useValue: mockAiService },
        { provide: 'RAG_REDIS', useValue: mockRedis },
      ],
    }).compile();

    service = module.get<RagService>(RagService);
    jest.clearAllMocks();
    mockRedis.get.mockResolvedValue(null);
    mockRedis.setex.mockResolvedValue('OK');
  });

  describe('search', () => {
    it('returns empty array when AiService.embed throws AiUnavailableException', async () => {
      mockAiService.embed.mockRejectedValue(
        new AiUnavailableException('Both providers failed'),
      );

      const results = await service.search('learner-1', 'ml', 'what is gradient descent');
      expect(results).toEqual([]);
    });

    it('filters results by learnerId via SQL query', async () => {
      const fakeEmbedding = new Array(768).fill(0.1);
      mockAiService.embed.mockResolvedValue(fakeEmbedding);
      mockPrisma.$queryRaw.mockResolvedValue([
        { id: 'chunk-1', learnerId: 'learner-1', topic: 'ml', content: 'text', distance: 0.1 },
      ]);

      const results = await service.search('learner-1', 'ml', 'gradient descent');

      expect(mockPrisma.$queryRaw).toHaveBeenCalled();
      // Tagged template calls pass interpolated values as positional args after the strings array
      const callArgs: unknown[] = mockPrisma.$queryRaw.mock.calls[0] as unknown[];
      const paramValues = callArgs.slice(1); // skip TemplateStringsArray
      expect(paramValues).toContain('learner-1');
      expect(results).toHaveLength(1);
    });

    it('returns cached results when available', async () => {
      const cachedChunks = [{ id: 'chunk-cached', content: 'cached' }];
      mockRedis.get.mockResolvedValue(JSON.stringify(cachedChunks));
      mockAiService.embed.mockResolvedValue(new Array(768).fill(0));

      const results = await service.search('learner-1', 'ml', 'query');

      expect(mockPrisma.$queryRaw).not.toHaveBeenCalled();
      expect(results).toEqual(cachedChunks);
    });
  });

  describe('hasSourcesForTopic', () => {
    it('returns false when no ready sources exist', async () => {
      mockPrisma.learnerSource.count.mockResolvedValue(0);

      const result = await service.hasSourcesForTopic('learner-1', 'ml');
      expect(result).toBe(false);
    });

    it('returns true when ready sources exist', async () => {
      mockPrisma.learnerSource.count.mockResolvedValue(2);

      const result = await service.hasSourcesForTopic('learner-1', 'ml');
      expect(result).toBe(true);
    });

    it('queries with correct learnerId and topic', async () => {
      mockPrisma.learnerSource.count.mockResolvedValue(1);

      await service.hasSourcesForTopic('learner-42', 'economics');

      expect(mockPrisma.learnerSource.count).toHaveBeenCalledWith({
        where: { learnerId: 'learner-42', topic: 'economics', status: 'ready' },
      });
    });

    it('returns cached value and skips DB on cache hit', async () => {
      mockRedis.get.mockResolvedValue('1');

      const result = await service.hasSourcesForTopic('learner-1', 'ml');

      expect(mockPrisma.learnerSource.count).not.toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });
});
