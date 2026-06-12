import { Injectable, Logger, NotImplementedException } from '@nestjs/common';
import { ConceptRegistry } from '@dersify/database';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { ResolveResult } from './concept-registry.types';

const EMBEDDING_SIMILARITY_THRESHOLD = 0.92;
const CONCEPT_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

interface CacheEntry {
  value: string;
  expiresAt: number;
}

function buildCacheKey(topic: string, normalizedName: string): string {
  return `dersify:concept:${topic}:${normalizedName}`;
}

function normalize(rawName: string): string {
  return rawName
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
}

function buildCanonicalId(topic: string, normalizedName: string): string {
  return `${topic}.${normalizedName}-${Date.now().toString(36)}`;
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

@Injectable()
export class ConceptRegistryService {
  private readonly logger = new Logger(ConceptRegistryService.name);
  private readonly cache = new Map<string, CacheEntry>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async resolveOrCreate(rawName: string, topic: string): Promise<ResolveResult> {
    const normalizedName = normalize(rawName);
    const cacheKey = buildCacheKey(topic, normalizedName);

    const cached = this.getCache(cacheKey);
    if (cached) {
      return { canonicalId: cached, isNew: false, merged: false };
    }

    // 1. Exact match — canonical_id ILIKE or alias array contains normalized name
    const exact = await this.prisma.conceptRegistry.findFirst({
      where: {
        topic,
        OR: [
          { canonicalId: { contains: normalizedName, mode: 'insensitive' } },
          { aliases: { has: normalizedName } },
          { displayName: { contains: rawName, mode: 'insensitive' } },
        ],
      },
    });

    if (exact) {
      await this.prisma.conceptRegistry.update({
        where: { canonicalId: exact.canonicalId },
        data: { sessionCount: { increment: 1 } },
      });
      this.setCache(cacheKey, exact.canonicalId);
      return { canonicalId: exact.canonicalId, isNew: false, merged: false };
    }

    // 2. Embedding similarity search (graceful degrade if AI unavailable)
    try {
      const embedding = await this.aiService.embed(rawName);
      const candidates = await this.prisma.conceptRegistry.findMany({
        where: { topic },
        take: 20,
        orderBy: { sessionCount: 'desc' },
      });

      // pgvector similarity is done in-process here since full vector queries
      // require $queryRaw (implemented in RagService, F-05). For now, compare
      // against concepts that have embeddings cached. This runs fast because
      // top-20 are in-process.
      for (const candidate of candidates) {
        const candidateEmbedding = await this.getConceptEmbedding(candidate.canonicalId);
        if (!candidateEmbedding) continue;
        const similarity = cosineSimilarity(embedding, candidateEmbedding);
        if (similarity > EMBEDDING_SIMILARITY_THRESHOLD) {
          // Merge: add alias and increment
          await this.prisma.conceptRegistry.update({
            where: { canonicalId: candidate.canonicalId },
            data: {
              aliases: { push: normalizedName },
              sessionCount: { increment: 1 },
            },
          });
          this.setCache(cacheKey, candidate.canonicalId);
          this.logger.debug(
            `concept_merged rawName=${rawName} into=${candidate.canonicalId} similarity=${similarity.toFixed(3)}`,
          );
          return { canonicalId: candidate.canonicalId, isNew: false, merged: true };
        }
      }
    } catch (error) {
      if (!(error instanceof NotImplementedException)) {
        this.logger.warn(`concept_embedding_failed rawName=${rawName} error=${String(error)}`);
      }
      // Degrade gracefully: fall through to create new concept
    }

    // 3. Create new concept
    const canonicalId = buildCanonicalId(topic, normalizedName);
    await this.prisma.conceptRegistry.create({
      data: {
        canonicalId,
        displayName: rawName.trim(),
        topic,
        aliases: [normalizedName],
        prerequisites: [],
        related: [],
        status: 'ai_generated',
        sessionCount: 1,
      },
    });

    this.setCache(cacheKey, canonicalId);
    this.logger.log(`concept_created canonicalId=${canonicalId} topic=${topic}`);
    return { canonicalId, isNew: true, merged: false };
  }

  async getConceptsForTopic(topic: string): Promise<ConceptRegistry[]> {
    return this.prisma.conceptRegistry.findMany({
      where: { topic },
      orderBy: { sessionCount: 'desc' },
    });
  }

  async getPrerequisites(canonicalId: string): Promise<ConceptRegistry[]> {
    const concept = await this.prisma.conceptRegistry.findUnique({
      where: { canonicalId },
    });
    if (!concept || concept.prerequisites.length === 0) return [];

    return this.prisma.conceptRegistry.findMany({
      where: { canonicalId: { in: concept.prerequisites } },
    });
  }

  // Stub: per-concept embedding storage will be wired in F-05 via pgvector
  private async getConceptEmbedding(canonicalId: string): Promise<number[] | null> {
    void canonicalId;
    return null;
  }

  private getCache(key: string): string | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }
    return entry.value;
  }

  private setCache(key: string, value: string): void {
    this.cache.set(key, { value, expiresAt: Date.now() + CONCEPT_CACHE_TTL_MS });
  }
}
