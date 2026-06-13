import {
  initSessionInsights,
  updateInsightsWithSignals,
  SessionSignal,
} from './session-insights';

describe('initSessionInsights', () => {
  it('returns fresh zero-state with the supplied selfReportedLevel', () => {
    const insights = initSessionInsights('intermediate');
    expect(insights.selfReportedLevel).toBe('intermediate');
    expect(insights.struggleSignals).toBe(0);
    expect(insights.momentumSignals).toBe(0);
    expect(insights.consecutiveStruggles).toBe(0);
    expect(insights.consecutiveMomentum).toBe(0);
    expect(insights.conceptsEngaged).toEqual([]);
    expect(insights.newMisconceptionsDetected).toEqual([]);
    expect(insights.currentMode).toBe('exploration');
    expect(insights.currentPhase).toBe('activation');
    expect(insights.offTopicCount).toBe(0);
    expect(insights.lastEngagementSignalAt).toBe(0);
    expect(insights.demonstratedLevel).toBe(0);
  });
});

describe('updateInsightsWithSignals', () => {
  it('returns the same insights object when signals array is empty', () => {
    const insights = initSessionInsights('beginner');
    const updated = updateInsightsWithSignals(insights, [], 3);
    expect(updated).toBe(insights);
  });

  it('is immutable — never mutates the original insights object', () => {
    const original = initSessionInsights('beginner');
    const signals: SessionSignal[] = [{ type: 'confusion', about: 'recursion' }];
    updateInsightsWithSignals(original, signals, 1);
    expect(original.consecutiveStruggles).toBe(0);
  });

  describe('struggle signal', () => {
    it('increments struggleSignals and adds severity to consecutiveStruggles', () => {
      const insights = initSessionInsights('beginner');
      const updated = updateInsightsWithSignals(
        insights,
        [{ type: 'struggle', concept: 'loops', severity: 2 }],
        1,
      );
      expect(updated.struggleSignals).toBe(1);
      expect(updated.consecutiveStruggles).toBe(2);
      expect(updated.consecutiveMomentum).toBe(0);
    });

    it('severity-3 struggle sets consecutiveStruggles to 3 immediately', () => {
      const insights = initSessionInsights('beginner');
      const updated = updateInsightsWithSignals(
        insights,
        [{ type: 'struggle', concept: 'loops', severity: 3 }],
        1,
      );
      expect(updated.consecutiveStruggles).toBe(3);
    });

    it('appends concept to conceptsEngaged and conceptsStruggledWith', () => {
      const insights = initSessionInsights('beginner');
      const updated = updateInsightsWithSignals(
        insights,
        [{ type: 'struggle', concept: 'closures', severity: 1 }],
        1,
      );
      expect(updated.conceptsEngaged).toContain('closures');
      expect(updated.conceptsStruggledWith).toContain('closures');
    });

    it('updates lastEngagementSignalAt', () => {
      const insights = initSessionInsights('beginner');
      const updated = updateInsightsWithSignals(
        insights,
        [{ type: 'struggle', concept: 'loops', severity: 1 }],
        7,
      );
      expect(updated.lastEngagementSignalAt).toBe(7);
    });
  });

  describe('confusion signal', () => {
    it('increments consecutiveStruggles and resets consecutiveMomentum', () => {
      const insights = { ...initSessionInsights('beginner'), consecutiveMomentum: 2 };
      const updated = updateInsightsWithSignals(
        insights,
        [{ type: 'confusion', about: 'scope' }],
        3,
      );
      expect(updated.consecutiveStruggles).toBe(1);
      expect(updated.consecutiveMomentum).toBe(0);
    });

    it('updates lastEngagementSignalAt', () => {
      const insights = initSessionInsights('beginner');
      const updated = updateInsightsWithSignals(
        insights,
        [{ type: 'confusion', about: 'scope' }],
        4,
      );
      expect(updated.lastEngagementSignalAt).toBe(4);
    });

    it('does NOT increment struggleSignals (only consecutiveStruggles)', () => {
      const insights = initSessionInsights('beginner');
      const updated = updateInsightsWithSignals(
        insights,
        [{ type: 'confusion', about: 'scope' }],
        1,
      );
      expect(updated.struggleSignals).toBe(0);
    });
  });

  describe('momentum signal', () => {
    it('increments momentumSignals and consecutiveMomentum, resets consecutiveStruggles', () => {
      const insights = { ...initSessionInsights('beginner'), consecutiveStruggles: 3 };
      const updated = updateInsightsWithSignals(
        insights,
        [{ type: 'momentum', concept: 'closures' }],
        5,
      );
      expect(updated.momentumSignals).toBe(1);
      expect(updated.consecutiveMomentum).toBe(1);
      expect(updated.consecutiveStruggles).toBe(0);
    });

    it('appends concept to conceptsEngaged (deduplicates)', () => {
      const insights = {
        ...initSessionInsights('beginner'),
        conceptsEngaged: ['closures'],
      };
      const updated = updateInsightsWithSignals(
        insights,
        [{ type: 'momentum', concept: 'closures' }],
        5,
      );
      expect(updated.conceptsEngaged.filter((c) => c === 'closures')).toHaveLength(1);
    });

    it('updates lastEngagementSignalAt', () => {
      const insights = initSessionInsights('beginner');
      const updated = updateInsightsWithSignals(
        insights,
        [{ type: 'momentum', concept: 'closures' }],
        6,
      );
      expect(updated.lastEngagementSignalAt).toBe(6);
    });
  });

  describe('breakthrough signal', () => {
    it('increments momentumSignals and consecutiveMomentum like momentum', () => {
      const insights = { ...initSessionInsights('beginner'), consecutiveStruggles: 2 };
      const updated = updateInsightsWithSignals(
        insights,
        [{ type: 'breakthrough', concept: 'prototypes' }],
        8,
      );
      expect(updated.momentumSignals).toBe(1);
      expect(updated.consecutiveMomentum).toBe(1);
      expect(updated.consecutiveStruggles).toBe(0);
      expect(updated.conceptsEngaged).toContain('prototypes');
    });
  });

  describe('misconception signal', () => {
    it('appends to newMisconceptionsDetected with correct shape', () => {
      const insights = initSessionInsights('beginner');
      const updated = updateInsightsWithSignals(
        insights,
        [{ type: 'misconception', concept: 'this-keyword', description: 'Thinks `this` is lexical' }],
        4,
      );
      expect(updated.newMisconceptionsDetected).toHaveLength(1);
      expect(updated.newMisconceptionsDetected[0]).toMatchObject({
        conceptId: 'this-keyword',
        description: 'Thinks `this` is lexical',
        detectedAt: 4,
      });
    });

    it('increments consecutiveStruggles and resets consecutiveMomentum', () => {
      const insights = { ...initSessionInsights('beginner'), consecutiveMomentum: 3 };
      const updated = updateInsightsWithSignals(
        insights,
        [{ type: 'misconception', concept: 'this-keyword', description: 'Wrong' }],
        2,
      );
      expect(updated.consecutiveStruggles).toBe(1);
      expect(updated.consecutiveMomentum).toBe(0);
    });
  });

  describe('disengagement signal', () => {
    it('increments consecutiveStruggles and updates lastEngagementSignalAt', () => {
      const insights = initSessionInsights('beginner');
      const updated = updateInsightsWithSignals(
        insights,
        [{ type: 'disengagement' }],
        9,
      );
      expect(updated.consecutiveStruggles).toBe(1);
      expect(updated.consecutiveMomentum).toBe(0);
      expect(updated.lastEngagementSignalAt).toBe(9);
    });
  });

  describe('off_topic signal', () => {
    it('increments offTopicCount only — does NOT update lastEngagementSignalAt', () => {
      const insights = { ...initSessionInsights('beginner'), lastEngagementSignalAt: 2 };
      const updated = updateInsightsWithSignals(
        insights,
        [{ type: 'off_topic' }],
        10,
      );
      expect(updated.offTopicCount).toBe(1);
      expect(updated.lastEngagementSignalAt).toBe(2); // unchanged
    });
  });

  describe('streak counter resets', () => {
    it('consecutiveStruggles resets to 0 when momentum fires', () => {
      const insights = { ...initSessionInsights('beginner'), consecutiveStruggles: 4 };
      const updated = updateInsightsWithSignals(
        insights,
        [{ type: 'momentum', concept: 'closures' }],
        5,
      );
      expect(updated.consecutiveStruggles).toBe(0);
    });

    it('consecutiveMomentum resets to 0 when struggle fires', () => {
      const insights = { ...initSessionInsights('beginner'), consecutiveMomentum: 5 };
      const updated = updateInsightsWithSignals(
        insights,
        [{ type: 'struggle', concept: 'closures', severity: 1 }],
        5,
      );
      expect(updated.consecutiveMomentum).toBe(0);
    });
  });

  describe('multiple signals in one update', () => {
    it('processes all signals and accumulates counters', () => {
      const insights = initSessionInsights('beginner');
      const signals: SessionSignal[] = [
        { type: 'struggle', concept: 'closures', severity: 1 },
        { type: 'off_topic' },
      ];
      const updated = updateInsightsWithSignals(insights, signals, 3);
      expect(updated.struggleSignals).toBe(1);
      expect(updated.offTopicCount).toBe(1);
    });
  });
});
