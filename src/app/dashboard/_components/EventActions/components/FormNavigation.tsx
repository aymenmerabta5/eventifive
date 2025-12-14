"use client";

import { Button } from "@/components/ui/button";
import { Button as StatefulButton } from "@/components/ui/stateful-button";
import { useRouter } from "next/navigation";
import type { EventFormMode, WizardStep } from "../types";

interface FormNavigationProps {
  mode: EventFormMode;
  step: WizardStep;
  isLoading: boolean;
  canGoBack: boolean;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export function FormNavigation({
  mode,
  step,
  isLoading,
  canGoBack,
  onBack,
  onNext,
  onSubmit,
}: FormNavigationProps) {
  const router = useRouter();

  // Update mode: single form with submit button
  if (mode === "update") {
    return (
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard?view=my-events")}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <StatefulButton
          type="submit"
          onClick={onSubmit}
          className="h-11 cursor-pointer rounded-4xl"
          disabled={isLoading}
        >
          {isLoading ? "Updating..." : "Update Event"}
        </StatefulButton>
      </div>
    );
  }

  // Create mode: wizard navigation
  return (
    <div className="flex items-center justify-between gap-3 pt-2">
      <Button
        variant="outline"
        onClick={onBack}
        disabled={!canGoBack || isLoading}
      >
        Back
      </Button>

      {step !== "review" ? (
        <StatefulButton
          type="button"
          onClick={onNext}
          className="h-11 cursor-pointer rounded-4xl"
          disabled={isLoading}
        >
          {isLoading ? "Working..." : "Next"}
        </StatefulButton>
      ) : (
        <Button
          onClick={() => router.push("/dashboard?view=my-events")}
        >
          Done
        </Button>
      )}
    </div>
  );
}
