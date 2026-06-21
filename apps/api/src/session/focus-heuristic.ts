import type { FocusState } from '../context/session-insights';

export type { FocusState };

export interface SessionMetrics {
  messageCount: number;
  responseTimes: number[];
  qualityTrend: number;
}

export function detectFocusState(metrics: SessionMetrics): FocusState {
  if (metrics.messageCount < 3) return 'warming_up';

  const recentTimes = metrics.responseTimes.slice(-3);
  const baselineTimes = metrics.responseTimes.slice(0, 3);

  const avgRecent =
    recentTimes.length > 0 ? recentTimes.reduce((a, b) => a + b, 0) / recentTimes.length : 0;
  const avgBaseline =
    baselineTimes.length > 0 ? baselineTimes.reduce((a, b) => a + b, 0) / baselineTimes.length : 0;

  const divisor = avgBaseline || avgRecent || 1;
  const speedRatio = avgRecent / divisor;

  if (speedRatio > 2.0 && metrics.qualityTrend < -0.5) return 'fatigued';
  if (speedRatio > 1.5 && metrics.qualityTrend < 0) return 'diffuse';
  return 'focus';
}

export function buildFocusInstruction(state: FocusState): string {
  switch (state) {
    case 'fatigued':
      return 'The learner is showing fatigue signs. Shorten explanations. One concept at a time. Consider offering a natural stopping point.';
    case 'diffuse':
      return 'The learner seems distracted. Keep responses shorter and more direct. Use questions to re-engage.';
    case 'warming_up':
      return 'This is the beginning of the session. Ease in gently before increasing complexity.';
    case 'focus':
      return '';
  }
}
