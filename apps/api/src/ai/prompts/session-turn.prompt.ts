import { type ChatMessage } from '../ai.constants';

export interface SessionTurnContext {
  systemPrompt: string;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  newUserMessage: string;
}

export function buildSessionTurnMessages(ctx: SessionTurnContext): ChatMessage[] {
  return [
    { role: 'system', content: ctx.systemPrompt },
    ...ctx.conversationHistory,
    { role: 'user', content: ctx.newUserMessage },
  ];
}

export interface SessionOpeningContext {
  systemPrompt: string;
  phase: 'activation' | 'core';
  dueConceptNames: string[];
  topic: string;
}

export function buildSessionOpeningMessages(ctx: SessionOpeningContext): ChatMessage[] {
  const trigger =
    ctx.phase === 'activation'
      ? `[SESSION START] Begin immediately with 1-2 direct recall questions about: ${ctx.dueConceptNames.join(', ')}. No introduction, no preamble — ask directly.`
      : `[SESSION START] Introduce "${ctx.topic}" briefly in 1-2 sentences. Then ask what the learner already knows before diving in.`;

  return [
    { role: 'system', content: ctx.systemPrompt },
    { role: 'user', content: trigger },
  ];
}
