"use client";

import { cn } from "@/lib/utils";
import { IconLoader2 } from "@tabler/icons-react";

export function LoadingState() {
  return (
    <div
      className={cn(
        "border-border/50 relative overflow-hidden rounded-3xl border",
        "from-card via-card to-card/80 bg-gradient-to-br",
      )}
    >
      {/* Pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Shimmer effect */}
      <div
        className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
        }}
      />

      <div className="relative flex flex-col items-center justify-center py-16">
        <div
          className={cn(
            "mb-4 flex size-16 items-center justify-center rounded-2xl",
            "from-primary/10 to-chart-2/10 bg-gradient-to-br",
          )}
        >
          <IconLoader2 className="text-primary size-8 animate-spin" />
        </div>
        <h3 className="font-display text-foreground text-lg font-semibold">
          Loading registrations
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Fetching participants and submissions for this event...
        </p>
      </div>

      <style>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
