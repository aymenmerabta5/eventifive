import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
    error instanceof Error ? error.message : "Unable to load events.";

  return (
    <div
      className={cn(
        "border-destructive/30 relative overflow-hidden rounded-2xl border",
        "from-card via-card to-destructive/5 bg-gradient-to-br",
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
      <div className="bg-destructive/10 pointer-events-none absolute -top-12 -right-12 size-48 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative flex flex-col items-center justify-center px-6 py-12">
        <div
          className={cn(
            "mb-4 flex size-14 items-center justify-center rounded-xl",
            "bg-destructive/10",
          )}
        >
          <IconAlertTriangle className="text-destructive size-7" />
        </div>

        <h3 className="font-display text-destructive mb-2 text-lg font-semibold">
          Failed to load events
        </h3>
        <p className="text-muted-foreground mb-6 max-w-sm text-center text-sm">
          {message}
        </p>

        <Button
          variant="outline"
          onClick={onRetry}
          disabled={isRetrying}
          className={cn(
            "border-destructive/30 gap-2",
            "hover:bg-destructive/10 hover:text-destructive",
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
