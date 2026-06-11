'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createGoalAction } from '@/lib/actions/goal.actions';

interface GoalEntry {
  subject: string;
  targetDate: string;
}

const MAX_GOALS = 3;

export default function OnboardingPage() {
  const router = useRouter();
  const [goals, setGoals] = useState<GoalEntry[]>([{ subject: '', targetDate: '' }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addGoal() {
    if (goals.length < MAX_GOALS) {
      setGoals((prev) => [...prev, { subject: '', targetDate: '' }]);
    }
  }

  function updateGoal(index: number, field: keyof GoalEntry, value: string) {
    setGoals((prev) =>
      prev.map((g, i) => (i === index ? { ...g, [field]: value } : g)),
    );
  }

  function removeGoal(index: number) {
    setGoals((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const validGoals = goals.filter((g) => g.subject.trim());

    if (validGoals.length === 0) {
      setError('Add at least one learning goal to continue.');
      return;
    }

    setSubmitting(true);

    try {
      for (let i = 0; i < validGoals.length; i++) {
        const goal = validGoals[i];
        const formData = new FormData();
        formData.set('subject', goal.subject.trim());
        formData.set('priority', String(i + 1));

        if (goal.targetDate) {
          formData.set('targetDate', goal.targetDate);
        }

        const result = await createGoalAction(formData);

        if (!result.success) {
          setError(result.message ?? 'Failed to save a goal. Please try again.');
          setSubmitting(false);
          return;
        }
      }

      router.push('/dashboard');
    } catch {
      setError('Something went wrong. Please try again.');
      setSubmitting(false);
    }
  }

  function handleSkip() {
    router.push('/dashboard');
  }

  return (
    <main className="min-h-screen bg-white px-6 py-12 text-navy">
      <div className="mx-auto max-w-xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold tracking-widest text-teal uppercase">
            Step 1 of 1
          </p>
          <h1 className="mt-3 font-sora text-3xl font-bold text-navy">
            What do you want to learn?
          </h1>
          <p className="mt-3 text-sm text-navy/60">
            Set up to 3 learning goals. You can always change these later.
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* Goal form */}
        <form id="onboarding-form" onSubmit={(e) => void handleSubmit(e)}>
          <div className="space-y-5">
            {goals.map((goal, index) => (
              <div
                key={index}
                className="relative rounded-xl border border-navy/10 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-widest text-navy/40">
                    Goal {index + 1}
                  </span>
                  {goals.length > 1 && (
                    <button
                      type="button"
                      id={`remove-goal-${index}`}
                      onClick={() => removeGoal(index)}
                      className="text-xs text-navy/40 transition-colors hover:text-red-500"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label
                      htmlFor={`subject-${index}`}
                      className="mb-1 block text-xs font-medium text-navy/70"
                    >
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      id={`subject-${index}`}
                      type="text"
                      required
                      placeholder="e.g. Calculus, Python, Spanish…"
                      value={goal.subject}
                      onChange={(e) => updateGoal(index, 'subject', e.target.value)}
                      className="w-full rounded-lg border border-navy/15 bg-white px-4 py-2.5 text-sm text-navy placeholder-navy/30 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`targetDate-${index}`}
                      className="mb-1 block text-xs font-medium text-navy/70"
                    >
                      Target date{' '}
                      <span className="text-navy/40">(optional)</span>
                    </label>
                    <input
                      id={`targetDate-${index}`}
                      type="date"
                      value={goal.targetDate}
                      onChange={(e) =>
                        updateGoal(index, 'targetDate', e.target.value)
                      }
                      className="w-full rounded-lg border border-navy/15 bg-white px-4 py-2.5 text-sm text-navy outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add goal button */}
          {goals.length < MAX_GOALS && (
            <button
              type="button"
              id="add-goal-btn"
              onClick={addGoal}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-navy/20 py-3 text-sm font-medium text-navy/50 transition-all hover:border-primary/40 hover:text-primary"
            >
              <span className="text-lg leading-none">+</span>
              Add another goal ({goals.length}/{MAX_GOALS})
            </button>
          )}

          {/* Actions */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              id="skip-onboarding-btn"
              onClick={handleSkip}
              className="order-2 text-sm text-navy/40 transition-colors hover:text-navy sm:order-1"
            >
              Skip for now
            </button>

            <button
              type="submit"
              id="save-goals-btn"
              form="onboarding-form"
              disabled={submitting}
              className="order-1 w-full rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-primary/40 disabled:cursor-not-allowed disabled:opacity-60 sm:order-2 sm:w-auto"
            >
              {submitting ? 'Saving…' : 'Save goals & continue'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
