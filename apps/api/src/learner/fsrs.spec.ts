import {
  FsrsCard,
  FsrsRating,
  getConfidence,
  getDueStatus,
  initCard,
  schedule,
} from './fsrs';

const NOW = new Date('2026-01-01T12:00:00Z');

function makeReviewCard(overrides: Partial<FsrsCard> = {}): FsrsCard {
  return {
    stability: 4.1543,
    difficulty: 0.3,
    elapsedDays: 4,
    scheduledDays: 4,
    reps: 1,
    lapses: 0,
    state: 2,
    due: new Date('2026-01-01T12:00:00Z'),
    lastReviewedAt: new Date('2025-12-28T12:00:00Z'),
    ...overrides,
  };
}

describe('initCard', () => {
  it('has state=0, reps=0, and confidence=0', () => {
    const card = initCard();
    expect(card.state).toBe(0);
    expect(card.reps).toBe(0);
    expect(getConfidence(card, NOW)).toBe(0);
  });
});

describe('schedule — New card', () => {
  it('rating=3 (Good) transitions to Review (state=2)', () => {
    const result = schedule(initCard(), 3, NOW);
    expect(result.state).toBe(2);
    expect(result.reps).toBe(1);
    expect(result.stability).toBeGreaterThan(0);
  });

  it('rating=1 (Again) transitions to Learning (state=1)', () => {
    const result = schedule(initCard(), 1, NOW);
    expect(result.state).toBe(1);
    expect(result.reps).toBe(1);
  });

  it('rating=2 (Hard) transitions to Review due tomorrow', () => {
    const result = schedule(initCard(), 2, NOW);
    expect(result.state).toBe(2);
    expect(result.scheduledDays).toBe(1);
    const oneDayMs = 24 * 60 * 60 * 1000;
    expect(result.due.getTime()).toBeCloseTo(NOW.getTime() + oneDayMs, -3);
  });

  it('rating=4 (Easy) transitions to Review with full stability interval', () => {
    const result = schedule(initCard(), 4, NOW);
    expect(result.state).toBe(2);
    expect(result.scheduledDays).toBeGreaterThan(1);
    expect(result.due.getTime()).toBeGreaterThan(NOW.getTime());
  });

  it('is immutable — original card unchanged after call', () => {
    const original = initCard();
    const frozen = { ...original };
    schedule(original, 3 as FsrsRating, NOW);
    expect(original.state).toBe(frozen.state);
    expect(original.reps).toBe(frozen.reps);
    expect(original.stability).toBe(frozen.stability);
  });
});

describe('schedule — Review card', () => {
  it('rating=1 (Again) transitions to Relearning and increments lapses', () => {
    const card = makeReviewCard();
    const result = schedule(card, 1, NOW);
    expect(result.state).toBe(3);
    expect(result.lapses).toBe(1);
    expect(result.stability).toBeLessThan(card.stability);
  });

  it('rating=4 (Easy) increases stability and sets due further in future', () => {
    const card = makeReviewCard();
    const result = schedule(card, 4, NOW);
    expect(result.stability).toBeGreaterThan(card.stability);
    expect(result.due.getTime()).toBeGreaterThan(NOW.getTime());
  });
});

describe('schedule — Learning card (state=1)', () => {
  function makeLearningCard(lastReviewedAt: Date | null = NOW): FsrsCard {
    return { ...initCard(), state: 1, stability: 2.5594, reps: 1, lastReviewedAt };
  }

  it('handles null lastReviewedAt (elapsed = 0)', () => {
    const card = makeLearningCard(null);
    const result = schedule(card, 2, NOW);
    expect(result.elapsedDays).toBe(0);
  });

  it('rating=1 (Again) stays in Learning, due in 1 minute', () => {
    const result = schedule(makeLearningCard(), 1, NOW);
    expect(result.state).toBe(1);
    expect(result.due.getTime()).toBeGreaterThan(NOW.getTime());
    expect(result.due.getTime() - NOW.getTime()).toBeLessThan(2 * 60 * 1000);
  });

  it('rating=2 (Hard) stays in Learning, due in 5 minutes', () => {
    const result = schedule(makeLearningCard(), 2, NOW);
    expect(result.state).toBe(1);
    const elapsed = result.due.getTime() - NOW.getTime();
    expect(elapsed).toBeGreaterThanOrEqual(5 * 60 * 1000 - 100);
  });

  it('rating=3 (Good) graduates to Review', () => {
    const result = schedule(makeLearningCard(), 3, NOW);
    expect(result.state).toBe(2);
  });

  it('rating=4 (Easy) graduates to Review with full interval', () => {
    const result = schedule(makeLearningCard(), 4, NOW);
    expect(result.state).toBe(2);
    expect(result.scheduledDays).toBeGreaterThan(1);
  });

  it('Relearning card (state=3) follows same graduation rules', () => {
    const card = { ...makeLearningCard(), state: 3, lapses: 1 };
    const result = schedule(card, 3, NOW);
    expect(result.state).toBe(2);
  });
});

describe('schedule — unknown state safety net', () => {
  it('treats unknown state as New and never throws', () => {
    const weirdCard = { ...initCard(), state: 99 };
    expect(() => schedule(weirdCard as FsrsCard, 3, NOW)).not.toThrow();
    const result = schedule(weirdCard as FsrsCard, 3, NOW);
    expect(result.state).toBe(2); // treated as New + Good → Review
  });
});

describe('getDueStatus', () => {
  it('returns "new" for state=0', () => {
    expect(getDueStatus(initCard(), NOW)).toBe('new');
  });

  it('returns "due" when due <= now', () => {
    const card = makeReviewCard({ state: 2, due: new Date(NOW.getTime() - 1000) });
    expect(getDueStatus(card, NOW)).toBe('due');
  });

  it('returns "slipping" when due is within 3 days', () => {
    const dueIn2Days = new Date(NOW.getTime() + 2 * 24 * 60 * 60 * 1000);
    const card = makeReviewCard({ state: 2, due: dueIn2Days });
    expect(getDueStatus(card, NOW)).toBe('slipping');
  });

  it('returns "safe" when due is more than 3 days out', () => {
    const dueIn7Days = new Date(NOW.getTime() + 7 * 24 * 60 * 60 * 1000);
    const card = makeReviewCard({ state: 2, due: dueIn7Days });
    expect(getDueStatus(card, NOW)).toBe('safe');
  });
});

describe('getConfidence', () => {
  it('returns 0 for new cards (state=0)', () => {
    expect(getConfidence(initCard(), NOW)).toBe(0);
  });

  it('returns 1.0 for a just-reviewed card', () => {
    const card = makeReviewCard({ lastReviewedAt: NOW });
    const confidence = getConfidence(card, NOW);
    expect(confidence).toBeCloseTo(1.0, 5);
  });
});
