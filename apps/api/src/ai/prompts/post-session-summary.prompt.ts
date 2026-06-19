import { z } from 'zod';
import { type ChatMessage } from '../ai.constants';

export interface PostSessionSummaryContext {
  topic: string;
  durationMinutes: number;
  exchangeCount: number;
  conceptsCovered: string[];
  conceptsConfirmed: string[];
  newMisconceptions: string[];
  phase: string;
  priorKnowledgeSignal: string;
}

export const PostSessionSummarySchema = z.object({
  title: z.string().max(80),
  whatWeCovered: z.array(z.string()).min(1).max(5),
  whatYouHave: z.array(z.string()).min(1).max(3),
  nextFocus: z.array(z.string()).min(1).max(3),
  estimatedRetention: z.number().int().min(0).max(100),
});

export type PostSessionSummary = z.infer<typeof PostSessionSummarySchema>;

export function buildPostSessionSummaryPrompt(ctx: PostSessionSummaryContext): ChatMessage[] {
  const covered = ctx.conceptsCovered.join(', ') || 'general exploration';
  const confirmed = ctx.conceptsConfirmed.join(', ') || 'none confirmed yet';
  const misconceptions = ctx.newMisconceptions.join('; ') || 'none identified';

  const userContent = [
    `Topic: ${ctx.topic}`,
    `Duration: ${ctx.durationMinutes} minutes`,
    `Exchanges: ${ctx.exchangeCount}`,
    `Prior knowledge level: ${ctx.priorKnowledgeSignal}`,
    `Phase reached: ${ctx.phase}`,
    `Concepts covered: ${covered}`,
    `Concepts confirmed understood: ${confirmed}`,
    `New misconceptions detected: ${misconceptions}`,
    ``,
    `Generate a post-session learning summary for the learner.`,
    ``,
    `Return ONLY valid JSON matching this schema exactly:`,
    `{`,
    `  "title": "<descriptive session title, max 80 chars, sentence-case>",`,
    `  "whatWeCovered": ["<1-sentence bullet>", ...],`,
    `  "whatYouHave": ["<strength the learner demonstrated — 1 sentence>", ...],`,
    `  "nextFocus": ["<what to revisit or go deeper on next time — 1 sentence>", ...],`,
    `  "estimatedRetention": <integer 0-100>`,
    `}`,
    ``,
    `Rules:`,
    `- title: sentence-case, descriptive and topic-specific (e.g. "React hooks: managing state")`,
    `- whatWeCovered: 1-5 items. What was explored in this session. Be specific, not generic.`,
    `- whatYouHave: 1-3 items. Concrete strengths or understanding the learner showed.`,
    `- nextFocus: 1-3 items. Natural next steps based on what was shaky or misconceptions detected.`,
    `- estimatedRetention: 70-90 for mostly confirmed with few misconceptions; 40-60 mixed; 20-40 if many misconceptions.`,
    `- Never mention FSRS, session phases, modes, or internal system names.`,
    `- One sentence per bullet.`,
  ].join('\n');

  return [
    {
      role: 'system',
      content:
        'You are generating a warm, honest post-session learning summary. Return structured JSON only. No markdown fences, no explanation.',
    },
    { role: 'user', content: userContent },
  ];
}
