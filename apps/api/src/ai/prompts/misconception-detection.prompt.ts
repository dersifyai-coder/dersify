import { z } from 'zod';
import { type ChatMessage } from '../ai.constants';

export interface MisconceptionDetectionContext {
  topic: string;
  conceptId: string;
  conceptDisplayName: string;
  learnerStatement: string;
  aiCorrection: string;
}

export const MisconceptionDetailSchema = z.object({
  misconceptionType: z.enum([
    'terminology',
    'overgeneralization',
    'underapplication',
    'causal_inversion',
    'false_analogy',
    'structural',
  ]),
  description: z.string().min(10).max(500),
  severity: z.enum(['surface', 'deep']),
  remediationStrategy: z.string().min(20).max(1000),
});

export type MisconceptionDetail = z.infer<typeof MisconceptionDetailSchema>;

export function buildMisconceptionDetectionPrompt(
  ctx: MisconceptionDetectionContext,
): ChatMessage[] {
  const userContent = [
    `Topic: ${ctx.topic}`,
    `Concept: ${ctx.conceptDisplayName} (ID: ${ctx.conceptId})`,
    ``,
    `Learner's incorrect statement:`,
    `"${ctx.learnerStatement}"`,
    ``,
    `AI correction given:`,
    `"${ctx.aiCorrection}"`,
    ``,
    `Analyze this misconception and return a JSON object with exactly these fields:`,
    `{`,
    `  "misconceptionType": "terminology" | "overgeneralization" | "underapplication" | "causal_inversion" | "false_analogy" | "structural",`,
    `  "description": "<10–500 char summary of what the learner got wrong>",`,
    `  "severity": "surface" | "deep",`,
    `  "remediationStrategy": "<20–1000 char concrete AI instruction for future sessions>"`,
    `}`,
    ``,
    `Misconception type definitions:`,
    `- terminology: wrong word used, right underlying concept`,
    `- overgeneralization: rule applied too broadly`,
    `- underapplication: rule applied too narrowly`,
    `- causal_inversion: cause and effect reversed`,
    `- false_analogy: concept drawn from wrong domain`,
    `- structural: learner's fundamental model of the concept is wrong`,
    ``,
    `Severity:`,
    `- "deep" if the learner's model of the concept is fundamentally wrong`,
    `- "surface" if it is a terminology or minor confusion`,
    ``,
    `remediationStrategy must be a concrete AI instruction, not a re-explanation. Example:`,
    `"Ask learner to compare X with Y. Have them identify the specific difference. Avoid re-explaining — prompt them to derive the correction themselves."`,
    ``,
    `Respond only with JSON. No markdown wrapping.`,
  ].join('\n');

  return [
    {
      role: 'system',
      content:
        'You are a misconception analysis engine. Classify learner misconceptions and generate targeted remediation strategies. Return structured JSON only. No markdown, no explanation.',
    },
    { role: 'user', content: userContent },
  ];
}
