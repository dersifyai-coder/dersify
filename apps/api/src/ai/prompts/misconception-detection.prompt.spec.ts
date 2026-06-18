import {
  buildMisconceptionDetectionPrompt,
  MisconceptionDetailSchema,
  type MisconceptionDetectionContext,
} from './misconception-detection.prompt';

function contextWithDefaults(
  overrides: Partial<MisconceptionDetectionContext> = {},
): MisconceptionDetectionContext {
  return {
    topic: 'Python',
    conceptId: 'python.lists.mutability',
    conceptDisplayName: 'List Mutability',
    learnerStatement: 'Lists are immutable just like tuples.',
    aiCorrection:
      'Actually, lists in Python are mutable — you can change their contents after creation. Tuples are the immutable sequence type.',
    ...overrides,
  };
}

describe('buildMisconceptionDetectionPrompt', () => {
  it('returns a system message and a user message', () => {
    const prompt = buildMisconceptionDetectionPrompt(contextWithDefaults());
    expect(prompt).toHaveLength(2);
    expect(prompt[0]!.role).toBe('system');
    expect(prompt[1]!.role).toBe('user');
  });

  it('includes the learner statement in the prompt', () => {
    const prompt = buildMisconceptionDetectionPrompt(
      contextWithDefaults({ learnerStatement: 'Variables are the same as constants.' }),
    );
    const combined = prompt.map((m) => m.content).join('\n');
    expect(combined).toContain('Variables are the same as constants.');
  });

  it('includes the AI correction in the prompt', () => {
    const prompt = buildMisconceptionDetectionPrompt(
      contextWithDefaults({ aiCorrection: 'Variables can be reassigned; constants cannot.' }),
    );
    const combined = prompt.map((m) => m.content).join('\n');
    expect(combined).toContain('Variables can be reassigned; constants cannot.');
  });

  it('includes the concept display name in the prompt', () => {
    const prompt = buildMisconceptionDetectionPrompt(
      contextWithDefaults({ conceptDisplayName: 'List Mutability' }),
    );
    const combined = prompt.map((m) => m.content).join('\n');
    expect(combined).toContain('List Mutability');
  });

  it('includes all 6 misconception type names', () => {
    const prompt = buildMisconceptionDetectionPrompt(contextWithDefaults());
    const combined = prompt.map((m) => m.content).join('\n');
    expect(combined).toContain('terminology');
    expect(combined).toContain('overgeneralization');
    expect(combined).toContain('underapplication');
    expect(combined).toContain('causal_inversion');
    expect(combined).toContain('false_analogy');
    expect(combined).toContain('structural');
  });

  it('instructs to respond with JSON only', () => {
    const prompt = buildMisconceptionDetectionPrompt(contextWithDefaults());
    const combined = prompt.map((m) => m.content).join('\n');
    expect(combined).toMatch(/only with JSON/i);
  });
});

describe('MisconceptionDetailSchema', () => {
  const validDetail = {
    misconceptionType: 'terminology',
    description: 'Learner confused list mutability with tuple immutability.',
    severity: 'surface',
    remediationStrategy:
      'Ask the learner to try modifying a list element in the REPL. Have them observe the result before explaining the difference.',
  };

  it('validates a correct misconception detail', () => {
    const result = MisconceptionDetailSchema.safeParse(validDetail);
    expect(result.success).toBe(true);
  });

  it('rejects an invalid misconceptionType', () => {
    const result = MisconceptionDetailSchema.safeParse({
      ...validDetail,
      misconceptionType: 'unknown_type',
    });
    expect(result.success).toBe(false);
  });

  it('rejects each of the 6 valid misconceptionType values as valid', () => {
    const validTypes = [
      'terminology',
      'overgeneralization',
      'underapplication',
      'causal_inversion',
      'false_analogy',
      'structural',
    ];
    for (const type of validTypes) {
      const result = MisconceptionDetailSchema.safeParse({ ...validDetail, misconceptionType: type });
      expect(result.success).toBe(true);
    }
  });

  it('rejects remediationStrategy under 20 characters', () => {
    const result = MisconceptionDetailSchema.safeParse({
      ...validDetail,
      remediationStrategy: 'Too short.',
    });
    expect(result.success).toBe(false);
  });

  it('rejects remediationStrategy over 1000 characters', () => {
    const result = MisconceptionDetailSchema.safeParse({
      ...validDetail,
      remediationStrategy: 'x'.repeat(1001),
    });
    expect(result.success).toBe(false);
  });

  it('rejects description under 10 characters', () => {
    const result = MisconceptionDetailSchema.safeParse({
      ...validDetail,
      description: 'Short',
    });
    expect(result.success).toBe(false);
  });

  it('rejects description over 500 characters', () => {
    const result = MisconceptionDetailSchema.safeParse({
      ...validDetail,
      description: 'x'.repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid severity', () => {
    const result = MisconceptionDetailSchema.safeParse({
      ...validDetail,
      severity: 'moderate',
    });
    expect(result.success).toBe(false);
  });

  it('accepts severity "deep"', () => {
    const result = MisconceptionDetailSchema.safeParse({
      ...validDetail,
      severity: 'deep',
    });
    expect(result.success).toBe(true);
  });
});
