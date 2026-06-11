import { redirect } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { LearnerGoal } from '@/types';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  let goals: LearnerGoal[] = [];

  try {
    goals = await apiFetch<LearnerGoal[]>('/learner/goals');
  } catch {
    // If the request fails (e.g. 401 on expired token), middleware will handle the redirect.
    // For any other error we show the dashboard with an empty state.
    goals = [];
  }

  if (goals.length === 0) {
    redirect('/dashboard/onboarding');
  }

  return (
    <main className="min-h-screen bg-white px-6 py-10 text-navy">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-teal">Dashboard</p>
            <h1 className="mt-2 font-sora text-3xl font-bold text-navy">
              Your Learning Goals
            </h1>
            <p className="mt-1 text-sm text-navy/60">
              {goals.length} goal{goals.length !== 1 ? 's' : ''} set
            </p>
          </div>
        </div>

        {/* Goal cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      </div>
    </main>
  );
}

function GoalCard({ goal }: { goal: LearnerGoal }) {
  const priorityLabel =
    goal.priority <= 3
      ? { label: 'High', color: 'bg-red-50 text-red-600 border-red-100' }
      : goal.priority <= 6
        ? { label: 'Medium', color: 'bg-amber-50 text-amber-600 border-amber-100' }
        : { label: 'Low', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' };

  const formattedDate = goal.targetDate
    ? new Date(goal.targetDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <div className="flex flex-col rounded-xl border border-navy/10 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-2">
        <h2 className="font-sora text-base font-semibold text-navy">
          {goal.subject}
        </h2>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${priorityLabel.color}`}
        >
          {priorityLabel.label}
        </span>
      </div>

      {formattedDate && (
        <p className="mt-auto pt-3 text-xs text-navy/50">
          🎯 Target:{' '}
          <span className="font-medium text-navy/70">{formattedDate}</span>
        </p>
      )}
    </div>
  );
}
