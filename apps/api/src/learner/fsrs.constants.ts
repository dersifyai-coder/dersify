export const DECAY = -0.5;
export const FACTOR = 0.9 ** (1 / DECAY) - 1; // ≈ 0.2346

// INITIAL_STABILITY[rating] — index 0 unused, ratings are 1-4
export const INITIAL_STABILITY: readonly number[] = [0, 2.5594, 1.0651, 4.1543, 10.9178];

// INITIAL_DIFFICULTY[rating] — uniform 0.3 per spec
export const INITIAL_DIFFICULTY: readonly number[] = [0, 0.3, 0.3, 0.3, 0.3];

export const DIFFICULTY_MIN = 0.1;
export const DIFFICULTY_MAX = 1.0;
export const DIFFICULTY_DEFAULT = 0.3;

export const LAPSE_STABILITY_FACTOR = 0.2;

// Due intervals for Learning / Relearning steps (in minutes)
export const STEP_AGAIN_MINS = 1;
export const STEP_HARD_MINS = 5;
export const STEP_GOOD_MINS = 10;

export const DUE_SLIPPING_DAYS = 3;
