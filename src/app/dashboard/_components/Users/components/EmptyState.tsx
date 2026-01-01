import { cn } from "@/lib/utils";
import { IconUsers, IconSparkles } from "@tabler/icons-react";

/**
 * Empty state component for when there are no users
 **/
export function EmptyState() {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-dashed border-border/50",
        "bg-gradient-to-br from-card via-card to-card/80"
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

      {/* Decorative gradient */}
      <div className="pointer-events-none absolute left-1/2 top-0 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b from-primary/10 via-chart-2/5 to-transparent blur-3xl" />

      {/* Content */}
      <div className="relative flex flex-col items-center justify-center px-6 py-16">
        <div
          className={cn(
            "mb-6 flex size-16 items-center justify-center rounded-2xl",
            "bg-gradient-to-br from-secondary to-accent/50",
            "ring-1 ring-border/50"
          )}
        >
          <IconUsers className="size-8 text-primary" />
        </div>

        <h3 className="mb-2 font-display text-xl font-semibold text-foreground">
          No users yet
        </h3>
        <p className="mb-6 max-w-sm text-center text-sm text-muted-foreground">
          No users have registered on the platform yet. Users will appear here once they sign up.
        </p>

        <div className="flex items-center gap-2 rounded-full bg-secondary/50 px-4 py-2">
          <IconSparkles className="size-4 text-primary" />
          <span className="text-xs text-muted-foreground">
            Users will appear here after registration
          </span>
        </div>
      </div>
    </div>
  );
}

