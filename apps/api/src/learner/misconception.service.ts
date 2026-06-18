import { Injectable, Logger } from '@nestjs/common';
import { Misconception } from '@dersify/database';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { AiUnavailableException } from '../ai/exceptions/ai-unavailable.exception';
import {
  buildMisconceptionDetectionPrompt,
  MisconceptionDetail,
  MisconceptionDetailSchema,
  type MisconceptionDetectionContext,
} from '../ai/prompts/misconception-detection.prompt';

export type MisconceptionTypeValue =
  | 'terminology'
  | 'overgeneralization'
  | 'underapplication'
  | 'causal_inversion'
  | 'false_analogy'
  | 'structural';

export interface MisconceptionData {
  conceptId: string;
  topic: string;
  description: string;
  misconceptionType: MisconceptionTypeValue;
  severity?: 'surface' | 'deep';
  learnerStatement?: string;
  aiCorrection?: string;
}

function keywordsOf(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3),
  );
}

function isSimilarDescription(a: string, b: string): boolean {
  const wordsA = keywordsOf(a);
  if (wordsA.size === 0) return false;
  const wordsB = keywordsOf(b);
  const overlap = [...wordsA].filter((w) => wordsB.has(w)).length;
  return overlap / wordsA.size >= 0.7;
}

@Injectable()
export class MisconceptionService {
  private readonly logger = new Logger(MisconceptionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async generateRemediation(
    ctx: MisconceptionDetectionContext,
  ): Promise<MisconceptionDetail | null> {
    try {
      const prompt = buildMisconceptionDetectionPrompt(ctx);
      return await this.aiService.chatWithSchema(
        'misconception_detection',
        prompt,
        MisconceptionDetailSchema,
      );
    } catch (err) {
      if (err instanceof AiUnavailableException) {
        this.logger.warn('misconception_remediation_unavailable', {
          conceptId: ctx.conceptId,
          reason: err.message,
        });
        return null;
      }
      throw err;
    }
  }

  async addOrUpdateMisconception(
    learnerId: string,
    data: MisconceptionData,
  ): Promise<Misconception> {
    const concept = await this.prisma.conceptRegistry.findUnique({
      where: { canonicalId: data.conceptId },
      select: { displayName: true },
    });

    const conceptDisplayName = concept?.displayName ?? data.conceptId;

    let remediationStrategy: string | null = null;
    let severity: 'surface' | 'deep' = data.severity ?? 'surface';

    if (data.learnerStatement && data.aiCorrection) {
      const ctx: MisconceptionDetectionContext = {
        topic: data.topic,
        conceptId: data.conceptId,
        conceptDisplayName,
        learnerStatement: data.learnerStatement,
        aiCorrection: data.aiCorrection,
      };
      const detail = await this.generateRemediation(ctx);
      if (detail) {
        remediationStrategy = detail.remediationStrategy;
        severity = detail.severity;
      }
    }

    const existing = await this.prisma.misconception.findMany({
      where: { learnerId, conceptId: data.conceptId, resolved: false },
    });

    const match = existing.find((m) => isSimilarDescription(m.description, data.description));

    if (match) {
      const shouldUpdateRemediation =
        remediationStrategy !== null &&
        (match.remediationStrategy === null ||
          remediationStrategy.length > match.remediationStrategy.length);

      return this.prisma.misconception.update({
        where: { id: match.id },
        data: {
          frequency: { increment: 1 },
          severity,
          ...(shouldUpdateRemediation ? { remediationStrategy } : {}),
        },
      });
    }

    return this.prisma.misconception.create({
      data: {
        learnerId,
        conceptId: data.conceptId,
        topic: data.topic,
        description: data.description,
        misconceptionType: data.misconceptionType,
        severity,
        remediationStrategy,
        frequency: 1,
        resolved: false,
      },
    });
  }
}
