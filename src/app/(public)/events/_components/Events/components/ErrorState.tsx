"use client";

import { Button } from "@/components/ui/button";
import { IconAlertTriangle, IconLoader2, IconRefresh } from "@tabler/icons-react";

interface ErrorStateProps {
  error: Error | null;
  onRetry: () => void;
  isRetrying: boolean;
}

export function ErrorState({ error, onRetry, isRetrying }: ErrorStateProps) {
  const message =
    error instanceof Error ? error.message : "Please try again later";

  return (
    <div className="min-h-screen">
      {/* Header area with gradient */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 via-secondary/10 to-accent/5" />
        <div className="absolute -top-24 -left-24 size-96 rounded-full bg-gradient-to-br from-destructive/10 to-secondary/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Content */}
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="flex flex-col items-center text-center max-w-md">
          {/* Icon */}
          <div className="mb-6 flex size-20 items-center justify-center rounded-3xl bg-destructive/10">
            <IconAlertTriangle className="size-10 text-destructive" />
          </div>

          {/* Title */}
          <h2 className="mb-3 text-2xl font-bold text-foreground">
            Failed to Load Events
          </h2>

          {/* Description */}
          <p className="mb-2 text-muted-foreground leading-relaxed">
            We encountered an error while loading events.
          </p>
          <p className="mb-8 text-sm text-muted-foreground/80 font-mono bg-muted/50 px-3 py-1.5 rounded-lg">
            {message}
          </p>

          {/* Actions */}
          <Button
            onClick={onRetry}
            disabled={isRetrying}
            className="gap-2"
          >
            {isRetrying ? (
              <IconLoader2 className="size-4 animate-spin" />
            ) : (
              <IconRefresh className="size-4" />
            )}
            {isRetrying ? "Retrying..." : "Try Again"}
          </Button>
        </div>
      </div>
    </div>
  );
}
