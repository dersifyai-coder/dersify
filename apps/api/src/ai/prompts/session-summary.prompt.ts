import { z } from 'zod';
import { type ChatMessage } from '../ai.constants';

export interface SessionSummaryContext {
  messages: Array<{ role: string; content: string }>;
  startTurn: number;
  endTurn: number;
}

export const SessionSummaryOutputSchema = z.string().min(1);
export type SessionSummaryOutput = z.infer<typeof SessionSummaryOutputSchema>;

export function buildSessionSummaryPrompt(ctx: SessionSummaryContext): ChatMessage[] {
  const exchange = ctx.messages
    .map((m) => `${m.role === 'user' ? 'Learner' : 'Tutor'}: ${m.content}`)
    .join('\n\n');

  return [
    {
      role: 'system',
      content:
        'You summarize learning exchanges concisely. Output only the plain text summary — no labels, no JSON, no markdown.',
    },
    {
      role: 'user',
      content: `Summarize turns ${ctx.startTurn}–${ctx.endTurn} in exactly 3 sentences. State what concept was being taught and what the learner understood or struggled with.\n\n${exchange}`,
    },
  ];
}
