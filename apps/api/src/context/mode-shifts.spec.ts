import { evaluateModeShift } from './mode-shifts';
import { initSessionInsights, updateInsightsWithSignals } from './session-insights';

function makeInsights(overrides: Partial<ReturnType<typeof initSessionInsights>> = {}) {
  return { ...initSessionInsights('intermediate'), ...overrides };
}

describe('evaluateModeShift', () => {
  describe('rescue', () => {
    it('triggers when consecutiveStruggles >= 3', () => {
      const insights = makeInsights({ consecutiveStruggles: 3 });
      expect(evaluateModeShift(insights, 5)).toBe('rescue');
    });

    it('triggers when a severity-3 struggle pushes consecutiveStruggles to 3', () => {
      const base = initSessionInsights('beginner');
      // severity 3 adds 3 to counter → triggers immediately
      const updated = updateInsightsWithSignals(
        base,
        [{ type: 'struggle', concept: 'loops', severity: 3 }],
        1,
      );
      expect(evaluateModeShift(updated, 1)).toBe('rescue');
    });

    it('does not trigger with only 2 consecutive struggles', () => {
      const insights = makeInsights({ consecutiveStruggles: 2, currentMode: 'exploration' });
      const mode = evaluateModeShift(insights, 3);
      expect(mode).not.toBe('rescue');
    });
  });

  describe('acceleration', () => {
    it('triggers when consecutiveMomentum >= 4 and demonstratedLevel > selfLevel + 1', () => {
      // selfReportedLevel 'intermediate' → parsed as 2; demonstratedLevel 4 > 2+1=3 ✓
      const insights = makeInsights({
        consecutiveMomentum: 4,
        selfReportedLevel: 'intermediate',
        demonstratedLevel: 4,
        consecutiveStruggles: 0,
      });
      expect(evaluateModeShift(insights, 5)).toBe('acceleration');
    });

    it('does not trigger when demonstrated level is not far enough ahead', () => {
      const insights = makeInsights({
        consecutiveMomentum: 4,
        selfReportedLevel: 'intermediate',
        demonstratedLevel: 3,
        consecutiveStruggles: 0,
      });
      // demonstratedLevel 3 is NOT > 2+1=3
      expect(evaluateModeShift(insights, 5)).not.toBe('acceleration');
    });

    it('does not trigger with only 3 consecutive momentum', () => {
      const insights = makeInsights({
        consecutiveMomentum: 3,
        demonstratedLevel: 5,
        consecutiveStruggles: 0,
      });
      expect(evaluateModeShift(insights, 5)).not.toBe('acceleration');
    });
  });

  describe('consolidation', () => {
    it('triggers when consecutiveMomentum >= 2 and mode is exploration', () => {
      const insights = makeInsights({
        consecutiveMomentum: 2,
        currentMode: 'exploration',
        consecutiveStruggles: 0,
      });
      expect(evaluateModeShift(insights, 3)).toBe('consolidation');
    });

    it('does not trigger when already in rescue (rescue has priority)', () => {
      const insights = makeInsights({
        consecutiveMomentum: 2,
        currentMode: 'exploration',
        consecutiveStruggles: 3,
      });
      expect(evaluateModeShift(insights, 3)).toBe('rescue');
    });

    it('does not trigger when mode is not exploration', () => {
      const insights = makeInsights({
        consecutiveMomentum: 3,
        currentMode: 'rescue',
        consecutiveStruggles: 0,
      });
      expect(evaluateModeShift(insights, 3)).not.toBe('consolidation');
    });
  });

  describe('refocus', () => {
    it('triggers when offTopicCount >= 2', () => {
      const insights = makeInsights({ offTopicCount: 2, consecutiveStruggles: 0 });
      expect(evaluateModeShift(insights, 5)).toBe('refocus');
    });

    it('triggers when learner has been disengaged for 5+ turns', () => {
      const insights = makeInsights({
        lastEngagementSignalAt: 1,
        consecutiveStruggles: 0,
        offTopicCount: 0,
      });
      // currentTurn=10, lastEngagementSignalAt=1 → 1 < 10-5=5 → refocus
      expect(evaluateModeShift(insights, 10)).toBe('refocus');
    });
  });

  describe('priority ordering', () => {
    it('rescue has priority over consolidation', () => {
      const insights = makeInsights({
        consecutiveStruggles: 3,
        consecutiveMomentum: 2,
        currentMode: 'exploration',
      });
      expect(evaluateModeShift(insights, 5)).toBe('rescue');
    });

    it('rescue has priority over refocus', () => {
      const insights = makeInsights({
        consecutiveStruggles: 3,
        offTopicCount: 3,
      });
      expect(evaluateModeShift(insights, 5)).toBe('rescue');
    });

    it('acceleration has priority over consolidation', () => {
      const insights = makeInsights({
        consecutiveMomentum: 4,
        selfReportedLevel: 'beginner',
        demonstratedLevel: 4,
        currentMode: 'exploration',
        consecutiveStruggles: 0,
      });
      expect(evaluateModeShift(insights, 5)).toBe('acceleration');
    });
  });

  describe('no-op cases', () => {
    it('returns current mode when no trigger fires', () => {
      const insights = makeInsights({ currentMode: 'exploration' });
      expect(evaluateModeShift(insights, 2)).toBe('exploration');
    });

    it('keeps rescue mode if rescue trigger still active', () => {
      const insights = makeInsights({ currentMode: 'rescue', consecutiveStruggles: 4 });
      expect(evaluateModeShift(insights, 5)).toBe('rescue');
    });
  });
});
