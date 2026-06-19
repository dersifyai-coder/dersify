import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConceptWithState, LearnerService, MisconceptionWithConcept } from '../learner/learner.service';
import { RagService } from '../rag/rag.service';
import { ContextBudgetManager } from './context-budget.manager';
import { MOTIVATION_FRAMING } from './motivation-framing';
import { MODE_INSTRUCTIONS } from './mode-shifts';
import { SessionInsights } from './session-insights';

export interface ContextResult {
  systemPrompt: string;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
}

const LAYER1_CACHE_TTL_MS = 10 * 60 * 1000;

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

function layer1CacheKey(learnerId: string, topic: string): string {
  return `dersify:context:layer1:${learnerId}:${topic}`;
}

@Injectable()
export class ContextService {
  private readonly logger = new Logger(ContextService.name);
  private readonly cache = new Map<string, CacheEntry<string>>();

  constructor(
    private readonly learnerService: LearnerService,
    private readonly prisma: PrismaService,
    private readonly budgetManager: ContextBudgetManager,
    @Optional() @Inject(RagService) private readonly ragService: RagService | null,
  ) {}

  async buildSystemPrompt(
    learnerId: string,
    sessionId: string,
    topic: string,
    sessionInsights: SessionInsights,
    tier: string,
  ): Promise<ContextResult> {
    const [layer1, conversationHistory] = await Promise.all([
      this.buildLayer1(learnerId, topic),
      this.buildConversationHistory(sessionId),
    ]);

    const layer2 = this.buildLayer2(sessionInsights);

    const systemPrompt = [
      `You are Dersify — a personal AI tutor for ${topic}.`,
      ``,
      layer1,
      ``,
      layer2,
      ``,
      this.buildRules(),
    ].join('\n');

    void tier;
    return { systemPrompt, conversationHistory };
  }

  private async buildLayer1(learnerId: string, topic: string): Promise<string> {
    const cacheKey = layer1CacheKey(learnerId, topic);
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    const [profile, knowledgeSummary, misconceptions] = await Promise.all([
      this.learnerService.getProfile(learnerId),
      this.learnerService.getTopicKnowledgeSummary(learnerId, topic),
      this.learnerService.getActiveMisconceptions(learnerId, topic),
    ]);

    const motivation = profile.motivation ?? 'curiosity';
    const framingInstruction =
      MOTIVATION_FRAMING[motivation] ?? MOTIVATION_FRAMING['curiosity'];

    const calibration = this.buildCalibrationLine(profile.calibrationScore);

    const confirmedNames = knowledgeSummary.confirmed.map((c: ConceptWithState) => c.displayName).join(', ') || 'None yet';
    const shakyNames = knowledgeSummary.shaky.map((c: ConceptWithState) => c.displayName).join(', ') || 'None';
    const newNames = knowledgeSummary.newConcepts.map((c: ConceptWithState) => c.displayName).join(', ') || 'None';

    const misconceptionLines =
      misconceptions.length > 0
        ? misconceptions
            .slice(0, 5)
            .map((m: MisconceptionWithConcept) => {
              const lines = [
                `• ${m.concept.displayName}: ${m.description}`,
                `  Type: ${m.misconceptionType} | Severity: ${m.severity}`,
              ];
              if (m.remediationStrategy) {
                lines.push(`  Remediation: ${m.remediationStrategy}`);
              }
              return lines.join('\n');
            })
            .join('\n')
        : 'No active misconceptions on this topic.';

    const ragSection = await this.buildRagSection(learnerId, topic);

    const layer1 = [
      `LEARNER PROFILE:`,
      `Motivation: ${motivation} — ${framingInstruction}`,
      `Learning approach: ${profile.learningApproach ?? 'not specified'}`,
      `When stuck: ${profile.struggleResponse ?? 'not specified'}`,
      `${calibration}`,
      ``,
      `KNOWLEDGE ON THIS TOPIC — "${topic}":`,
      `Confirmed (confidence >= 0.65): ${confirmedNames}`,
      `Shaky (confidence 0.30–0.65): ${shakyNames}`,
      `New to learner (confidence < 0.30): ${newNames}`,
      ``,
      `ACTIVE MISCONCEPTIONS ON THIS TOPIC:`,
      misconceptionLines,
      ...(ragSection ? ['', ragSection] : []),
    ].join('\n');

    this.setCache(cacheKey, layer1);
    return layer1;
  }

  private buildLayer2(insights: SessionInsights): string {
    const modeInstruction = MODE_INSTRUCTIONS[insights.currentMode];
    const newMisconceptions =
      insights.newMisconceptionsDetected.length > 0
        ? insights.newMisconceptionsDetected
            .map((m) => `• ${m.conceptId}: ${m.description}`)
            .join('\n')
        : 'None detected yet';

    const confirmedThisSession =
      insights.conceptsConfirmed.length > 0
        ? insights.conceptsConfirmed.join(', ')
        : 'None yet';

    return [
      `CURRENT SESSION STATE:`,
      `Mode: ${insights.currentMode} — ${modeInstruction}`,
      `Phase: ${insights.currentPhase}`,
      `Struggle ratio this session: ${insights.struggleSignals} struggles, ${insights.momentumSignals} momentum signals`,
      `New misconceptions this session (not yet in permanent model):`,
      newMisconceptions,
      `Concepts confirmed this session: ${confirmedThisSession}`,
    ].join('\n');
  }

  private buildRules(): string {
    return [
      `RULES:`,
      `- Never explain what the learner already knows well (confidence >= 0.65) unless they ask.`,
      `- When a concept is shaky (confidence 0.30–0.65), probe understanding before assuming it's solid.`,
      `- When mode is 'rescue': slow down, simplify, change the teaching approach from what you just tried.`,
      `- When mode is 'acceleration': skip basics, challenge the learner with harder cases.`,
      `- When mode is 'refocus': gently redirect to the topic if the learner went off-topic.`,
      `- During CONSOLIDATION phase: ask the learner to explain concepts back in their own words.`,
      `- During ACTIVATION phase: always start with 1-2 recall questions about last session before teaching.`,
      `- Respond in the learner's language if they write in a language other than English.`,
      `- Never use the word "Dersify" more than once per session.`,
      `- Never mention modes, calibration scores, or internal system state to the learner.`,
      ``,
      `MISCONCEPTION HANDLING:`,
      `When you detect that a misconception listed above is surfacing again in the learner's response:`,
      `- Do NOT simply re-explain the correct concept.`,
      `- Use the remediation strategy listed above for that specific misconception.`,
      `- After addressing it, ask a follow-up to confirm the misconception has been resolved.`,
      `- If resolved: it will be marked resolved in the next session update.`,
    ].join('\n');
  }

  private buildCalibrationLine(score: number): string {
    if (score > 0.5) {
      return `Calibration: This learner typically underestimates their ability. Probe deeper than their self-report suggests.`;
    }
    if (score < -0.5) {
      return `Calibration: This learner overestimates their ability. Check understanding before advancing.`;
    }
    return `Calibration: Self-reported level is well-calibrated.`;
  }

  private async buildConversationHistory(
    sessionId: string,
  ): Promise<Array<{ role: 'user' | 'assistant'; content: string }>> {
    const messages = await this.prisma.sessionMessage.findMany({
      where: { sessionId },
      orderBy: { turnIndex: 'asc' },
    });

    return messages.map((m: typeof messages[number]) => ({
      role: m.role as 'user' | 'assistant',
      content:
        m.compressed && m.compressionSummary != null ? m.compressionSummary : m.content,
    }));
  }

  private async buildRagSection(learnerId: string, topic: string): Promise<string | null> {
    if (!this.ragService) return null;

    const ragWithSearch = this.ragService as unknown as {
      search?: (learnerId: string, topic: string, topK: number) => Promise<Array<{ content: string }>>;
    };

    if (typeof ragWithSearch.search !== 'function') return null;

    try {
      const chunks = await ragWithSearch.search(learnerId, topic, 3);
      if (chunks.length === 0) return null;
      return [
        `LEARNER'S OWN MATERIALS (ground explanations in these when relevant):`,
        ...chunks.map((c, i) => `[Source ${i + 1}]: ${c.content}`),
      ].join('\n');
    } catch (err) {
      this.logger.warn('rag_section_failed', { learnerId, topic, reason: String(err) });
      return null;
    }
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
    this.cache.set(key, { value, expiresAt: Date.now() + LAYER1_CACHE_TTL_MS });
  }
}
