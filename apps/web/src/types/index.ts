// Frontend-only types — never import Prisma types here

export type PriorKnowledgeSignal = 'none' | 'beginner' | 'intermediate' | 'advanced';
export type SessionPhase = 'activation' | 'core' | 'consolidation';
export type SessionMode = 'exploration' | 'consolidation' | 'rescue' | 'acceleration' | 'refocus';
export type ResumeType = 'continue' | 'smart' | 'new';
export type MessageRole = 'user' | 'assistant';

export interface SessionMessage {
  id: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  turnIndex: number;
  compressed: boolean;
  compressionSummary: string | null;
  createdAt: string;
}

export interface StartSessionResult {
  sessionId: string;
  openingMessage: string;
  phase: SessionPhase;
  resumeType: ResumeType;
  conceptsDue: string[];
}

export interface SendMessageResult {
  message: string;
  phase: SessionPhase;
  mode: SessionMode;
  exchangesCount: number;
}

export interface ActiveSession {
  id: string;
  learnerId: string;
  topic: string;
  priorKnowledgeSignal: string;
  timeAvailableMinutes: number;
  currentPhase: SessionPhase;
  currentMode: SessionMode;
  exchangesCount: number;
  startedAt: string;
  endedAt: string | null;
  lastActivityAt: string;
}

export interface DisplayMessage {
  role: MessageRole;
  content: string;
  turnIndex: number;
}

export interface SessionSummary {
  title: string;
  whatWeCovered: string[];
  whatYouHave: string[];
  nextFocus: string[];
  estimatedRetention: number;
}

export interface EndSessionResult {
  summary: SessionSummary;
  consolidationQuestion: string | null;
}

export interface TopicProgress {
  topic: string;
  lastStudiedAt: string;
  conceptCount: number;
  safeCount: number;
  slippingCount: number;
  dueCount: number;
  newCount: number;
  forgettingCurveHealth: number;
}

export interface ConceptDueItem {
  canonicalId: string;
  displayName: string;
  topic: string;
  due: string;
  confidence: number;
  fsrsState: number;
  dueStatus: 'due' | 'slipping' | 'new';
}

export interface ProgressDashboard {
  topics: TopicProgress[];
  dueToday: ConceptDueItem[];
  totalConceptsLearned: number;
  totalSessions: number;
  lastSessionAt: string | null;
  calibrationScore: number;
}
