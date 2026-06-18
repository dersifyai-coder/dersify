import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { LearnerKnowledgeState, Misconception, Prisma, Profile } from '@dersify/database';
import { PrismaService } from '../prisma/prisma.service';
import { FsrsCard, FsrsRating, getConfidence, schedule } from './fsrs';
import { MisconceptionData, MisconceptionService } from './misconception.service';

export type MisconceptionWithConcept = Prisma.MisconceptionGetPayload<{
  include: { concept: { select: { displayName: true } } };
}>;

export interface ConceptWithState {
  canonicalId: string;
  displayName: string;
  topic: string;
  sessionCount: number;
  confidence: number;
  stability: number;
  due: Date;
  fsrsState: number;
  reps: number;
  lapses: number;
}

export interface TopicKnowledgeSummary {
  confirmed: ConceptWithState[];
  shaky: ConceptWithState[];
  newConcepts: ConceptWithState[];
}

const CONFIDENCE_CONFIRMED = 0.65;
const CONFIDENCE_SHAKY_MIN = 0.30;
const MAX_CONFIRMED = 15;
const MAX_SHAKY = 10;
const MAX_NEW = 10;

const DUE_WINDOW_DAYS = 3;

// Cache TTLs (ms)
const TTL_DUE = 2 * 60 * 1000; // 2 min
const TTL_LAYER1 = 10 * 60 * 1000; // 10 min
const TTL_PROGRESS = 5 * 60 * 1000; // 5 min

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

function dueKey(learnerId: string, topic: string): string {
  return `dersify:due:${learnerId}:${topic}`;
}
function layer1Key(learnerId: string, topic: string): string {
  return `dersify:context:layer1:${learnerId}:${topic}`;
}
function progressKey(learnerId: string): string {
  return `dersify:progress:${learnerId}`;
}

function mapToFsrsCard(state: LearnerKnowledgeState): FsrsCard {
  return {
    stability: state.stability,
    difficulty: state.difficulty,
    elapsedDays: state.elapsedDays,
    scheduledDays: state.scheduledDays,
    reps: state.reps,
    lapses: state.lapses,
    state: state.fsrsState,
    due: state.due,
    lastReviewedAt: state.lastReviewedAt,
  };
}

@Injectable()
export class LearnerService {
  private readonly logger = new Logger(LearnerService.name);
  private readonly cache = new Map<string, CacheEntry<unknown>>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly misconceptionService: MisconceptionService,
  ) {}

  async getProfile(learnerId: string): Promise<Profile> {
    try {
      return await this.prisma.profile.findUniqueOrThrow({
        where: { id: learnerId },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Profile not found.');
      }
      throw error;
    }
  }

  async upsertKnowledgeState(
    learnerId: string,
    conceptId: string,
    topic: string,
    rating: FsrsRating,
    now: Date = new Date(),
  ): Promise<LearnerKnowledgeState> {
    const existing = await this.prisma.learnerKnowledgeState.findUnique({
      where: { learnerId_conceptId: { learnerId, conceptId } },
    });

    const currentCard: FsrsCard = existing
      ? mapToFsrsCard(existing)
      : {
          stability: 0,
          difficulty: 0.3,
          elapsedDays: 0,
          scheduledDays: 0,
          reps: 0,
          lapses: 0,
          state: 0,
          due: now,
          lastReviewedAt: null,
        };

    const next = schedule(currentCard, rating, now);
    const confidence = getConfidence(next, now);

    const data = {
      stability: next.stability,
      difficulty: next.difficulty,
      elapsedDays: next.elapsedDays,
      scheduledDays: next.scheduledDays,
      reps: next.reps,
      lapses: next.lapses,
      fsrsState: next.state,
      due: next.due,
      confidence,
      lastReviewedAt: now,
    };

    const result = await this.prisma.learnerKnowledgeState.upsert({
      where: { learnerId_conceptId: { learnerId, conceptId } },
      create: { learnerId, conceptId, topic, ...data },
      update: data,
    });

    this.invalidateCache(dueKey(learnerId, topic));
    this.invalidateCache(layer1Key(learnerId, topic));
    this.invalidateCache(progressKey(learnerId));

    return result;
  }

  async getDueConceptsForTopic(
    learnerId: string,
    topic: string,
  ): Promise<LearnerKnowledgeState[]> {
    const cacheKey = dueKey(learnerId, topic);
    const cached = this.getCache<LearnerKnowledgeState[]>(cacheKey);
    if (cached) return cached;

    const windowEnd = new Date(Date.now() + DUE_WINDOW_DAYS * 24 * 60 * 60 * 1000);

    const results = await this.prisma.learnerKnowledgeState.findMany({
      where: {
        learnerId,
        topic,
        due: { lte: windowEnd },
      },
      orderBy: { due: 'asc' },
    });

    this.setCache(cacheKey, results, TTL_DUE);
    return results;
  }

  async getTopicKnowledgeSummary(
    learnerId: string,
    topic: string,
  ): Promise<TopicKnowledgeSummary> {
    const cacheKey = layer1Key(learnerId, topic);
    const cached = this.getCache<TopicKnowledgeSummary>(cacheKey);
    if (cached) return cached;

    const states = await this.prisma.learnerKnowledgeState.findMany({
      where: { learnerId, topic },
      include: { concept: true },
    });

    const toConceptWithState = (s: typeof states[number]): ConceptWithState => ({
      canonicalId: s.conceptId,
      displayName: s.concept.displayName,
      topic: s.topic,
      sessionCount: s.concept.sessionCount,
      confidence: s.confidence,
      stability: s.stability,
      due: s.due,
      fsrsState: s.fsrsState,
      reps: s.reps,
      lapses: s.lapses,
    });

    const confirmed = states
      .filter((s) => s.confidence >= CONFIDENCE_CONFIRMED)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, MAX_CONFIRMED)
      .map(toConceptWithState);

    const shaky = states
      .filter(
        (s) => s.confidence >= CONFIDENCE_SHAKY_MIN && s.confidence < CONFIDENCE_CONFIRMED,
      )
      .sort((a, b) => a.due.getTime() - b.due.getTime())
      .slice(0, MAX_SHAKY)
      .map(toConceptWithState);

    const newConcepts = states
      .filter((s) => s.confidence < CONFIDENCE_SHAKY_MIN || s.fsrsState === 0)
      .sort((a, b) => b.concept.sessionCount - a.concept.sessionCount)
      .slice(0, MAX_NEW)
      .map(toConceptWithState);

    const summary: TopicKnowledgeSummary = { confirmed, shaky, newConcepts };
    this.setCache(cacheKey, summary, TTL_LAYER1);
    return summary;
  }

  async getActiveMisconceptions(
    learnerId: string,
    topic: string,
  ): Promise<MisconceptionWithConcept[]> {
    return this.prisma.misconception.findMany({
      where: { learnerId, topic, resolved: false },
      include: { concept: { select: { displayName: true } } },
      orderBy: { frequency: 'desc' },
      take: 5,
    });
  }

  async addMisconception(
    learnerId: string,
    data: MisconceptionData,
  ): Promise<Misconception> {
    const result = await this.misconceptionService.addOrUpdateMisconception(learnerId, data);
    this.invalidateCache(layer1Key(learnerId, data.topic));
    return result;
  }

  async resolveMisconception(
    learnerId: string,
    misconceptionId: string,
    sessionId?: string,
  ): Promise<void> {
    try {
      const updated = await this.prisma.misconception.update({
        where: { id: misconceptionId, learnerId },
        data: {
          resolved: true,
          ...(sessionId ? { resolvedInSession: sessionId } : {}),
        },
      });
      this.invalidateCache(layer1Key(learnerId, updated.topic));
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException('Misconception not found.');
      }
      throw error;
    }
  }

  invalidateCachesForTopic(learnerId: string, topic: string): void {
    this.invalidateCache(dueKey(learnerId, topic));
    this.invalidateCache(layer1Key(learnerId, topic));
    this.invalidateCache(progressKey(learnerId));
  }

  private getCache<T>(key: string): T | undefined {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }
    return entry.value;
  }

  private setCache<T>(key: string, value: T, ttlMs: number): void {
    this.cache.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  private invalidateCache(key: string): void {
    this.cache.delete(key);
  }
}
