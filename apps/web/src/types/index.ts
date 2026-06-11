export interface LearnerGoal {
  id: string;
  learnerId: string;
  subject: string;
  targetDate: string | null;
  priority: number;
  createdAt: string;
  updatedAt: string;
}
