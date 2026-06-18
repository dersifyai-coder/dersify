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
  value:       string;
  label:       string;
  description: string;
}

// ─── Option data ──────────────────────────────────────────────────────────────

const MOTIVATION_OPTIONS: CardOption[] = [
  { value: "build-project",  label: "Build a project",     description: "I want to ship something"                       },
  { value: "career-advance", label: "Career advancement",  description: "I'm investing in my career"                     },
  { value: "exam-prep",      label: "Exam preparation",    description: "I have an upcoming exam or certification"        },
  { value: "academic",       label: "Academic study",      description: "I'm in school or university"                    },
  { value: "learn-skill",    label: "Learn a new skill",   description: "I want practical ability"                       },
  { value: "curiosity",      label: "Pure curiosity",      description: "I just love learning things"                    },
];

const APPROACH_OPTIONS: CardOption[] = [
  { value: "example-first", label: "See examples first",      description: "" },
  { value: "theory-first",  label: "Understand theory first", description: "" },
  { value: "structured",    label: "Follow a structured path",description: "" },
  { value: "exploratory",   label: "Explore freely",          description: "" },
];

const STRUGGLE_OPTIONS: CardOption[] = [
  { value: "hints",               label: "Keep pushing me (hints only)",  description: "" },
  { value: "explain-differently", label: "Explain it a different way",    description: "" },
  { value: "take-break",          label: "Give me a break and come back", description: "" },
  { value: "persist",             label: "Just explain it fully",         description: "" },
];

const HOURS_OPTIONS: CardOption[] = [
  { value: "lt1",  label: "< 1 hour",   description: "" },
  { value: "1-3",  label: "1–3 hours",  description: "" },
  { value: "3-5",  label: "3–5 hours",  description: "" },
  { value: "5-10", label: "5–10 hours", description: "" },
  { value: "gt10", label: "10+ hours",  description: "" },
];

const PACE_OPTIONS: CardOption[] = [
  { value: "slow-deep", label: "Slow and deep",        description: "" },
  { value: "steady",    label: "Steady progress",      description: "" },
  { value: "fast",      label: "Fast, cover ground",   description: "" },
  { value: "flexible",  label: "Flexible, day by day", description: "" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SelectCard({
  option,
  selected,
  compact,
  onClick,
}: {
  option:    CardOption;
  selected:  boolean;
  compact?:  boolean;
  onClick:   () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full text-left rounded-xl transition-all duration-150",
        compact ? "px-4 py-3" : "px-5 py-4",
      ].join(" ")}
      style={
        selected
          ? {
              border: "2px solid var(--accent)",
              background: "var(--accent-soft)",
            }
          : {
              border: "2px solid var(--border-default)",
              background: "var(--bg-surface)",
            }
      }
    >
      {compact ? (
        <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
          {option.label}
        </span>
      ) : (
        <div>
          <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
            {option.label}
          </p>
          {option.description && (
            <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
              {option.description}
            </p>
          )}
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
          className="h-2 rounded-full transition-all duration-300"
          style={{
            width: i + 1 === current ? "20px" : "8px",
            background: i + 1 === current ? "var(--accent)" : "var(--border-strong)",
          }}
        />
      ))}
    </div>
  );
}

// ─── Wizard ───────────────────────────────────────────────────────────────────

export function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep]             = useState<1 | 2 | 3>(1);
  const [direction, setDirection]   = useState<"forward" | "backward">("forward");
  const [answers, setAnswers]       = useState<Partial<Answers>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);

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
          className="mb-6 rounded-lg px-4 py-3 text-sm"
          style={{
            background: "rgba(239,68,68,0.07)",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "var(--error)",
          }}
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
            className="px-5 py-3 text-sm font-medium rounded-xl transition-colors"
            style={{
              color: "var(--text-secondary)",
              border: "1px solid var(--border-default)",
              background: "transparent",
            }}
          >
            Back
          </button>
        )}

        {step < 3 ? (
          <button
            type="button"
            onClick={advance}
            disabled={!canAdvance()}
            className="flex-1 py-3 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
            style={{
              background: "var(--accent)",
              color: "var(--accent-contrast)",
            }}
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void submit()}
            disabled={!canAdvance() || submitting}
            className="flex-1 py-3 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
            style={{
              background: "var(--accent)",
              color: "var(--accent-contrast)",
            }}
          >
            {submitting ? "Setting up your profile..." : "Start learning"}
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
      <p
        className="text-xs font-semibold tracking-widest uppercase mb-3"
        style={{ color: "var(--accent)" }}
      >
        Step 1 of 3
      </p>
      <h1
        className="text-2xl font-bold mb-1"
        style={{
          fontFamily: "var(--font-display)",
          letterSpacing: "-0.02em",
          color: "var(--text-primary)",
        }}
      >
        What&apos;s driving you to learn right now?
      </h1>
      <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
        Choose one that fits best.
      </p>
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
      <p
        className="text-xs font-semibold tracking-widest uppercase mb-3"
        style={{ color: "var(--accent)" }}
      >
        Step 2 of 3
      </p>
      <h1
        className="text-2xl font-bold mb-6"
        style={{
          fontFamily: "var(--font-display)",
          letterSpacing: "-0.02em",
          color: "var(--text-primary)",
        }}
      >
        How do you learn best?
      </h1>

      <div className="mb-6">
        <p className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
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
        <p className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
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
      <p
        className="text-xs font-semibold tracking-widest uppercase mb-3"
        style={{ color: "var(--accent)" }}
      >
        Step 3 of 3
      </p>
      <h1
        className="text-2xl font-bold mb-6"
        style={{
          fontFamily: "var(--font-display)",
          letterSpacing: "-0.02em",
          color: "var(--text-primary)",
        }}
      >
        Your learning schedule
      </h1>

      <div className="mb-6">
        <p className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
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
        <p className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
          What&apos;s your learning pace?
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
