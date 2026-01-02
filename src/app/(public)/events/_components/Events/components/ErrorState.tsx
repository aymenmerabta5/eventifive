"use client";

import { Button } from "@/components/ui/button";
import {
  IconAlertTriangle,
  IconLoader2,
  IconRefresh,
} from "@tabler/icons-react";

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
        <div className="from-destructive/5 via-secondary/10 to-accent/5 absolute inset-0 bg-gradient-to-br" />
        <div className="from-destructive/10 to-secondary/5 absolute -top-24 -left-24 size-96 rounded-full bg-gradient-to-br blur-3xl" />
        <div className="from-background absolute right-0 bottom-0 left-0 h-24 bg-gradient-to-t to-transparent" />
      </div>

      {/* Content */}
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="flex max-w-md flex-col items-center text-center">
          {/* Icon */}
          <div className="bg-destructive/10 mb-6 flex size-20 items-center justify-center rounded-3xl">
            <IconAlertTriangle className="text-destructive size-10" />
          </div>

          {/* Title */}
          <h2 className="text-foreground mb-3 text-2xl font-bold">
            Failed to Load Events
          </h2>

          {/* Description */}
          <p className="text-muted-foreground mb-2 leading-relaxed">
            We encountered an error while loading events.
          </p>
          <p className="text-muted-foreground/80 bg-muted/50 mb-8 rounded-lg px-3 py-1.5 font-mono text-sm">
            {message}
          </p>

          {/* Actions */}
          <Button onClick={onRetry} disabled={isRetrying} className="gap-2">
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
