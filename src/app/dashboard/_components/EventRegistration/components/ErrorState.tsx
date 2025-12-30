"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { IconAlertTriangle, IconLoader2, IconRefresh } from "@tabler/icons-react";

interface ErrorStateProps {
  error: Error | null;
  onRetry: () => void;
  isRetrying: boolean;
}

export function ErrorState({ error, onRetry, isRetrying }: ErrorStateProps) {
  const message =
    error instanceof Error
      ? error.message
      : "Unable to load registration data.";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-destructive/30",
        "bg-gradient-to-br from-card via-card to-destructive/5"
      )}
    >
      {/* Pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02] dark:opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Decorative glow */}
      <div className="pointer-events-none absolute -right-12 -top-12 size-48 rounded-full bg-destructive/10 blur-3xl" />

      <div className="relative flex flex-col items-center justify-center py-16">
        <div
          className={cn(
            "mb-4 flex size-16 items-center justify-center rounded-2xl",
            "bg-destructive/10"
          )}
        >
          <IconAlertTriangle className="size-8 text-destructive" />
        </div>

        <h3 className="font-display text-lg font-semibold text-destructive">
          Failed to load registrations
        </h3>
        <p className="mb-6 mt-1 max-w-sm text-center text-sm text-muted-foreground">
          {message}
        </p>

        <Button
          variant="outline"
          onClick={onRetry}
          disabled={isRetrying}
          className={cn(
            "gap-2 border-destructive/30",
            "hover:bg-destructive/10 hover:text-destructive"
          )}
        >
          {isRetrying ? (
            <IconLoader2 className="size-4 animate-spin" />
          ) : (
            <IconRefresh className="size-4" />
          )}
          Try again
        </Button>
      </div>
    </div>
  );
}
