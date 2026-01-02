import { cn } from "@/lib/utils";
import { IconCalendarPlus, IconSparkles } from "@tabler/icons-react";

export function EmptyState() {
  return (
    <div
      className={cn(
        "border-border/50 relative overflow-hidden rounded-2xl border border-dashed",
        "from-card via-card to-card/80 bg-gradient-to-br",
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
      <div className="from-primary/10 via-chart-2/5 pointer-events-none absolute top-0 left-1/2 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-b to-transparent blur-3xl" />

      {/* Content */}
      <div className="relative flex flex-col items-center justify-center px-6 py-16">
        <div
          className={cn(
            "mb-6 flex size-16 items-center justify-center rounded-2xl",
            "from-secondary to-accent/50 bg-gradient-to-br",
            "ring-border/50 ring-1",
          )}
        >
          <IconCalendarPlus className="text-primary size-8" />
        </div>

        <h3 className="font-display text-foreground mb-2 text-xl font-semibold">
          No events yet
        </h3>
        <p className="text-muted-foreground mb-6 max-w-sm text-center text-sm">
          Start by creating your first event. It will appear here once saved.
        </p>

        <div className="bg-secondary/50 flex items-center gap-2 rounded-full px-4 py-2">
          <IconSparkles className="text-primary size-4" />
          <span className="text-muted-foreground text-xs">
            Use the sidebar to create a new event
          </span>
        </div>
      </div>
    </div>
  );
}
