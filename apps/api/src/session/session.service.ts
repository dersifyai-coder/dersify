import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Prisma, Session, SessionMessage } from '@dersify/database';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { AiUnavailableException } from '../ai/exceptions/ai-unavailable.exception';
import { ContextService } from '../context/context.service';
import { ContextBudgetManager } from '../context/context-budget.manager';
import { SignalDetectorService } from '../context/signal-detector.service';
import {
  initSessionInsights,
  SessionInsights,
  updateInsightsWithSignals,
} from '../context/session-insights';
import { evaluateModeShift } from '../context/mode-shifts';
import { LearnerService } from '../learner/learner.service';
import { MisconceptionType } from '../learner/dto/add-misconception.dto';
import { ConceptRegistryService } from '../concept-registry/concept-registry.service';
import { RedisService } from '../redis/redis.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { QUEUE_SESSION_CONSOLIDATION } from '../queue/queue.constants';
import {
  buildSessionOpeningMessages,
  buildSessionTurnMessages,
} from '../ai/prompts/session-turn.prompt';
import {
  buildExchangeEvaluationPrompt,
  ExchangeEvaluation,
  ExchangeEvaluationContext,
  ExchangeEvaluationSchema,
} from '../ai/prompts/exchange-evaluation.prompt';
import { StartSessionDto } from './dto/start-session.dto';
import { SendMessageDto } from './dto/send-message.dto';

const SESSION_INSIGHTS_TTL = 8 * 60 * 60; // 8h in seconds
const TRUE_RESUME_WINDOW_MS = 2 * 60 * 60 * 1000; // 2h
const SMART_RESUME_WINDOW_MS = 24 * 60 * 60 * 1000; // 24h
const HISTORY_LIMIT = 20;

const TIER_EXCHANGE_LIMITS: Record<string, number> = {
  free: 20,
  pro: 60,
  teams: 60,
};

const PHASE_TRANSITION_THRESHOLD = 0.85;

// Maps FSRS retentionQuality (1-4) to demonstrated-level scale (0-5)
const RETENTION_QUALITY_SCALE: Record<1 | 2 | 3 | 4, number> = {
  1: 1,
  2: 2,
  3: 3,
  4: 5,
};

// Maps prior_knowledge_signal string to a 0-5 scale for calibrationDelta
const SELF_REPORTED_LEVEL_SCALE: Record<string, number> = {
  none: 0,
  beginner: 1,
  elementary: 1.5,
  intermediate: 2.5,
  'upper-intermediate': 3.5,
  advanced: 4,
  expert: 5,
};
const DEFAULT_SELF_REPORTED_SCALE = 2.5;

function selfReportedToScale(level: string): number {
  return SELF_REPORTED_LEVEL_SCALE[level.toLowerCase()] ?? DEFAULT_SELF_REPORTED_SCALE;
}

function deriveErrorType(evaluation: ExchangeEvaluation): string {
  if (evaluation.misconceptionDetected.found) return 'misconception';
  if (evaluation.retentionQuality === 1) return 'recall_failure';
  return 'careless';
}

function insightsKey(sessionId: string): string {
  return `dersify:insights:${sessionId}`;
}

export type ResumeType = 'continue' | 'smart' | 'new';

export interface StartSessionResult {
  sessionId: string;
  openingMessage: string;
  phase: string;
  resumeType: ResumeType;
  conceptsDue: string[];
}

export interface SendMessageResult {
  message: string;
  phase: string;
  mode: string;
  exchangesCount: number;
}

export interface SessionConsolidationJobData {
  sessionId: string;
  learnerId: string;
}

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly contextService: ContextService,
    private readonly budgetManager: ContextBudgetManager,
    private readonly signalDetector: SignalDetectorService,
    private readonly learnerService: LearnerService,
    private readonly conceptRegistryService: ConceptRegistryService,
    private readonly redisService: RedisService,
    private readonly subscriptionService: SubscriptionService,
    @InjectQueue(QUEUE_SESSION_CONSOLIDATION)
    private readonly consolidationQueue: Queue<SessionConsolidationJobData>,
  ) {}

  async startSession(
    learnerId: string,
    dto: StartSessionDto,
  ): Promise<StartSessionResult> {
    const { allowed, reason } = await this.subscriptionService.checkSessionAllowed(learnerId);
    if (!allowed) {
      throw new ForbiddenException(reason ?? 'Session limit reached');
    }

    const latestSession = await this.prisma.session.findFirst({
      where: { learnerId, topic: dto.topic },
      orderBy: { lastActivityAt: 'desc' },
    });

    if (latestSession) {
      const ageMs = Date.now() - latestSession.lastActivityAt.getTime();

      if (ageMs < TRUE_RESUME_WINDOW_MS && !latestSession.endedAt) {
        return this.buildTrueResumeResult(latestSession, learnerId, dto.topic);
      }

      if (ageMs < SMART_RESUME_WINDOW_MS) {
        return this.buildSmartResumeResult(latestSession, learnerId, dto.topic);
      }
    }

    return this.createNewSession(learnerId, dto);
  }

  async sendMessage(
    learnerId: string,
    sessionId: string,
    dto: SendMessageDto,
  ): Promise<SendMessageResult> {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) throw new NotFoundException('Session not found');
    if (session.learnerId !== learnerId) throw new ForbiddenException('Access denied');
    if (session.endedAt) throw new ForbiddenException('Session has ended');

    const { allowed } = await this.subscriptionService.checkExchangeAllowed(learnerId, sessionId);
    if (!allowed) throw new ForbiddenException('Exchange limit reached');

    const currentInsights = await this.loadInsights(sessionId);

    const recentMessages = await this.prisma.sessionMessage.findMany({
      where: { sessionId },
      orderBy: { turnIndex: 'desc' },
      take: HISTORY_LIMIT,
    });
    const orderedMessages = recentMessages.reverse();

    const learnerTier = await this.subscriptionService.getTier(learnerId);

    // Fire signal detection in parallel — don't await yet
    const signalPromise = this.signalDetector
      .analyze(dto.content, currentInsights, {
        baselineResponseTimeMs: 0,
        turnIndex: session.exchangesCount,
        topic: session.topic,
      })
      .catch((err: unknown) => {
        this.logger.warn('signal_detection_failed', { sessionId, reason: String(err) });
        return null;
      });

    const { systemPrompt, conversationHistory } =
      await this.contextService.buildSystemPrompt(
        learnerId,
        sessionId,
        session.topic,
        currentInsights,
        learnerTier,
      );

    // Token budget check
    const totalTokenEstimate =
      this.budgetManager.estimateTokens(systemPrompt) +
      orderedMessages.reduce(
        (sum, m) =>
          sum + this.budgetManager.estimateTokens(m.compressed && m.compressionSummary ? m.compressionSummary : m.content),
        0,
      ) +
      this.budgetManager.estimateTokens(dto.content);

    if (this.budgetManager.shouldEndSession(totalTokenEstimate + session.tokenBudgetUsed)) {
      const closingMsg = await this.generateClosingMessage(session, systemPrompt, learnerTier);
      await this.prisma.session.update({
        where: { id: sessionId },
        data: { endedAt: new Date() },
      });
      await this.redisService.del(insightsKey(sessionId));
      return {
        message: closingMsg,
        phase: session.currentPhase,
        mode: session.currentMode,
        exchangesCount: session.exchangesCount,
      };
    }

    // Compress oldest messages if needed
    if (this.budgetManager.shouldCompress(totalTokenEstimate + session.tokenBudgetUsed)) {
      await this.compressOldestMessages(sessionId, orderedMessages);
    }

    const turnMessages = buildSessionTurnMessages({
      systemPrompt,
      conversationHistory,
      newUserMessage: dto.content,
    });

    const operation =
      learnerTier === 'free' ? 'session_turn_free' : 'session_turn_pro';
    const aiResponse = await this.aiService.chat(operation, turnMessages, learnerTier);

    // Await signal detection result now
    const signalResult = await signalPromise;

    let updatedInsights = currentInsights;
    if (signalResult && signalResult.signals.length > 0) {
      updatedInsights = updateInsightsWithSignals(
        currentInsights,
        signalResult.signals,
        session.exchangesCount + 1,
      );
    }

    const newMode = evaluateModeShift(updatedInsights, session.exchangesCount + 1);
    updatedInsights = { ...updatedInsights, currentMode: newMode };

    const responseTokens =
      this.budgetManager.estimateTokens(dto.content) +
      this.budgetManager.estimateTokens(aiResponse);
    const newTokenBudgetUsed = session.tokenBudgetUsed + responseTokens;

    const newExchangesCount = session.exchangesCount + 1;
    const newPhase = this.evaluatePhaseTransition(
      session.currentPhase,
      session.startedAt,
      session.timeAvailableMinutes,
      newExchangesCount,
      TIER_EXCHANGE_LIMITS[learnerTier] ?? 20,
    );

    updatedInsights = { ...updatedInsights, currentPhase: newPhase };

    // Save user message + AI response + update session atomically
    const nextUserTurnIndex = (orderedMessages[orderedMessages.length - 1]?.turnIndex ?? -1) + 1;
    const nextAiTurnIndex = nextUserTurnIndex + 1;

    await this.prisma.$transaction([
      this.prisma.sessionMessage.create({
        data: {
          sessionId,
          role: 'user',
          content: dto.content,
          turnIndex: nextUserTurnIndex,
        },
      }),
      this.prisma.sessionMessage.create({
        data: {
          sessionId,
          role: 'assistant',
          content: aiResponse,
          turnIndex: nextAiTurnIndex,
        },
      }),
      this.prisma.session.update({
        where: { id: sessionId },
        data: {
          lastActivityAt: new Date(),
          exchangesCount: newExchangesCount,
          currentMode: newMode,
          currentPhase: newPhase,
          tokenBudgetUsed: newTokenBudgetUsed,
        },
      }),
    ]);

    await this.saveInsights(sessionId, updatedInsights);

    const evalContext: ExchangeEvaluationContext = {
      topic: session.topic,
      conceptInFocus:
        updatedInsights.conceptsEngaged[updatedInsights.conceptsEngaged.length - 1] ??
        session.topic,
      sessionPhase: newPhase,
      aiMessage: aiResponse,
      learnerResponse: dto.content,
    };

    // Fire-and-forget — does not block the response
    this.evaluateExchange(learnerId, sessionId, evalContext, updatedInsights).catch((err: unknown) => {
      this.logger.error('Exchange evaluation failed', {
        sessionId,
        error: err instanceof Error ? err.message : String(err),
      });
    });

    return {
      message: aiResponse,
      phase: newPhase,
      mode: newMode,
      exchangesCount: newExchangesCount,
    };
  }

  async evaluateExchange(
    learnerId: string,
    sessionId: string,
    context: ExchangeEvaluationContext,
    insights: SessionInsights,
  ): Promise<void> {
    let evaluation: ExchangeEvaluation;

    try {
      const prompt = buildExchangeEvaluationPrompt(context);
      evaluation = await this.aiService.chatWithSchema(
        'exchange_evaluation',
        prompt,
        ExchangeEvaluationSchema,
      );
    } catch (err) {
      if (err instanceof AiUnavailableException) {
        this.logger.warn('exchange_evaluation_unavailable', {
          sessionId,
          reason: err.message,
        });
        return;
      }
      throw err;
    }

    const { canonicalId: resolvedConceptId } =
      await this.conceptRegistryService.resolveOrCreate(evaluation.conceptId, context.topic);

    await this.learnerService.upsertKnowledgeState(
      learnerId,
      resolvedConceptId,
      context.topic,
      evaluation.retentionQuality,
    );

    let updatedInsights = insights;

    if (
      evaluation.misconceptionDetected.found &&
      evaluation.misconceptionDetected.description &&
      evaluation.misconceptionDetected.type
    ) {
      await this.learnerService.addMisconception(learnerId, {
        conceptId: resolvedConceptId,
        topic: context.topic,
        description: evaluation.misconceptionDetected.description,
        misconceptionType: evaluation.misconceptionDetected.type as MisconceptionType,
      });

      updatedInsights = {
        ...updatedInsights,
        newMisconceptionsDetected: [
          ...updatedInsights.newMisconceptionsDetected,
          {
            conceptId: resolvedConceptId,
            description: evaluation.misconceptionDetected.description,
            type: evaluation.misconceptionDetected.type,
            detectedAt: updatedInsights.conceptsEngaged.length,
          },
        ],
      };
    }

    const ratingScale = RETENTION_QUALITY_SCALE[evaluation.retentionQuality];
    const newDemonstrated = updatedInsights.demonstratedLevel * 0.7 + ratingScale * 0.3;
    const selfReportedScale = selfReportedToScale(insights.selfReportedLevel);

    updatedInsights = {
      ...updatedInsights,
      demonstratedLevel: newDemonstrated,
      calibrationDelta: newDemonstrated - selfReportedScale,
    };

    await this.prisma.errorEvent.create({
      data: {
        sessionId,
        learnerId,
        conceptId: resolvedConceptId,
        topic: context.topic,
        exchangeText: `AI: ${context.aiMessage}\nLearner: ${context.learnerResponse}`,
        errorType: deriveErrorType(evaluation),
        understandingSignal: evaluation.understandingSignal,
        retentionQuality: evaluation.retentionQuality,
      },
    });

    await this.saveInsights(sessionId, updatedInsights);
  }

  async endSession(learnerId: string, sessionId: string): Promise<void> {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) throw new NotFoundException('Session not found');
    if (session.learnerId !== learnerId) throw new ForbiddenException('Access denied');

    await this.prisma.session.update({
      where: { id: sessionId },
      data: { endedAt: new Date() },
    });

    // Fire-and-forget: don't block the response on queue/Redis availability
    void this.consolidationQueue
      .add('consolidate', { sessionId, learnerId }, { attempts: 3, backoff: { type: 'exponential', delay: 2000 } })
      .catch((err: unknown) => this.logger.warn('consolidation_enqueue_failed', { sessionId, reason: String(err) }));

    void this.redisService
      .del(insightsKey(sessionId))
      .catch((err: unknown) => this.logger.warn('insights_del_failed', { sessionId, reason: String(err) }));

    this.invalidateContextCaches(learnerId, session.topic);
  }

  async getSessionHistory(
    learnerId: string,
    sessionId: string,
  ): Promise<SessionMessage[]> {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) throw new NotFoundException('Session not found');
    if (session.learnerId !== learnerId) throw new ForbiddenException('Access denied');

    return this.prisma.sessionMessage.findMany({
      where: { sessionId },
      orderBy: { turnIndex: 'asc' },
    });
  }

  async getActiveSession(learnerId: string): Promise<Session | null> {
    return this.prisma.session.findFirst({
      where: { learnerId, endedAt: null },
      orderBy: { startedAt: 'desc' },
    });
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  private async createNewSession(
    learnerId: string,
    dto: StartSessionDto,
  ): Promise<StartSessionResult> {
    const [learnerTier, priorStates] = await Promise.all([
      this.subscriptionService.getTier(learnerId),
      this.prisma.learnerKnowledgeState.findFirst({
        where: { learnerId, topic: dto.topic },
      }),
    ]);

    const initialPhase: 'activation' | 'core' = priorStates ? 'activation' : 'core';

    const session = await this.prisma.session.create({
      data: {
        learnerId,
        topic: dto.topic,
        priorKnowledgeSignal: dto.prior_knowledge_signal,
        timeAvailableMinutes: dto.time_available_minutes,
        currentPhase: initialPhase,
      },
    });

    const insights = initSessionInsights(dto.prior_knowledge_signal);
    insights.currentPhase = initialPhase;
    await this.saveInsights(session.id, insights);

    const dueStates = priorStates
      ? await this.learnerService.getDueConceptsForTopic(learnerId, dto.topic)
      : [];
    const dueConceptNames = dueStates.map((s) => s.conceptId);

    const { systemPrompt } = await this.contextService.buildSystemPrompt(
      learnerId,
      session.id,
      dto.topic,
      insights,
      learnerTier,
    );

    const openingMessages = buildSessionOpeningMessages({
      systemPrompt,
      phase: initialPhase,
      dueConceptNames: dueConceptNames.slice(0, 2),
      topic: dto.topic,
    });

    const operation = learnerTier === 'free' ? 'session_turn_free' : 'session_turn_pro';
    const openingMessage = await this.aiService.chat(operation, openingMessages, learnerTier);

    await this.prisma.sessionMessage.create({
      data: {
        sessionId: session.id,
        role: 'assistant',
        content: openingMessage,
        turnIndex: 0,
      },
    });

    return {
      sessionId: session.id,
      openingMessage,
      phase: initialPhase,
      resumeType: 'new',
      conceptsDue: dueConceptNames.slice(0, 2),
    };
  }

  private async buildTrueResumeResult(
    session: Session,
    _learnerId: string,
    _topic: string,
  ): Promise<StartSessionResult> {
    const lastMessage = await this.prisma.sessionMessage.findFirst({
      where: { sessionId: session.id, role: 'assistant' },
      orderBy: { turnIndex: 'desc' },
    });

    return {
      sessionId: session.id,
      openingMessage: lastMessage?.content ?? 'Welcome back — picking up where you left off.',
      phase: session.currentPhase,
      resumeType: 'continue',
      conceptsDue: [],
    };
  }

  private async buildSmartResumeResult(
    session: Session,
    learnerId: string,
    topic: string,
  ): Promise<StartSessionResult> {
    const messages = await this.prisma.sessionMessage.findMany({
      where: { sessionId: session.id },
      orderBy: { turnIndex: 'asc' },
      take: 10,
    });

    let summary = `Last session on "${topic}" — ${session.exchangesCount} exchanges.`;
    if (messages.length > 0) {
      try {
        summary = await this.budgetManager.buildCompressionSummary(messages);
      } catch {
        // Degraded gracefully — use default summary
      }
    }

    const dueStates = await this.learnerService.getDueConceptsForTopic(learnerId, topic);
    const dueConceptNames = dueStates.map((s) => s.conceptId);

    return {
      sessionId: session.id,
      openingMessage: `Last session summary: ${summary}\n\nReady to continue?`,
      phase: session.currentPhase,
      resumeType: 'smart',
      conceptsDue: dueConceptNames.slice(0, 2),
    };
  }

  private evaluatePhaseTransition(
    currentPhase: string,
    startedAt: Date,
    timeAvailableMinutes: number,
    exchangesCount: number,
    tierExchangeLimit: number,
  ): 'activation' | 'core' | 'consolidation' {
    if (currentPhase === 'consolidation') return 'consolidation';

    const timeElapsedMinutes = (Date.now() - startedAt.getTime()) / 60_000;
    const timeRatio = timeElapsedMinutes / timeAvailableMinutes;
    const exchangeRatio = exchangesCount / tierExchangeLimit;

    if (timeRatio >= PHASE_TRANSITION_THRESHOLD || exchangeRatio >= PHASE_TRANSITION_THRESHOLD) {
      return 'consolidation';
    }

    if (currentPhase === 'activation') {
      const activationWindow = timeAvailableMinutes * 0.15;
      if (timeElapsedMinutes > activationWindow || exchangesCount >= 3) {
        return 'core';
      }
    }

    return currentPhase as 'activation' | 'core';
  }

  private async generateClosingMessage(
    session: Session,
    systemPrompt: string,
    learnerTier: 'free' | 'pro' | 'teams',
  ): Promise<string> {
    const messages = buildSessionTurnMessages({
      systemPrompt,
      conversationHistory: [],
      newUserMessage:
        '[SESSION BUDGET REACHED] Gracefully close this session. Summarize what was covered and wish the learner well. Keep it to 2-3 sentences.',
    });
    const operation = learnerTier === 'free' ? 'session_turn_free' : 'session_turn_pro';
    return this.aiService.chat(operation, messages, learnerTier);
  }

  private async compressOldestMessages(
    sessionId: string,
    messages: SessionMessage[],
  ): Promise<void> {
    const uncompressed = messages.filter((m) => !m.compressed).slice(0, 5);
    if (uncompressed.length === 0) return;

    try {
      const summary = await this.budgetManager.buildCompressionSummary(uncompressed);
      await this.prisma.$transaction(
        uncompressed.map((m) =>
          this.prisma.sessionMessage.update({
            where: { id: m.id },
            data: { compressed: true, compressionSummary: summary },
          }),
        ),
      );
    } catch (err) {
      this.logger.warn('compression_failed', { sessionId, reason: String(err) });
    }
  }

  private async loadInsights(sessionId: string): Promise<SessionInsights> {
    try {
      const raw = await this.redisService.get(insightsKey(sessionId));
      if (raw) return JSON.parse(raw) as SessionInsights;
    } catch {
      this.logger.warn('insights_load_failed', { sessionId });
    }
    return initSessionInsights('beginner');
  }

  private async saveInsights(sessionId: string, insights: SessionInsights): Promise<void> {
    try {
      await this.redisService.set(
        insightsKey(sessionId),
        JSON.stringify(insights),
        SESSION_INSIGHTS_TTL,
      );
    } catch {
      this.logger.warn('insights_save_failed', { sessionId });
    }
  }

  private invalidateContextCaches(learnerId: string, topic: string): void {
    void this.learnerService.invalidateCachesForTopic(learnerId, topic);
  }
}
