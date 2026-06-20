import type { SessionMode } from './mode-shifts';

export type FocusState = 'focus' | 'diffuse' | 'fatigued' | 'warming_up';

export type SessionSignal =
  | { type: 'struggle'; concept: string; severity: 1 | 2 | 3 }
  | { type: 'misconception'; concept: string; description: string }
  | { type: 'momentum'; concept: string }
  | { type: 'confusion'; about: string }
  | { type: 'breakthrough'; concept: string }
  | { type: 'disengagement' }
  | { type: 'off_topic' };

export interface SignalDetectionResult {
  signals: SessionSignal[];
  urgency: 'none' | 'low' | 'high';
  requiresAiEscalation: boolean;
}

export interface SessionInsights {
  struggleSignals: number;
  momentumSignals: number;
  consecutiveStruggles: number;
  consecutiveMomentum: number;

  conceptsEngaged: string[];
  conceptsConfirmed: string[];
  conceptsStruggledWith: string[];

  newMisconceptionsDetected: {
    conceptId: string;
    description: string;
    type: string;
    detectedAt: number;
  }[];

  currentMode: SessionMode;
  modeHistory: { mode: SessionMode; triggeredAt: number; reason: string }[];

  currentPhase: 'activation' | 'core' | 'consolidation';

  lastEngagementSignalAt: number;
  offTopicCount: number;
  responseTimes: number[];

  selfReportedLevel: string;
  demonstratedLevel: number;
  calibrationDelta: number;

  focusState: FocusState;
}

export function initSessionInsights(selfReportedLevel: string): SessionInsights {
  return {
    struggleSignals: 0,
    momentumSignals: 0,
    consecutiveStruggles: 0,
    consecutiveMomentum: 0,

    conceptsEngaged: [],
    conceptsConfirmed: [],
    conceptsStruggledWith: [],

    newMisconceptionsDetected: [],

    currentMode: 'exploration',
    modeHistory: [],

    currentPhase: 'activation',

    lastEngagementSignalAt: 0,
    offTopicCount: 0,
    responseTimes: [],

    selfReportedLevel,
    demonstratedLevel: 0,
    calibrationDelta: 0,

    focusState: 'warming_up',
  };
}

export function updateInsightsWithSignals(
  insights: SessionInsights,
  signals: SessionSignal[],
  turnIndex: number,
): SessionInsights {
  if (signals.length === 0) return insights;

  let {
    struggleSignals,
    momentumSignals,
    consecutiveStruggles,
    consecutiveMomentum,
    conceptsEngaged,
    conceptsStruggledWith,
    newMisconceptionsDetected,
    lastEngagementSignalAt,
    offTopicCount,
  } = insights;

  for (const signal of signals) {
    switch (signal.type) {
      case 'struggle': {
        struggleSignals += 1;
        consecutiveStruggles += signal.severity;
        consecutiveMomentum = 0;
        if (!conceptsEngaged.includes(signal.concept)) {
          conceptsEngaged = [...conceptsEngaged, signal.concept];
        }
        if (!conceptsStruggledWith.includes(signal.concept)) {
          conceptsStruggledWith = [...conceptsStruggledWith, signal.concept];
        }
        lastEngagementSignalAt = turnIndex;
        break;
      }
      case 'confusion': {
        consecutiveStruggles += 1;
        consecutiveMomentum = 0;
        lastEngagementSignalAt = turnIndex;
        break;
      }
      case 'momentum': {
        momentumSignals += 1;
        consecutiveMomentum += 1;
        consecutiveStruggles = 0;
        if (!conceptsEngaged.includes(signal.concept)) {
          conceptsEngaged = [...conceptsEngaged, signal.concept];
        }
        lastEngagementSignalAt = turnIndex;
        break;
      }
      case 'breakthrough': {
        momentumSignals += 1;
        consecutiveMomentum += 1;
        consecutiveStruggles = 0;
        if (!conceptsEngaged.includes(signal.concept)) {
          conceptsEngaged = [...conceptsEngaged, signal.concept];
        }
        lastEngagementSignalAt = turnIndex;
        break;
      }
      case 'misconception': {
        consecutiveStruggles += 1;
        consecutiveMomentum = 0;
        if (!conceptsEngaged.includes(signal.concept)) {
          conceptsEngaged = [...conceptsEngaged, signal.concept];
        }
        newMisconceptionsDetected = [
          ...newMisconceptionsDetected,
          {
            conceptId: signal.concept,
            description: signal.description,
            type: 'detected',
            detectedAt: turnIndex,
          },
        ];
        lastEngagementSignalAt = turnIndex;
        break;
      }
      case 'disengagement': {
        consecutiveStruggles += 1;
        consecutiveMomentum = 0;
        lastEngagementSignalAt = turnIndex;
        break;
      }
      case 'off_topic': {
        offTopicCount += 1;
        break;
      }
    }
  }

  return {
    ...insights,
    struggleSignals,
    momentumSignals,
    consecutiveStruggles,
    consecutiveMomentum,
    conceptsEngaged,
    conceptsStruggledWith,
    newMisconceptionsDetected,
    lastEngagementSignalAt,
    offTopicCount,
  };
}
