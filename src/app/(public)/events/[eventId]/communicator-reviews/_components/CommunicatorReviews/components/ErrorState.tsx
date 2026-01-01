import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw, Loader2 } from "lucide-react";

interface ErrorStateProps {
  error: Error | null;
  onRetry: () => void;
  isRetrying: boolean;
}

export function ErrorState({ error, onRetry, isRetrying }: ErrorStateProps) {
  const message =
    error instanceof Error ? error.message : "Please try again later.";

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Decorative background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="bg-destructive/10 absolute -top-40 -right-40 h-80 w-80 rounded-full blur-3xl" />
        <div className="bg-destructive/5 absolute -bottom-40 -left-40 h-96 w-96 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-[70vh] items-center justify-center px-4 py-12">
        <Card className="border-destructive/30 bg-card/80 w-full max-w-lg overflow-hidden backdrop-blur-sm">
          {/* Top decorative bar */}
          <div className="bg-destructive/80 h-1 w-full" />

          <CardContent className="flex flex-col items-center gap-6 px-6 py-10 text-center sm:px-10">
            {/* Icon container */}
            <div className="relative">
              <div className="bg-destructive/10 absolute inset-0 scale-150 rounded-full blur-xl" />
              <div className="border-destructive/30 bg-destructive/10 relative flex h-16 w-16 items-center justify-center rounded-2xl border">
                <AlertTriangle className="text-destructive h-8 w-8" />
              </div>
            </div>

            {/* Text content */}
            <div className="space-y-2">
              <h2 className="font-display text-foreground text-xl font-semibold tracking-tight">
                Unable to load applications
              </h2>
              <p className="text-muted-foreground max-w-sm text-sm leading-relaxed">
                {message}
              </p>
            </div>

            {/* Retry button */}
            <Button
              onClick={onRetry}
              disabled={isRetrying}
              variant="outline"
              className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive gap-2"
            >
              {isRetrying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCcw className="h-4 w-4" />
                  Try again
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
