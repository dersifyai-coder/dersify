import {
  buildExchangeEvaluationPrompt,
  ExchangeEvaluationSchema,
  type ExchangeEvaluationContext,
} from './exchange-evaluation.prompt';

function contextWithDefaults(overrides: Partial<ExchangeEvaluationContext> = {}): ExchangeEvaluationContext {
  return {
    topic: 'React',
    conceptInFocus: 'useState hook',
    sessionPhase: 'core',
    aiMessage: 'Can you explain what useState does?',
    learnerResponse: 'It manages component state.',
    ...overrides,
  };
}

describe('buildExchangeEvaluationPrompt', () => {
  it('includes the AI message in the prompt', () => {
    const prompt = buildExchangeEvaluationPrompt(
      contextWithDefaults({ aiMessage: 'What is a closure in JavaScript?' }),
    );
    const allContent = prompt.map((m) => m.content).join('\n');
    expect(allContent).toContain('What is a closure in JavaScript?');
  });

  it('includes the learner response in the prompt', () => {
    const prompt = buildExchangeEvaluationPrompt(
      contextWithDefaults({ learnerResponse: 'A function that captures outer variables.' }),
    );
    const allContent = prompt.map((m) => m.content).join('\n');
    expect(allContent).toContain('A function that captures outer variables.');
  });

  it('includes the non-English language evaluation instruction', () => {
    const prompt = buildExchangeEvaluationPrompt(contextWithDefaults());
    const allContent = prompt.map((m) => m.content).join('\n');
    expect(allContent).toContain('language other than English');
    expect(allContent).toContain('evaluate the content accurately regardless of language');
  });

  it('includes a 1-4 rating scale description', () => {
    const prompt = buildExchangeEvaluationPrompt(contextWithDefaults());
    const allContent = prompt.map((m) => m.content).join('\n');
    expect(allContent).toContain('1 = Complete failure/wrong');
    expect(allContent).toContain('4 = Effortless/clearly understood');
  });

  it('returns a system message and a user message', () => {
    const prompt = buildExchangeEvaluationPrompt(contextWithDefaults());
    expect(prompt).toHaveLength(2);
    expect(prompt[0]!.role).toBe('system');
    expect(prompt[1]!.role).toBe('user');
  });
});

describe('ExchangeEvaluationSchema', () => {
  const validEvaluation = {
    conceptId: 'react.usestate-hook',
    retentionQuality: 3,
    understandingSignal: 'partial',
    misconceptionDetected: { found: false },
  };

  it('validates a correct evaluation object', () => {
    const result = ExchangeEvaluationSchema.safeParse(validEvaluation);
    expect(result.success).toBe(true);
  });

  it('rejects retentionQuality: 5 (out of range)', () => {
    const result = ExchangeEvaluationSchema.safeParse({
      ...validEvaluation,
      retentionQuality: 5,
    });
    expect(result.success).toBe(false);
  });

  it('rejects retentionQuality: 0 (out of range)', () => {
    const result = ExchangeEvaluationSchema.safeParse({
      ...validEvaluation,
      retentionQuality: 0,
    });
    expect(result.success).toBe(false);
  });

  it('validates all understandingSignal values', () => {
    const signals = ['confirmed', 'partial', 'confused', 'memorized', 'breakthrough'] as const;
    for (const signal of signals) {
      const result = ExchangeEvaluationSchema.safeParse({
        ...validEvaluation,
        understandingSignal: signal,
      });
      expect(result.success).toBe(true);
    }
  });

  it('rejects an invalid understandingSignal value', () => {
    const result = ExchangeEvaluationSchema.safeParse({
      ...validEvaluation,
      understandingSignal: 'unknown',
    });
    expect(result.success).toBe(false);
  });

  it('validates a full misconception with all optional fields', () => {
    const result = ExchangeEvaluationSchema.safeParse({
      ...validEvaluation,
      misconceptionDetected: {
        found: true,
        concept: 'useState',
        description: 'Learner confused useState with useEffect',
        severity: 'surface',
        type: 'terminology',
      },
    });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid misconception type', () => {
    const result = ExchangeEvaluationSchema.safeParse({
      ...validEvaluation,
      misconceptionDetected: {
        found: true,
        concept: 'useState',
        description: 'wrong',
        type: 'made_up_type',
      },
    });
    expect(result.success).toBe(false);
  });

  it('rejects when misconceptionDetected is missing', () => {
    const { misconceptionDetected: _, ...withoutField } = validEvaluation;
    const result = ExchangeEvaluationSchema.safeParse(withoutField);
    expect(result.success).toBe(false);
  });
});
