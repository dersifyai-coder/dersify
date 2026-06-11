import {
  DECAY,
  DIFFICULTY_DEFAULT,
  DIFFICULTY_MAX,
  DIFFICULTY_MIN,
  DUE_SLIPPING_DAYS,
  INITIAL_DIFFICULTY,
  INITIAL_STABILITY,
  LAPSE_STABILITY_FACTOR,
  STEP_AGAIN_MINS,
  STEP_GOOD_MINS,
  STEP_HARD_MINS,
} from './fsrs.constants';

export type FsrsRating = 1 | 2 | 3 | 4; // Again=1, Hard=2, Good=3, Easy=4

export interface FsrsCard {
  stability: number;
  difficulty: number;
  elapsedDays: number;
  scheduledDays: number;
  reps: number;
  lapses: number;
  state: number; // 0=New 1=Learning 2=Review 3=Relearning
  due: Date;
  lastReviewedAt: Date | null;
}

export interface FsrsScheduleResult {
  again: FsrsCard;
  hard: FsrsCard;
  good: FsrsCard;
  easy: FsrsCard;
}

export function initCard(): FsrsCard {
  return {
    stability: 0,
    difficulty: DIFFICULTY_DEFAULT,
    elapsedDays: 0,
    scheduledDays: 0,
    reps: 0,
    lapses: 0,
    state: 0,
    due: new Date(),
    lastReviewedAt: null,
  };
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function computeElapsedDays(lastReviewedAt: Date | null, now: Date): number {
  if (!lastReviewedAt) return 0;
  return Math.max(0, (now.getTime() - lastReviewedAt.getTime()) / (24 * 60 * 60 * 1000));
}

function scheduleNew(card: FsrsCard, rating: FsrsRating, now: Date): FsrsCard {
  const stability = INITIAL_STABILITY[rating];
  const base: FsrsCard = {
    ...card,
    stability,
    difficulty: INITIAL_DIFFICULTY[rating],
    reps: card.reps + 1,
    elapsedDays: 0,
    lastReviewedAt: now,
  };

  if (rating === 1) {
    // Again: stay in Learning, retry immediately
    return { ...base, state: 1, scheduledDays: 0, due: now };
  }
  if (rating === 2) {
    // Hard: Review, due tomorrow
    return { ...base, state: 2, scheduledDays: 1, due: addDays(now, 1) };
  }
  // Good (3) or Easy (4): Review with stability-based interval
  const scheduledDays = Math.max(1, Math.round(stability));
  return { ...base, state: 2, scheduledDays, due: addDays(now, scheduledDays) };
}

function scheduleLearning(card: FsrsCard, rating: FsrsRating, now: Date): FsrsCard {
  const elapsed = computeElapsedDays(card.lastReviewedAt, now);
  const base: FsrsCard = {
    ...card,
    reps: card.reps + 1,
    elapsedDays: Math.round(elapsed),
    lastReviewedAt: now,
  };

  if (rating === 1) {
    // Again: stay, immediate retry
    return { ...base, state: card.state, scheduledDays: 0, due: addMinutes(now, STEP_AGAIN_MINS) };
  }
  if (rating === 2) {
    // Hard: stay, short step
    return { ...base, state: card.state, scheduledDays: 0, due: addMinutes(now, STEP_HARD_MINS) };
  }
  if (rating === 3) {
    // Good: graduate to Review, due in 10 min
    const stability = INITIAL_STABILITY[3];
    return {
      ...base,
      state: 2,
      stability,
      difficulty: DIFFICULTY_DEFAULT,
      scheduledDays: 0,
      due: addMinutes(now, STEP_GOOD_MINS),
    };
  }
  // Easy (4): graduate immediately with full interval
  const stability = INITIAL_STABILITY[4];
  const scheduledDays = Math.max(1, Math.round(stability));
  return {
    ...base,
    state: 2,
    stability,
    difficulty: DIFFICULTY_DEFAULT,
    scheduledDays,
    due: addDays(now, scheduledDays),
  };
}

function scheduleReview(card: FsrsCard, rating: FsrsRating, now: Date): FsrsCard {
  const elapsed = computeElapsedDays(card.lastReviewedAt, now);
  const newDifficulty = clamp(
    card.difficulty - 0.1 * (rating - 3),
    DIFFICULTY_MIN,
    DIFFICULTY_MAX,
  );

  const base: FsrsCard = {
    ...card,
    difficulty: newDifficulty,
    reps: card.reps + 1,
    elapsedDays: Math.round(elapsed),
    lastReviewedAt: now,
  };

  if (rating === 1) {
    // Lapse: move to Relearning, reduce stability
    const newStability = Math.max(0.1, card.stability * LAPSE_STABILITY_FACTOR);
    return {
      ...base,
      stability: newStability,
      state: 3,
      lapses: card.lapses + 1,
      scheduledDays: 0,
      due: addMinutes(now, STEP_AGAIN_MINS),
    };
  }

  // Hard/Good/Easy: stability growth
  const newStability = card.stability *
    Math.exp(0.9 * (11 - newDifficulty) * Math.log(card.stability)) *
    (Math.exp(0.1 * (rating - 2)) - 0.5 + 1);

  const safeStability = Math.max(card.stability, newStability);
  const scheduledDays = Math.max(1, Math.round(safeStability));

  return {
    ...base,
    stability: safeStability,
    state: 2,
    scheduledDays,
    due: addDays(now, scheduledDays),
  };
}

export function schedule(card: FsrsCard, rating: FsrsRating, now: Date): FsrsCard {
  if (card.state === 0) return scheduleNew(card, rating, now);
  if (card.state === 1 || card.state === 3) return scheduleLearning(card, rating, now);
  if (card.state === 2) return scheduleReview(card, rating, now);
  // Unknown state — treat as new to never throw
  return scheduleNew({ ...card, state: 0 }, rating, now);
}

export function getDueStatus(card: FsrsCard, now: Date): 'new' | 'due' | 'slipping' | 'safe' {
  if (card.state === 0) return 'new';
  if (card.due <= now) return 'due';
  const daysUntilDue = (card.due.getTime() - now.getTime()) / (24 * 60 * 60 * 1000);
  if (daysUntilDue <= DUE_SLIPPING_DAYS) return 'slipping';
  return 'safe';
}

export function getConfidence(card: FsrsCard, now: Date): number {
  if (card.state === 0 || card.stability <= 0 || !card.lastReviewedAt) return 0;
  const actualElapsed =
    (now.getTime() - card.lastReviewedAt.getTime()) / (24 * 60 * 60 * 1000);
  return Math.exp(DECAY * actualElapsed / card.stability);
}
