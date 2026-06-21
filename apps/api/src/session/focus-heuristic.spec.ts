import { detectFocusState } from './focus-heuristic';

describe('detectFocusState', () => {
  it('returns warming_up when messageCount < 3', () => {
    expect(detectFocusState({ messageCount: 0, responseTimes: [], qualityTrend: 0 })).toBe('warming_up');
    expect(detectFocusState({ messageCount: 1, responseTimes: [1000], qualityTrend: 0 })).toBe('warming_up');
    expect(detectFocusState({ messageCount: 2, responseTimes: [1000, 1200], qualityTrend: -1 })).toBe('warming_up');
  });

  it('returns fatigued when speedRatio > 2.0 AND qualityTrend < -0.5', () => {
    // baseline avg = 1000ms, recent avg = 3000ms → ratio = 3.0
    const result = detectFocusState({
      messageCount: 10,
      responseTimes: [1000, 1000, 1000, 2000, 3000, 3000],
      qualityTrend: -0.8,
    });
    expect(result).toBe('fatigued');
  });

  it('returns diffuse when speedRatio > 1.5 AND qualityTrend < 0 (but not fatigued threshold)', () => {
    // baseline avg = 1000ms, recent avg = 2000ms → ratio = 2.0 (not > 2.0)
    const result = detectFocusState({
      messageCount: 6,
      responseTimes: [1000, 1000, 1000, 1500, 2000, 2500],
      qualityTrend: -0.3,
    });
    expect(result).toBe('diffuse');
  });

  it('returns focus for normal engagement', () => {
    const result = detectFocusState({
      messageCount: 8,
      responseTimes: [1000, 900, 1100, 1000, 950, 1050],
      qualityTrend: 0.2,
    });
    expect(result).toBe('focus');
  });

  it('returns focus when speed is slow but quality is improving', () => {
    // speedRatio > 2.0 but qualityTrend >= -0.5 → not fatigued
    const result = detectFocusState({
      messageCount: 6,
      responseTimes: [1000, 1000, 1000, 3000, 3500, 4000],
      qualityTrend: 0.1,
    });
    expect(result).toBe('focus');
  });

  it('handles empty responseTimes array without throwing', () => {
    expect(() =>
      detectFocusState({ messageCount: 5, responseTimes: [], qualityTrend: -1 }),
    ).not.toThrow();
  });

  it('returns focus when responseTimes is empty and messageCount >= 3', () => {
    const result = detectFocusState({ messageCount: 5, responseTimes: [], qualityTrend: -1 });
    expect(result).toBe('focus');
  });

  it('uses baseline vs recent window comparison correctly', () => {
    // First 3 are baseline (avg 500ms), last 3 are recent (avg 1600ms) → ratio ≈ 3.2
    // qualityTrend -0.8 → fatigued
    const result = detectFocusState({
      messageCount: 6,
      responseTimes: [500, 500, 500, 1600, 1600, 1600],
      qualityTrend: -0.8,
    });
    expect(result).toBe('fatigued');
  });
});
