import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export default function OnboardingPage() {
  const profileCookie = cookies().get("dersify_profile");

  if (profileCookie?.value) {
    try {
      const data = JSON.parse(profileCookie.value) as { onboarding_completed?: boolean };

      if (data.onboarding_completed === true) {
        redirect("/dashboard");
      }
    } catch {
      // Malformed cookie — proceed to onboarding
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
      <OnboardingWizard />
    </div>
  );
}
