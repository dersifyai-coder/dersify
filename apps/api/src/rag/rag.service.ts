import { createHash } from 'crypto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { AiService } from '../ai/ai.service';
import { AiUnavailableException } from '../ai/exceptions/ai-unavailable.exception';
import { PrismaService } from '../prisma/prisma.service';

export interface SourceChunk {
  id: string;
  sourceId: string;
  learnerId: string;
  topic: string;
  content: string;
  chunkIndex: number;
  createdAt: Date;
  distance: number;
}

const RAG_CACHE_TTL_SECONDS = 300;
const SOURCES_CACHE_TTL_SECONDS = 3600;

function ragCacheKey(learnerId: string, topic: string, queryHash: string): string {
  return `dersify:rag:${learnerId}:${topic}:${queryHash}`;
}

function sourcesCacheKey(learnerId: string, topic: string): string {
  return `dersify:sources:${learnerId}:${topic}`;
}

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    @Inject('RAG_REDIS') private readonly redis: Redis,
  ) {}

  async search(
    learnerId: string,
    topic: string,
    query: string,
    topK: number = 3,
  ): Promise<SourceChunk[]> {
    let embedding: number[];
    try {
      embedding = await this.aiService.embed(query);
    } catch (err) {
      if (err instanceof AiUnavailableException) {
        this.logger.warn('RAG embed unavailable — returning empty results', { learnerId, topic });
        return [];
      }
      throw err;
    }

    const queryHash = createHash('sha256').update(query).digest('hex').slice(0, 16);
    const cacheKey = ragCacheKey(learnerId, topic, queryHash);

    const cached = await this.redis.get(cacheKey).catch(() => null);
    if (cached) {
      return JSON.parse(cached) as SourceChunk[];
    }

    const embeddingStr = `[${embedding.join(',')}]`;

    const chunks = await this.prisma.$queryRaw<SourceChunk[]>`
      SELECT
        sc.id,
        sc.source_id  AS "sourceId",
        sc.learner_id AS "learnerId",
        sc.topic,
        sc.content,
        sc.chunk_index AS "chunkIndex",
        sc.created_at  AS "createdAt",
        sc.embedding <=> ${embeddingStr}::vector AS distance
      FROM source_chunks sc
      WHERE sc.learner_id = ${learnerId}::uuid
        AND sc.topic = ${topic}
      ORDER BY distance ASC
      LIMIT ${topK}
    `;

    await this.redis
      .setex(cacheKey, RAG_CACHE_TTL_SECONDS, JSON.stringify(chunks))
      .catch(() => undefined);

    return chunks;
  }

  async hasSourcesForTopic(learnerId: string, topic: string): Promise<boolean> {
    const cacheKey = sourcesCacheKey(learnerId, topic);

    const cached = await this.redis.get(cacheKey).catch(() => null);
    if (cached !== null) return cached === '1';

    const count = await this.prisma.learnerSource.count({
      where: { learnerId, topic, status: 'ready' },
    });

    const result = count > 0;
    await this.redis
      .setex(cacheKey, SOURCES_CACHE_TTL_SECONDS, result ? '1' : '0')
      .catch(() => undefined);

    return result;
  }
}
