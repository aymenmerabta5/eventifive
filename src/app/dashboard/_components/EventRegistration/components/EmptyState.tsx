"use client";

import { cn } from "@/lib/utils";
import { IconUsers } from "@tabler/icons-react";

export function EmptyState() {
  return (
    <div
      className={cn(
        "border-border/50 relative overflow-hidden rounded-2xl border border-dashed",
        "from-card via-card to-card/80 bg-gradient-to-br",
      )}
    >
      {/* Pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: "20px 20px",
        }}
      />

      {/* Decorative gradient */}
      <div className="from-primary/10 via-chart-2/5 pointer-events-none absolute -top-20 -right-20 size-48 rounded-full bg-gradient-to-br to-transparent blur-3xl" />

      <div className="relative flex flex-col items-center justify-center py-16">
        <div
          className={cn(
            "mb-4 flex size-16 items-center justify-center rounded-2xl",
            "from-primary/10 to-chart-2/10 bg-gradient-to-br",
          )}
        >
          <IconUsers className="text-primary/60 size-8" />
        </div>
        <h3 className="font-display text-foreground text-lg font-semibold">
          No registrations yet
        </h3>
        <p className="text-muted-foreground mt-2 max-w-sm text-center text-sm">
          There are no participants or submissions for this event yet.
          <br />
          Registrations will appear here once users sign up.
        </p>
      </div>
    </div>
  );
}
