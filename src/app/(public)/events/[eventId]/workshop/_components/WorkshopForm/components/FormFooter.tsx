import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Rocket, Loader2, ShieldCheck, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormFooterProps {
  isSubmitting: boolean;
  hasFiles: boolean;
  progress?: number;
}

export function FormFooter({
  isSubmitting,
  hasFiles,
  progress = 0,
}: FormFooterProps) {
  const isComplete = progress === 100;
  const canSubmit = hasFiles && !isSubmitting;

  return (
    <div className="space-y-6 pt-4">
      {/* Progress summary */}
      <div className="border-border/40 from-muted/30 to-muted/10 rounded-xl border bg-gradient-to-r p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
                isComplete
                  ? "bg-green-500/10 text-green-500"
                  : "bg-primary/10 text-primary",
              )}
            >
              {isComplete ? (
                <ShieldCheck className="h-5 w-5" />
              ) : (
                <Rocket className="h-5 w-5" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium">
                {isComplete
                  ? "Ready to submit!"
                  : `${Math.round(progress)}% complete`}
              </p>
              <p className="text-muted-foreground text-xs">
                {isComplete
                  ? "Your proposal is ready for review"
                  : "Fill in all required fields to continue"}
              </p>
            </div>
          </div>

          {/* Mini progress bar for mobile */}
          <div className="hidden w-24 sm:block">
            <Progress value={progress} className="h-1.5" />
          </div>
        </div>
      </div>

      {/* Submit section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Terms notice */}
        <p className="text-muted-foreground max-w-md text-xs">
          By submitting, you agree to our{" "}
          <button type="button" className="text-primary hover:underline">
            Terms of Service
          </button>{" "}
          and{" "}
          <button type="button" className="text-primary hover:underline">
            Privacy Policy
          </button>
        </p>

        {/* Submit button */}
        <Button
          type="submit"
          size="lg"
          disabled={!canSubmit}
          className={cn(
            "group relative w-full overflow-hidden sm:w-auto sm:min-w-[200px]",
            "transition-all duration-300",
            isComplete &&
              "from-primary via-primary to-chart-2 hover:shadow-primary/20 bg-gradient-to-r hover:shadow-lg",
          )}
        >
          {/* Shimmer effect */}
          {isComplete && !isSubmitting && (
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
          )}

          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting proposal...
            </>
          ) : (
            <>
              <Rocket className="mr-2 h-4 w-4" />
              Submit Proposal
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </Button>
      </div>

      {/* Warning if no files */}
      {!hasFiles && (
        <p className="flex items-center justify-center gap-2 text-xs text-amber-600 dark:text-amber-400">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
          Please upload at least one supporting document to continue
        </p>
      )}
    </div>
  );
}
