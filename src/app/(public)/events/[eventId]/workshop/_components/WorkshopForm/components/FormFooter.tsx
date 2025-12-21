import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { CheckCircle2, Loader2 } from "lucide-react";

interface FormFooterProps {
  isSubmitting: boolean;
  hasFiles: boolean;
}

export function FormFooter({ isSubmitting, hasFiles }: FormFooterProps) {
  return (
    <CardFooter className="flex-col gap-4 px-0 pt-4 sm:flex-row sm:justify-between">
      <p className="text-muted-foreground text-xs">
        By submitting, you agree to our terms and conditions.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Button
          type="submit"
          className="w-full sm:w-auto sm:min-w-[200px]"
          disabled={isSubmitting || !hasFiles}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Apply to Workshop
            </>
          )}
        </Button>
      </div>
    </CardFooter>
  );
}
