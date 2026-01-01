import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { IconAlertTriangle, IconLoader2, IconRefresh } from "@tabler/icons-react";

interface ErrorStateProps {
  error: Error | null;
  onRetry: () => void;
  isRetrying: boolean;
}

/**
 * Error state component for the Users page
 * 
 * This component displays when there's an error fetching users.
 * It provides:
 * - Clear error message
 * - Visual error indicator (alert icon)
 * - Retry button to attempt fetching again
 * 
 * The design matches ErrorState from MyEvents component for consistency.
 * The destructive color scheme (red/orange tones) clearly indicates an error state
 */
export function ErrorState({ error, onRetry, isRetrying }: ErrorStateProps) {
  const message =
    error instanceof Error ? error.message : "Unable to load users.";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-destructive/30",
        "bg-gradient-to-br from-card via-card to-destructive/5"
      )}
    >
      {/* Background pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02] dark:opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Decorative glow */}
      <div className="pointer-events-none absolute -right-12 -top-12 size-48 rounded-full bg-destructive/10 blur-3xl" />

      {/* Content */}
      <div className="relative flex flex-col items-center justify-center px-6 py-12">
        <div
          className={cn(
            "mb-4 flex size-14 items-center justify-center rounded-xl",
            "bg-destructive/10"
          )}
        >
          <IconAlertTriangle className="size-7 text-destructive" />
        </div>

        <h3 className="mb-2 font-display text-lg font-semibold text-destructive">
          Failed to load users
        </h3>
        <p className="mb-6 max-w-sm text-center text-sm text-muted-foreground">
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

