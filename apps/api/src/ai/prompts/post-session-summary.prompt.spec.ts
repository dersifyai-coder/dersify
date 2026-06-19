import {
  buildPostSessionSummaryPrompt,
  PostSessionSummaryContext,
  PostSessionSummarySchema,
} from './post-session-summary.prompt';

const BASE_CTX: PostSessionSummaryContext = {
  topic: 'React hooks',
  durationMinutes: 25,
  exchangeCount: 12,
  conceptsCovered: ['useState', 'useEffect'],
  conceptsConfirmed: ['useState'],
  newMisconceptions: ['Believes useEffect runs before render'],
  phase: 'consolidation',
  priorKnowledgeSignal: 'beginner',
};

describe('buildPostSessionSummaryPrompt', () => {
  it('returns system + user messages', () => {
    const messages = buildPostSessionSummaryPrompt(BASE_CTX);
    expect(messages).toHaveLength(2);
    expect(messages[0].role).toBe('system');
    expect(messages[1].role).toBe('user');
  });

  it('includes topic in the user message', () => {
    const messages = buildPostSessionSummaryPrompt(BASE_CTX);
    expect(messages[1].content).toContain('React hooks');
  });

  it('includes duration and exchange count', () => {
    const messages = buildPostSessionSummaryPrompt(BASE_CTX);
    expect(messages[1].content).toContain('25 minutes');
    expect(messages[1].content).toContain('12');
  });

  it('lists concepts covered', () => {
    const messages = buildPostSessionSummaryPrompt(BASE_CTX);
    expect(messages[1].content).toContain('useState');
    expect(messages[1].content).toContain('useEffect');
  });

  it('falls back to "general exploration" when no concepts covered', () => {
    const messages = buildPostSessionSummaryPrompt({ ...BASE_CTX, conceptsCovered: [] });
    expect(messages[1].content).toContain('general exploration');
  });

  it('falls back to "none confirmed yet" when no concepts confirmed', () => {
    const messages = buildPostSessionSummaryPrompt({ ...BASE_CTX, conceptsConfirmed: [] });
    expect(messages[1].content).toContain('none confirmed yet');
  });

  it('falls back to "none identified" when no misconceptions', () => {
    const messages = buildPostSessionSummaryPrompt({ ...BASE_CTX, newMisconceptions: [] });
    expect(messages[1].content).toContain('none identified');
  });
});

describe('PostSessionSummarySchema', () => {
  it('accepts valid summary object', () => {
    const result = PostSessionSummarySchema.safeParse({
      title: 'React hooks: managing state',
      whatWeCovered: ['You explored how useState manages component state.'],
      whatYouHave: ['You can correctly initialize and update state with useState.'],
      nextFocus: ['Try understanding the dependency array in useEffect.'],
      estimatedRetention: 72,
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing required fields', () => {
    const result = PostSessionSummarySchema.safeParse({
      title: 'React hooks',
    });
    expect(result.success).toBe(false);
  });

  it('rejects estimatedRetention outside 0-100', () => {
    const result = PostSessionSummarySchema.safeParse({
      title: 'React hooks',
      whatWeCovered: ['Something'],
      whatYouHave: ['Something'],
      nextFocus: ['Something'],
      estimatedRetention: 150,
    });
    expect(result.success).toBe(false);
  });

  it('rejects title longer than 80 chars', () => {
    const result = PostSessionSummarySchema.safeParse({
      title: 'A'.repeat(81),
      whatWeCovered: ['Something'],
      whatYouHave: ['Something'],
      nextFocus: ['Something'],
      estimatedRetention: 70,
    });
    expect(result.success).toBe(false);
  });
});
