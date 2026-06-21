import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { randomUUID } from 'crypto';
import { type LearnerSource } from '@dersify/database';
import { PrismaService } from '../prisma/prisma.service';
import { createSupabaseAdminClient } from '../lib/supabase';
import { type AppConfig } from '../config/configuration';
import { QUEUE_EMBEDDING_GENERATION } from '../queue/queue.constants';
import { type EmbeddingJobData } from '../queue/processors/embedding.processor';
import { AddUrlSourceDto, AddYouTubeSourceDto } from './dto/add-source.dto';

const STORAGE_BUCKET = 'sources';
const MAX_PDF_BYTES = 10 * 1024 * 1024; // 10 MB

const PRIVATE_IP_PATTERNS = [
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^169\.254\./,
  /^::1$/,
  /^0\./,
  /^0\.0\.0\.0$/,
];

function isPrivateOrUnsafeUrl(rawUrl: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return true;
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) return true;
  const hostname = parsed.hostname.toLowerCase();
  if (hostname === 'localhost') return true;
  return PRIVATE_IP_PATTERNS.some((p) => p.test(hostname));
}

@Injectable()
export class SourcesService {
  private readonly logger = new Logger(SourcesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService<AppConfig, true>,
    @InjectQueue(QUEUE_EMBEDDING_GENERATION)
    private readonly embeddingQueue: Queue<EmbeddingJobData>,
  ) {}

  async addPdfSource(
    learnerId: string,
    file: Express.Multer.File,
    dto: { topic: string; title: string },
  ): Promise<{ id: string; status: string }> {
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Only PDF files are accepted');
    }
    if (file.size > MAX_PDF_BYTES) {
      throw new BadRequestException('PDF must be 10 MB or smaller');
    }

    const supabase = createSupabaseAdminClient(
      this.configService.get('supabase', { infer: true }).url,
      this.configService.get('supabase', { infer: true }).serviceKey,
    );

    const objectKey = `${learnerId}/${randomUUID()}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(objectKey, file.buffer, { contentType: 'application/pdf', upsert: false });

    if (uploadError) {
      this.logger.error('Supabase Storage upload failed', { learnerId, error: uploadError.message });
      throw new BadRequestException('File upload failed');
    }

    const source = await this.prisma.learnerSource.create({
      data: {
        learnerId,
        topic: dto.topic,
        sourceType: 'pdf',
        title: dto.title,
        sourceRef: objectKey,
        status: 'processing',
      },
    });

    await this.embeddingQueue.add(
      'embed-source',
      { sourceId: source.id, learnerId },
      { attempts: 3, backoff: { type: 'exponential', delay: 2000 } },
    );

    return { id: source.id, status: 'processing' };
  }

  async addUrlSource(
    learnerId: string,
    dto: AddUrlSourceDto,
  ): Promise<{ id: string; status: string }> {
    if (isPrivateOrUnsafeUrl(dto.url)) {
      throw new BadRequestException('URL must be a public http/https address');
    }

    const source = await this.prisma.learnerSource.create({
      data: {
        learnerId,
        topic: dto.topic,
        sourceType: 'url',
        title: dto.title,
        sourceRef: dto.url,
        status: 'processing',
      },
    });

    await this.embeddingQueue.add(
      'embed-source',
      { sourceId: source.id, learnerId },
      { attempts: 3, backoff: { type: 'exponential', delay: 2000 } },
    );

    return { id: source.id, status: 'processing' };
  }

  async addYouTubeSource(
    learnerId: string,
    dto: AddYouTubeSourceDto,
  ): Promise<{ id: string; status: string }> {
    const source = await this.prisma.learnerSource.create({
      data: {
        learnerId,
        topic: dto.topic,
        sourceType: 'youtube',
        title: dto.title,
        sourceRef: dto.youtubeId,
        status: 'processing',
      },
    });

    await this.embeddingQueue.add(
      'embed-source',
      { sourceId: source.id, learnerId },
      { attempts: 3, backoff: { type: 'exponential', delay: 2000 } },
    );

    return { id: source.id, status: 'processing' };
  }

  async getSources(learnerId: string, topic?: string): Promise<LearnerSource[]> {
    return this.prisma.learnerSource.findMany({
      where: { learnerId, ...(topic ? { topic } : {}) },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deleteSource(learnerId: string, sourceId: string): Promise<void> {
    const source = await this.prisma.learnerSource.findUnique({
      where: { id: sourceId },
    });

    if (!source) {
      throw new NotFoundException('Source not found');
    }
    if (source.learnerId !== learnerId) {
      throw new NotFoundException('Source not found');
    }

    if (source.sourceType === 'pdf') {
      const supabase = createSupabaseAdminClient(
        this.configService.get('supabase', { infer: true }).url,
        this.configService.get('supabase', { infer: true }).serviceKey,
      );
      await supabase.storage.from(STORAGE_BUCKET).remove([source.sourceRef]);
    }

    await this.prisma.learnerSource.delete({ where: { id: sourceId } });
  }
}
