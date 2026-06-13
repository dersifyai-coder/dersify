import type { SessionInsights } from './session-insights';

export type SessionMode =
  | 'exploration'
  | 'consolidation'
  | 'rescue'
  | 'acceleration'
  | 'refocus';

export const MODE_TRIGGERS = {
  rescue:        { condition: 'consecutiveStruggles >= 3 OR struggle.severity === 3' },
  acceleration:  { condition: 'consecutiveMomentum >= 4 AND demonstratedLevel > selfReportedLevel + 1' },
  consolidation: { condition: 'consecutiveMomentum >= 2 AND currentMode === exploration' },
  refocus:       { condition: 'offTopicCount >= 2 OR lastEngagementSignalAt < turnIndex - 5' },
  exploration:   { condition: 'reset after rescue clears OR manual reset' },
} as const;

export const MODE_INSTRUCTIONS: Record<SessionMode, string> = {
  exploration:
    'Engage normally. Build understanding through dialogue and appropriate challenge.',
  consolidation:
    'The learner is grasping material well. Deepen understanding and connect concepts.',
  rescue:
    'The learner is struggling. Simplify immediately. Change your teaching angle. Use different examples from what you just tried.',
  acceleration:
    'The learner is ahead of expectations. Skip basics. Introduce harder challenges and edge cases.',
  refocus:
    'The learner has drifted off-topic or seems disengaged. Gently redirect back to the session topic.',
};

function parseSelfReportedLevel(level: string): number {
  const map: Record<string, number> = {
    beginner: 1,
    novice: 1,
    elementary: 1,
    intermediate: 2,
    advanced: 3,
    expert: 4,
    master: 5,
  };
  const fromMap = map[level.toLowerCase().trim()];
  if (fromMap !== undefined) return fromMap;
  const parsed = parseFloat(level);
  return Number.isNaN(parsed) ? 1 : parsed;
}

export function evaluateModeShift(
  insights: SessionInsights,
  currentTurn: number,
): SessionMode {
  // Priority: rescue > acceleration > refocus > consolidation > exploration

  if (insights.consecutiveStruggles >= 3) {
    return 'rescue';
  }

  const selfLevel = parseSelfReportedLevel(insights.selfReportedLevel);
  if (
    insights.consecutiveMomentum >= 4 &&
    insights.demonstratedLevel > selfLevel + 1
  ) {
    return 'acceleration';
  }

  if (
    insights.offTopicCount >= 2 ||
    (currentTurn > 5 && insights.lastEngagementSignalAt < currentTurn - 5)
  ) {
    return 'refocus';
  }

  if (
    insights.consecutiveMomentum >= 2 &&
    insights.currentMode === 'exploration'
  ) {
    return 'consolidation';
  }

  return insights.currentMode;
}
