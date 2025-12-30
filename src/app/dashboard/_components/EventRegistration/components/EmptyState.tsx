"use client";

import { cn } from "@/lib/utils";
import { IconUsers } from "@tabler/icons-react";

export function EmptyState() {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-dashed border-border/50",
        "bg-gradient-to-br from-card via-card to-card/80"
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
      <div className="pointer-events-none absolute -right-20 -top-20 size-48 rounded-full bg-gradient-to-br from-primary/10 via-chart-2/5 to-transparent blur-3xl" />

      <div className="relative flex flex-col items-center justify-center py-16">
        <div
          className={cn(
            "mb-4 flex size-16 items-center justify-center rounded-2xl",
            "bg-gradient-to-br from-primary/10 to-chart-2/10"
          )}
        >
          <IconUsers className="size-8 text-primary/60" />
        </div>
        <h3 className="font-display text-lg font-semibold text-foreground">
          No registrations yet
        </h3>
        <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
          There are no participants or submissions for this event yet.
          <br />
          Registrations will appear here once users sign up.
        </p>
      </div>
    </div>
  );
}
