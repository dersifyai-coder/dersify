import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
// pdf-parse v2 ships as CJS without a callable default export in ESM interop
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse: (buffer: Buffer) => Promise<{ text: string }> = require('pdf-parse');
import { YoutubeTranscript } from 'youtube-transcript';
import { AiService } from '../../ai/ai.service';
import { AiUnavailableException } from '../../ai/exceptions/ai-unavailable.exception';
import { PrismaService } from '../../prisma/prisma.service';
import { createSupabaseAdminClient } from '../../lib/supabase';
import { type AppConfig } from '../../config/configuration';
import { QUEUE_EMBEDDING_GENERATION } from '../queue.constants';

export interface EmbeddingJobData {
  sourceId: string;
  learnerId: string;
}

const CHUNK_WORDS = 500;
const OVERLAP_WORDS = 50;
const STORAGE_BUCKET = 'sources';

function chunkText(text: string): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const chunks: string[] = [];
  let i = 0;
  while (i < words.length) {
    const chunk = words.slice(i, i + CHUNK_WORDS).join(' ');
    if (chunk.trim()) chunks.push(chunk.trim());
    i += CHUNK_WORDS - OVERLAP_WORDS;
    if (i >= words.length) break;
  }
  return chunks;
}

@Processor(QUEUE_EMBEDDING_GENERATION)
@Injectable()
export class EmbeddingProcessor extends WorkerHost {
  private readonly logger = new Logger(EmbeddingProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly configService: ConfigService<AppConfig, true>,
  ) {
    super();
  }

  async process(job: Job<EmbeddingJobData>): Promise<void> {
    const { sourceId, learnerId } = job.data;

    const source = await this.prisma.learnerSource.findUnique({ where: { id: sourceId } });
    if (!source || source.learnerId !== learnerId) {
      this.logger.error('Source not found or ownership mismatch', { sourceId, learnerId });
      return;
    }

    if (source.status === 'ready' && source.chunkCount > 0) {
      this.logger.log('Source already processed — skipping', { sourceId });
      return;
    }

    try {
      let text: string;

      if (source.sourceType === 'pdf') {
        text = await this.extractPdfText(source.sourceRef);
      } else if (source.sourceType === 'url') {
        text = await this.fetchUrlText(source.sourceRef);
      } else if (source.sourceType === 'youtube') {
        text = await this.fetchYouTubeTranscript(source.sourceRef);
      } else {
        throw new Error(`Unsupported source type: ${source.sourceType as string}`);
      }

      const chunks = chunkText(text);
      if (chunks.length === 0) {
        throw new Error('No text content extracted from source');
      }

      await this.insertChunks(source, chunks, learnerId);

      await this.prisma.learnerSource.update({
        where: { id: sourceId },
        data: { status: 'ready', chunkCount: chunks.length },
      });

      this.logger.log('Source processed successfully', { sourceId, chunks: chunks.length });
    } catch (err) {
      const message = (err as Error).message.slice(0, 500);
      this.logger.error('Embedding job failed', { sourceId, learnerId, error: message });
      await this.prisma.learnerSource.update({
        where: { id: sourceId },
        data: { status: 'failed', errorMessage: message },
      });
    }
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<EmbeddingJobData>, error: Error): void {
    this.logger.error('Embedding job failed permanently after all retries', {
      jobId: job.id,
      sourceId: job.data.sourceId,
      learnerId: job.data.learnerId,
      error: error.message,
      attemptsMade: job.attemptsMade,
    });
  }

  private async extractPdfText(storageRef: string): Promise<string> {
    const supabaseConfig = this.configService.get('supabase', { infer: true });
    const client = createSupabaseAdminClient(supabaseConfig.url, supabaseConfig.serviceKey);

    const { data, error } = await client.storage.from(STORAGE_BUCKET).download(storageRef);
    if (error || !data) {
      throw new Error(`Failed to download PDF from storage: ${error?.message ?? 'unknown error'}`);
    }

    const buffer = Buffer.from(await data.arrayBuffer());
    const parsed = await pdfParse(buffer);
    return parsed.text;
  }

  private async fetchUrlText(url: string): Promise<string> {
    const jinaKey = this.configService.get('jina', { infer: true }).apiKey;
    const response = await fetch(`https://r.jina.ai/${url}`, {
      headers: { Authorization: `Bearer ${jinaKey}` },
    });
    if (!response.ok) {
      throw new Error(`Jina Reader fetch failed: HTTP ${response.status}`);
    }
    return response.text();
  }

  private async fetchYouTubeTranscript(videoId: string): Promise<string> {
    const items = await YoutubeTranscript.fetchTranscript(videoId);
    if (!items || items.length === 0) {
      throw new Error(`No transcript available for YouTube video: ${videoId}`);
    }
    return items.map((item) => item.text).join(' ');
  }

  private async insertChunks(
    source: { id: string; learnerId: string; topic: string },
    chunks: string[],
    learnerId: string,
  ): Promise<void> {
    for (let i = 0; i < chunks.length; i++) {
      const content = chunks[i]!;
      let embedding: number[];

      try {
        embedding = await this.aiService.embed(content);
      } catch (err) {
        if (err instanceof AiUnavailableException) throw err;
        throw new Error(`Embedding call failed for chunk ${i}: ${(err as Error).message}`);
      }

      const embeddingStr = `[${embedding.join(',')}]`;

      await this.prisma.$executeRaw`
        INSERT INTO source_chunks (id, source_id, learner_id, topic, content, embedding, chunk_index)
        VALUES (
          gen_random_uuid(),
          ${source.id}::uuid,
          ${learnerId}::uuid,
          ${source.topic},
          ${content},
          ${embeddingStr}::vector,
          ${i}
        )
      `;
    }
  }
}
