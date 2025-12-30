"use client";

import { Button } from "@/components/ui/button";
import { Button as StatefulButton } from "@/components/ui/stateful-button";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, X, Loader2 } from "lucide-react";
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
      <div className="flex items-center justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard?view=my-events")}
          disabled={isLoading}
          className="gap-2"
        >
          <X className="size-4" />
          Cancel
        </Button>
        <StatefulButton
          type="submit"
          onClick={onSubmit}
          className="h-11 cursor-pointer gap-2 rounded-xl px-6"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <Check className="size-4" />
              Update Event
            </>
          )}
        </StatefulButton>
      </div>
    );
  }

  // Create mode: wizard navigation
  return (
    <div className="flex items-center justify-between gap-3">
      <Button
        variant="outline"
        onClick={onBack}
        disabled={!canGoBack || isLoading}
        className="gap-2"
      >
        <ArrowLeft className="size-4" />
        Back
      </Button>

      {step !== "review" ? (
        <StatefulButton
          type="button"
          onClick={onNext}
          className="h-11 cursor-pointer gap-2 rounded-xl px-6"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Working...
            </>
          ) : (
            <div className="flex items-center gap-2">
              Continue
              <ArrowRight className="size-4" />
            </div>
          )}
        </StatefulButton>
      ) : (
        <Button
          onClick={() => router.push("/dashboard?view=my-events")}
          className="h-11 gap-2 rounded-xl px-6"
        >
          <Check className="size-4" />
          Done
        </Button>
      )}
    </div>
  );
}
