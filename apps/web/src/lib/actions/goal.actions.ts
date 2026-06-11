'use server';

import { apiFetch } from '@/lib/api';
import { LearnerGoal } from '@/types';

export interface CreateGoalActionResult {
  success: boolean;
  message?: string;
  data?: LearnerGoal;
}

export async function createGoalAction(
  formData: FormData,
): Promise<CreateGoalActionResult> {
  const subject = formData.get('subject');
  const targetDate = formData.get('targetDate');
  const priority = formData.get('priority');

  if (typeof subject !== 'string' || !subject.trim()) {
    return { success: false, message: 'Subject is required.' };
  }

  const body: Record<string, unknown> = {
    subject: subject.trim(),
  };

  if (typeof targetDate === 'string' && targetDate.trim()) {
    body.targetDate = targetDate.trim();
  }

  if (typeof priority === 'string' && priority.trim()) {
    const priorityNum = parseInt(priority, 10);

    if (!isNaN(priorityNum)) {
      body.priority = priorityNum;
    }
  }

  try {
    const goal = await apiFetch<LearnerGoal>('/learner/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    return { success: true, data: goal };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create goal.',
    };
  }
}
