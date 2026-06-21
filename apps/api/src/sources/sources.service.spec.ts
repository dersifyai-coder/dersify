import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getQueueToken } from '@nestjs/bullmq';
import { SourcesService } from './sources.service';
import { PrismaService } from '../prisma/prisma.service';
import { QUEUE_EMBEDDING_GENERATION } from '../queue/queue.constants';

const mockPrisma = {
  learnerSource: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
};

const mockQueue = { add: jest.fn() };

const mockConfig = {
  get: jest.fn((key: string) => {
    if (key === 'supabase') return { url: 'http://supabase', serviceKey: 'key' };
    return undefined;
  }),
};

// Mock Supabase admin client — tests never hit real storage
jest.mock('../lib/supabase', () => ({
  createSupabaseAdminClient: jest.fn(() => ({
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn().mockResolvedValue({ data: {}, error: null }),
        remove: jest.fn().mockResolvedValue({ data: {}, error: null }),
      })),
    },
  })),
}));

describe('SourcesService', () => {
  let service: SourcesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SourcesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ConfigService, useValue: mockConfig },
        { provide: getQueueToken(QUEUE_EMBEDDING_GENERATION), useValue: mockQueue },
      ],
    }).compile();

    service = module.get<SourcesService>(SourcesService);
    jest.clearAllMocks();
  });

  describe('addUrlSource', () => {
    it('rejects non-http/https URLs', async () => {
      await expect(
        service.addUrlSource('learner-1', {
          topic: 'ml',
          title: 'test',
          url: 'file:///etc/passwd',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects ftp:// URLs', async () => {
      await expect(
        service.addUrlSource('learner-1', {
          topic: 'ml',
          title: 'test',
          url: 'ftp://example.com/file',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects private IP ranges — 10.x.x.x', async () => {
      await expect(
        service.addUrlSource('learner-1', {
          topic: 'ml',
          title: 'test',
          url: 'http://10.0.0.1/secret',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects private IP ranges — 192.168.x.x', async () => {
      await expect(
        service.addUrlSource('learner-1', {
          topic: 'ml',
          title: 'test',
          url: 'http://192.168.1.1/',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects private IP ranges — 172.16.x.x', async () => {
      await expect(
        service.addUrlSource('learner-1', {
          topic: 'ml',
          title: 'test',
          url: 'http://172.16.0.1/',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects link-local 169.254.x.x', async () => {
      await expect(
        service.addUrlSource('learner-1', {
          topic: 'ml',
          title: 'test',
          url: 'http://169.254.169.254/latest/meta-data',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects localhost', async () => {
      await expect(
        service.addUrlSource('learner-1', {
          topic: 'ml',
          title: 'test',
          url: 'http://localhost:3001/internal',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('accepts public https URLs', async () => {
      mockPrisma.learnerSource.create.mockResolvedValue({ id: 'src-1', status: 'processing' });
      mockQueue.add.mockResolvedValue({});
      const result = await service.addUrlSource('learner-1', {
        topic: 'ml',
        title: 'test',
        url: 'https://arxiv.org/abs/1706.03762',
      });
      expect(result.status).toBe('processing');
    });
  });

  describe('addPdfSource', () => {
    const validFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'test.pdf',
      encoding: '7bit',
      mimetype: 'application/pdf',
      buffer: Buffer.from('fake pdf'),
      size: 100,
      stream: null as never,
      destination: '',
      filename: '',
      path: '',
    };

    it('rejects non-PDF files', async () => {
      const notPdf: Express.Multer.File = { ...validFile, mimetype: 'image/jpeg' };
      await expect(
        service.addPdfSource('learner-1', notPdf, { topic: 'ml', title: 'doc' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects files over 10 MB', async () => {
      const bigFile: Express.Multer.File = {
        ...validFile,
        size: 11 * 1024 * 1024,
      };
      await expect(
        service.addPdfSource('learner-1', bigFile, { topic: 'ml', title: 'doc' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('accepts valid PDF files', async () => {
      mockPrisma.learnerSource.create.mockResolvedValue({ id: 'src-2', status: 'processing' });
      mockQueue.add.mockResolvedValue({});
      const result = await service.addPdfSource('learner-1', validFile, {
        topic: 'ml',
        title: 'doc',
      });
      expect(result.status).toBe('processing');
    });
  });

  describe('deleteSource', () => {
    it('throws NotFoundException if source does not exist', async () => {
      mockPrisma.learnerSource.findUnique.mockResolvedValue(null);
      await expect(service.deleteSource('learner-1', 'src-999')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws NotFoundException if source is owned by a different learner', async () => {
      mockPrisma.learnerSource.findUnique.mockResolvedValue({
        id: 'src-1',
        learnerId: 'learner-OTHER',
        sourceType: 'url',
        sourceRef: 'https://example.com',
      });
      await expect(service.deleteSource('learner-1', 'src-1')).rejects.toThrow(NotFoundException);
    });

    it('deletes successfully when learner owns the source', async () => {
      mockPrisma.learnerSource.findUnique.mockResolvedValue({
        id: 'src-1',
        learnerId: 'learner-1',
        sourceType: 'url',
        sourceRef: 'https://example.com',
      });
      mockPrisma.learnerSource.delete.mockResolvedValue({});
      await expect(service.deleteSource('learner-1', 'src-1')).resolves.toBeUndefined();
    });
  });

  describe('getSources', () => {
    it('only returns sources for the requesting learner', async () => {
      const learnerSources = [
        { id: 'src-1', learnerId: 'learner-1', topic: 'ml' },
        { id: 'src-2', learnerId: 'learner-1', topic: 'economics' },
      ];
      mockPrisma.learnerSource.findMany.mockResolvedValue(learnerSources);

      const results = await service.getSources('learner-1');

      expect(mockPrisma.learnerSource.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ learnerId: 'learner-1' }) }),
      );
      expect(results).toEqual(learnerSources);
    });
  });
});
