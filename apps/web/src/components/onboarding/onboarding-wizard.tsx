"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { completeOnboardingAction } from "@/lib/api-client";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Answers {
  motivation:        string;
  learning_approach: string;
  struggle_response: string;
  hours_per_week:    string;
  learning_pace:     string;
}

interface CardOption {
  value: string;
  label: string;
  emoji: string;
  description: string;
}

// ─── Option data ──────────────────────────────────────────────────────────────

const MOTIVATION_OPTIONS: CardOption[] = [
  { value: "build-project",   emoji: "🚀", label: "Build a project",      description: "I want to ship something" },
  { value: "career-advance",  emoji: "💼", label: "Career advancement",    description: "I'm investing in my career" },
  { value: "exam-prep",       emoji: "📝", label: "Exam preparation",      description: "I have an upcoming exam or certification" },
  { value: "academic",        emoji: "🎓", label: "Academic study",        description: "I'm in school / university" },
  { value: "learn-skill",     emoji: "🛠",  label: "Learn a new skill",     description: "I want practical ability" },
  { value: "curiosity",       emoji: "🔍", label: "Pure curiosity",        description: "I just love learning things" },
];

const APPROACH_OPTIONS: CardOption[] = [
  { value: "example-first",  emoji: "", label: "See examples first",      description: "" },
  { value: "theory-first",   emoji: "", label: "Understand the theory first", description: "" },
  { value: "structured",     emoji: "", label: "Follow a structured path", description: "" },
  { value: "exploratory",    emoji: "", label: "Explore freely",           description: "" },
];

const STRUGGLE_OPTIONS: CardOption[] = [
  { value: "hints",              emoji: "", label: "Keep pushing me (hints only)", description: "" },
  { value: "explain-differently",emoji: "", label: "Explain it a different way",  description: "" },
  { value: "take-break",         emoji: "", label: "Give me a break + come back", description: "" },
  { value: "persist",            emoji: "", label: "Just explain it fully",        description: "" },
];

const HOURS_OPTIONS: CardOption[] = [
  { value: "lt1",  emoji: "", label: "< 1 hour",    description: "" },
  { value: "1-3",  emoji: "", label: "1–3 hours",   description: "" },
  { value: "3-5",  emoji: "", label: "3–5 hours",   description: "" },
  { value: "5-10", emoji: "", label: "5–10 hours",  description: "" },
  { value: "gt10", emoji: "", label: "10+ hours",   description: "" },
];

const PACE_OPTIONS: CardOption[] = [
  { value: "slow-deep", emoji: "", label: "Slow and deep",        description: "" },
  { value: "steady",    emoji: "", label: "Steady progress",      description: "" },
  { value: "fast",      emoji: "", label: "Fast, cover ground",   description: "" },
  { value: "flexible",  emoji: "", label: "Flexible, day by day", description: "" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SelectCard({
  option,
  selected,
  compact,
  onClick,
}: {
  option: CardOption;
  selected: boolean;
  compact?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full text-left rounded-xl border-2 transition-all duration-150",
        compact ? "px-4 py-3" : "px-5 py-4",
        selected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-navy/10 bg-white hover:border-primary/40 hover:scale-[1.01]",
      ].join(" ")}
    >
      {compact ? (
        <span className="text-sm font-medium text-navy">{option.label}</span>
      ) : (
        <div className="flex items-start gap-3">
          {option.emoji && (
            <span className="text-2xl leading-none mt-0.5">{option.emoji}</span>
          )}
          <div>
            <p className="font-semibold text-navy text-sm">{option.label}</p>
            {option.description && (
              <p className="text-xs text-navy/50 mt-0.5">{option.description}</p>
            )}
          </div>
        </div>
      )}
    </button>
  );
}

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-2 justify-center mt-8">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={[
            "w-2 h-2 rounded-full transition-all duration-300",
            i + 1 === current ? "bg-primary w-5" : "bg-navy/20",
          ].join(" ")}
        />
      ))}
    </div>
  );
}

// ─── Wizard ───────────────────────────────────────────────────────────────────

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep]       = useState<1 | 2 | 3>(1);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [answers, setAnswers] = useState<Partial<Answers>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  function set<K extends keyof Answers>(key: K, value: string) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function canAdvance(): boolean {
    if (step === 1) return Boolean(answers.motivation);
    if (step === 2) return Boolean(answers.learning_approach && answers.struggle_response);
    if (step === 3) return Boolean(answers.hours_per_week && answers.learning_pace);
    return false;
  }

  function advance() {
    if (step < 3) {
      setDirection("forward");
      setStep((s) => (s + 1) as 1 | 2 | 3);
    }
  }

  function back() {
    if (step > 1) {
      setDirection("backward");
      setStep((s) => (s - 1) as 1 | 2 | 3);
    }
  }

  async function submit() {
    if (!canAdvance()) return;

    setSubmitting(true);
    setError(null);

    const result = await completeOnboardingAction(answers as Answers);

    if (result.success) {
      router.push("/dashboard");
      return;
    }

    setSubmitting(false);
    setError(result.error ?? "Something went wrong. Please try again.");
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      {error && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <div
        key={step}
        className={direction === "forward" ? "animate-step-in-right" : "animate-step-in-left"}
      >
        {step === 1 && (
          <Step1
            selected={answers.motivation ?? ""}
            onSelect={(v) => set("motivation", v)}
          />
        )}
        {step === 2 && (
          <Step2
            approach={answers.learning_approach ?? ""}
            struggle={answers.struggle_response ?? ""}
            onApproach={(v) => set("learning_approach", v)}
            onStruggle={(v) => set("struggle_response", v)}
          />
        )}
        {step === 3 && (
          <Step3
            hours={answers.hours_per_week ?? ""}
            pace={answers.learning_pace ?? ""}
            onHours={(v) => set("hours_per_week", v)}
            onPace={(v) => set("learning_pace", v)}
          />
        )}
      </div>

      <div className="mt-8 flex items-center gap-3">
        {step > 1 && (
          <button
            type="button"
            onClick={back}
            className="px-5 py-3 text-sm font-medium text-navy/60 rounded-xl border border-navy/10 hover:border-navy/30 transition-colors"
          >
            Back
          </button>
        )}

        {step < 3 ? (
          <button
            type="button"
            onClick={advance}
            disabled={!canAdvance()}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg, #1B4FDB 0%, #0D9488 100%)" }}
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void submit()}
            disabled={!canAdvance() || submitting}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg, #1B4FDB 0%, #0D9488 100%)" }}
          >
            {submitting ? "Setting up your profile…" : "Start learning →"}
          </button>
        )}
      </div>

      <ProgressDots current={step} total={3} />
    </div>
  );
}

// ─── Step components ──────────────────────────────────────────────────────────

function Step1({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-xs font-semibold tracking-widest text-teal uppercase mb-3">
        Step 1 of 3
      </p>
      <h1 className="font-sora text-2xl font-bold text-navy mb-1">
        What's driving you to learn right now?
      </h1>
      <p className="text-sm text-navy/50 mb-6">Choose one that fits best.</p>

      <div className="grid grid-cols-1 gap-3">
        {MOTIVATION_OPTIONS.map((opt) => (
          <SelectCard
            key={opt.value}
            option={opt}
            selected={selected === opt.value}
            onClick={() => onSelect(opt.value)}
          />
        ))}
      </div>
    </div>
  );
}

function Step2({
  approach,
  struggle,
  onApproach,
  onStruggle,
}: {
  approach:   string;
  struggle:   string;
  onApproach: (v: string) => void;
  onStruggle: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-xs font-semibold tracking-widest text-teal uppercase mb-3">
        Step 2 of 3
      </p>
      <h1 className="font-sora text-2xl font-bold text-navy mb-6">
        How do you learn best?
      </h1>

      <div className="mb-6">
        <p className="text-sm font-semibold text-navy mb-3">
          When you learn, you prefer to…
        </p>
        <div className="grid grid-cols-2 gap-2">
          {APPROACH_OPTIONS.map((opt) => (
            <SelectCard
              key={opt.value}
              option={opt}
              selected={approach === opt.value}
              compact
              onClick={() => onApproach(opt.value)}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-navy mb-3">
          When you get stuck, you want the AI to…
        </p>
        <div className="grid grid-cols-2 gap-2">
          {STRUGGLE_OPTIONS.map((opt) => (
            <SelectCard
              key={opt.value}
              option={opt}
              selected={struggle === opt.value}
              compact
              onClick={() => onStruggle(opt.value)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Step3({
  hours,
  pace,
  onHours,
  onPace,
}: {
  hours:   string;
  pace:    string;
  onHours: (v: string) => void;
  onPace:  (v: string) => void;
}) {
  return (
    <div>
      <p className="text-xs font-semibold tracking-widest text-teal uppercase mb-3">
        Step 3 of 3
      </p>
      <h1 className="font-sora text-2xl font-bold text-navy mb-6">
        Your learning schedule
      </h1>

      <div className="mb-6">
        <p className="text-sm font-semibold text-navy mb-3">
          How many hours per week can you dedicate?
        </p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {HOURS_OPTIONS.map((opt) => (
            <SelectCard
              key={opt.value}
              option={opt}
              selected={hours === opt.value}
              compact
              onClick={() => onHours(opt.value)}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-navy mb-3">
          What's your learning pace?
        </p>
        <div className="grid grid-cols-2 gap-2">
          {PACE_OPTIONS.map((opt) => (
            <SelectCard
              key={opt.value}
              option={opt}
              selected={pace === opt.value}
              compact
              onClick={() => onPace(opt.value)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
