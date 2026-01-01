import { Button } from "@/components/ui/button";
import { Send, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormFooterProps {
  isSubmitting: boolean;
  hasFile: boolean;
  progress: number;
}

export function FormFooter({
  isSubmitting,
  hasFile,
  progress,
}: FormFooterProps) {
  const isComplete = progress === 100;

  return (
    <div className="space-y-4">
      {/* Submit button */}
      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting || !hasFile}
        className={cn(
          "group relative w-full h-14 text-base font-semibold transition-all duration-300",
          isComplete
            ? "bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/25"
            : ""
        )}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Submitting your paper...
          </>
        ) : isComplete ? (
          <>
            <CheckCircle2 className="mr-2 h-5 w-5" />
            Submit Paper
            <Send className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </>
        ) : (
          <>
            <Send className="mr-2 h-5 w-5" />
            Complete the form to submit
          </>
        )}
      </Button>

      {/* Helper text */}
      <p className="text-center text-xs text-muted-foreground">
        By submitting, you confirm that this is your original work and agree to the review process.
      </p>
    </div>
  );
}
