import { z } from 'zod';
import { type ChatMessage } from '../ai.constants';

export interface ExchangeEvaluationContext {
  topic: string;
  conceptInFocus: string;
  sessionPhase: string;
  aiMessage: string;
  learnerResponse: string;
}

export const ExchangeEvaluationSchema = z.object({
  conceptId: z.string(),
  retentionQuality: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  understandingSignal: z.enum(['confirmed', 'partial', 'confused', 'memorized', 'breakthrough']),
  misconceptionDetected: z.object({
    found: z.boolean(),
    concept: z.string().optional(),
    description: z.string().optional(),
    severity: z.enum(['surface', 'deep']).optional(),
    type: z
      .enum([
        'terminology',
        'overgeneralization',
        'underapplication',
        'causal_inversion',
        'false_analogy',
        'structural',
      ])
      .optional(),
  }),
});

export type ExchangeEvaluation = z.infer<typeof ExchangeEvaluationSchema>;

export function buildExchangeEvaluationPrompt(ctx: ExchangeEvaluationContext): ChatMessage[] {
  const userContent = [
    `Topic: ${ctx.topic}`,
    `Concept in focus: ${ctx.conceptInFocus}`,
    `Session phase: ${ctx.sessionPhase}`,
    ``,
    `Tutor message:`,
    `"${ctx.aiMessage}"`,
    ``,
    `Learner response:`,
    `"${ctx.learnerResponse}"`,
    ``,
    `Evaluate the learner's understanding from this exchange.`,
    ``,
    `Rate the learner's recall/understanding on a scale of 1-4:`,
    `1 = Complete failure/wrong`,
    `2 = Correct with difficulty/partial`,
    `3 = Correct with some effort`,
    `4 = Effortless/clearly understood`,
    ``,
    `If the learner responded in a language other than English, evaluate the content accurately regardless of language.`,
    ``,
    `Return ONLY valid JSON matching this schema exactly:`,
    `{`,
    `  "conceptId": "<normalized concept slug — kebab-case, scoped to the topic>",`,
    `  "retentionQuality": 1 | 2 | 3 | 4,`,
    `  "understandingSignal": "confirmed" | "partial" | "confused" | "memorized" | "breakthrough",`,
    `  "misconceptionDetected": {`,
    `    "found": true | false,`,
    `    "concept": "<concept name — omit if found is false>",`,
    `    "description": "<what the learner got wrong — omit if found is false>",`,
    `    "severity": "surface" | "deep" (omit if found is false),`,
    `    "type": "terminology" | "overgeneralization" | "underapplication" | "causal_inversion" | "false_analogy" | "structural" (omit if found is false)`,
    `  }`,
    `}`,
    `Omit all optional fields inside misconceptionDetected when found is false.`,
  ].join('\n');

  return [
    {
      role: 'system',
      content:
        'You are a learning evaluation engine. Assess learner understanding from tutor-learner exchanges. Return structured JSON only. No markdown, no explanation.',
    },
    { role: 'user', content: userContent },
  ];
}
