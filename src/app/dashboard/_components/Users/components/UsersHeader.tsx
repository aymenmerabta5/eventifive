import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { IconRefresh, IconLoader2, IconUsers } from "@tabler/icons-react";

interface UsersHeaderProps {
  onRefresh: () => void;
  isRefetching: boolean;
}

/**
 * Header component for the Users page
 * 
 * This component follows the same design pattern as EventsHeader:
 * - Gradient background with subtle patterns
 * - Icon badge on the left
 * - Title and description
 * - Refresh button on the right
 * 
 * The refresh button shows a loading spinner when data is being refetched,
 * providing visual feedback to the user about the current state
 */
export function UsersHeader({ onRefresh, isRefetching }: UsersHeaderProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/50",
        "bg-gradient-to-br from-card via-card to-card/80",
        "p-6"
      )}
    >
      {/* Background pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Decorative gradient */}
      <div className="pointer-events-none absolute -right-12 -top-12 size-48 rounded-full bg-gradient-to-br from-primary/10 via-chart-2/10 to-transparent blur-3xl" />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-xl",
              "bg-gradient-to-br from-primary/10 to-chart-2/10",
              "text-primary"
            )}
          >
            <IconUsers className="size-6" />
          </div>
          <div className="space-y-1">
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
              All Users
            </h1>
            <p className="text-sm text-muted-foreground">
              View and manage all registered users on the platform
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={onRefresh}
          disabled={isRefetching}
          className={cn(
            "gap-2 border-border/50 bg-card/50 backdrop-blur-sm",
            "transition-all duration-300",
            "hover:border-primary/30 hover:bg-secondary"
          )}
        >
          {isRefetching ? (
            <IconLoader2 className="size-4 animate-spin" />
          ) : (
            <IconRefresh className="size-4" />
          )}
          Refresh
        </Button>
      </div>
    </div>
  );
}

