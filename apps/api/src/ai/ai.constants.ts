export const EMBEDDING_DIMENSION = 768;
export const SESSION_TOKEN_HARD_LIMIT = 100_000;
export const AI_TIMEOUT_MS = 10_000;

export const MODEL_ROUTING = {
  session_turn_pro:           { primary: 'gemini-1.5-pro',       fallback: 'gpt-4o' },
  session_turn_free:          { primary: 'gemini-2.0-flash',     fallback: 'gpt-4o-mini' },
  signal_detection:           { primary: 'gemini-2.0-flash',     fallback: 'gpt-4o-mini' },
  exchange_evaluation:        { primary: 'gemini-2.0-flash',     fallback: 'gpt-4o-mini' },
  misconception_detection:    { primary: 'gemini-2.0-flash',     fallback: 'gpt-4o-mini' },
  session_summary:            { primary: 'gemini-2.0-flash',     fallback: 'gpt-4o-mini' },
  weekly_digest:              { primary: 'gemini-1.5-pro',       fallback: 'gpt-4o' },
  misconception_remediation:  { primary: 'gemini-1.5-pro',       fallback: 'gpt-4o' },
  embedding_primary:          { model: 'text-embedding-004',     provider: 'google' as const },
  embedding_fallback:         { model: 'text-embedding-3-small', provider: 'openai' as const, dimensions: 768 },
} as const;

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
