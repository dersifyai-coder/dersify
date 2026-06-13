import { z } from 'zod';
import { type ChatMessage } from '../ai.constants';

export interface SignalDetectionContext {
  message: string;
  topic: string;
  currentMode: string;
  lastAiMessage?: string;
}

export const SignalDetectionOutputSchema = z.object({
  signals: z.array(
    z.discriminatedUnion('type', [
      z.object({
        type: z.literal('struggle'),
        concept: z.string(),
        severity: z.union([z.literal(1), z.literal(2), z.literal(3)]),
      }),
      z.object({ type: z.literal('misconception'), concept: z.string(), description: z.string() }),
      z.object({ type: z.literal('momentum'), concept: z.string() }),
      z.object({ type: z.literal('confusion'), about: z.string() }),
      z.object({ type: z.literal('breakthrough'), concept: z.string() }),
      z.object({ type: z.literal('disengagement') }),
      z.object({ type: z.literal('off_topic') }),
    ]),
  ),
  urgency: z.enum(['none', 'low', 'high']),
});

export type SignalDetectionOutput = z.infer<typeof SignalDetectionOutputSchema>;

export function buildSignalDetectionPrompt(ctx: SignalDetectionContext): ChatMessage[] {
  const lines: string[] = [
    `Analyze the learner message below for engagement signals.`,
    `Topic: ${ctx.topic}`,
    `Current mode: ${ctx.currentMode}`,
  ];

  if (ctx.lastAiMessage) {
    lines.push(`Last tutor message: ${ctx.lastAiMessage}`);
  }

  lines.push(
    ``,
    `Learner message: "${ctx.message}"`,
    ``,
    `Return ONLY valid JSON:`,
    `{`,
    `  "signals": [`,
    `    // one of:`,
    `    // {"type":"struggle","concept":"<topic>","severity":1|2|3}`,
    `    // {"type":"misconception","concept":"<topic>","description":"<what they got wrong>"}`,
    `    // {"type":"momentum","concept":"<topic>"}`,
    `    // {"type":"confusion","about":"<what confuses them>"}`,
    `    // {"type":"breakthrough","concept":"<topic>"}`,
    `    // {"type":"disengagement"}`,
    `    // {"type":"off_topic"}`,
    `  ],`,
    `  "urgency": "none" | "low" | "high"`,
    `}`,
    `Return empty signals array if the message is neutral.`,
  );

  return [
    {
      role: 'system',
      content:
        'You are a learning signal analyzer. Detect engagement signals in learner messages. Respond with valid JSON only.',
    },
    { role: 'user', content: lines.join('\n') },
  ];
}
