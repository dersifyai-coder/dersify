"use server";

import { apiFetch, ApiError } from "@/lib/api";
import { setProfileCookie } from "./auth/cookies";

export interface OnboardingPayload {
  motivation: string;
  learning_approach: string;
  struggle_response: string;
  hours_per_week: string;
  learning_pace: string;
}

export interface OnboardingActionResult {
  success: boolean;
  alreadyCompleted?: boolean;
  error?: string;
}

export async function completeOnboardingAction(
  dto: OnboardingPayload,
): Promise<OnboardingActionResult> {
  try {
    await apiFetch<unknown>("/onboarding/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });

    setProfileCookie({ onboarding_completed: true });

    return { success: true };
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) {
      setProfileCookie({ onboarding_completed: true });
      return { success: true, alreadyCompleted: true };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Something went wrong.",
    };
  }
}
