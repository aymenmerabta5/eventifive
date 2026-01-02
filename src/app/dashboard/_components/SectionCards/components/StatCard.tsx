"use client";

import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { StatCardProps } from "../types";

export function StatCard({ title, value, change, description }: StatCardProps) {
  const isPositive = change >= 0;
  const TrendIcon = isPositive ? IconTrendingUp : IconTrendingDown;
  const changeText = isPositive ? `+${change}%` : `${change}%`;

  return (
    <div
      className={cn(
        "group @container/card relative overflow-hidden rounded-2xl",
        "bg-card border-border/40 border",
        "shadow-sm transition-all duration-500 ease-out",
        "hover:shadow-primary/8 hover:-translate-y-1 hover:shadow-xl",
        "hover:border-primary/20",
      )}
      data-slot="card"
    >
      {/* Accent gradient strip on left */}
      <div
        className={cn(
          "absolute top-0 left-0 h-full w-1 transition-all duration-300",
          isPositive
            ? "from-chart-1 via-primary to-chart-3 bg-gradient-to-b"
            : "from-destructive/60 via-destructive to-destructive/80 bg-gradient-to-b",
          "group-hover:w-1.5",
        )}
      />

      {/* Hover glow background */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500",
          "bg-gradient-to-br",
          isPositive
            ? "from-primary/3 to-chart-2/3 via-transparent"
            : "from-destructive/3 to-destructive/3 via-transparent",
          "group-hover:opacity-100",
        )}
      />

      {/* Decorative corner accent */}
      <div
        className={cn(
          "pointer-events-none absolute -top-12 -right-12 size-24 rounded-full blur-2xl",
          "transition-all duration-500",
          isPositive ? "bg-primary/5" : "bg-destructive/5",
          "group-hover:scale-150",
          isPositive
            ? "group-hover:bg-primary/10"
            : "group-hover:bg-destructive/10",
        )}
      />

      {/* Content */}
      <div className="relative flex flex-col gap-4 p-5 @[220px]/card:p-6">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <span className="text-muted-foreground/70 text-[11px] font-semibold tracking-widest uppercase @[200px]/card:text-xs">
            {title}
          </span>

          {/* Change badge */}
          <div
            className={cn(
              "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold tabular-nums",
              "transition-all duration-300",
              "shadow-sm",
              isPositive
                ? "from-primary/10 to-chart-2/10 text-primary ring-primary/20 bg-gradient-to-r ring-1"
                : "from-destructive/10 to-destructive/5 text-destructive ring-destructive/20 bg-gradient-to-r ring-1",
              "group-hover:scale-105 group-hover:shadow-md",
              isPositive
                ? "group-hover:ring-primary/30"
                : "group-hover:ring-destructive/30",
            )}
          >
            <TrendIcon className="size-3" />
            <span>{changeText}</span>
          </div>
        </div>

        {/* Main value */}
        <div className="flex flex-col gap-1">
          <span
            className={cn(
              "font-display text-foreground text-3xl font-bold tracking-tight",
              "tabular-nums transition-all duration-300",
              "@[250px]/card:text-4xl",
              "group-hover:text-foreground",
            )}
          >
            {value}
          </span>
        </div>

        {/* Footer with trend info */}
        <div className="border-border/40 flex items-center gap-3 border-t pt-4">
          <div
            className={cn(
              "flex size-8 items-center justify-center rounded-xl",
              "transition-all duration-300",
              isPositive
                ? "from-primary/15 to-chart-2/15 text-primary bg-gradient-to-br"
                : "from-destructive/15 to-destructive/10 text-destructive bg-gradient-to-br",
              "group-hover:scale-110",
              isPositive
                ? "group-hover:from-primary/20 group-hover:to-chart-2/20"
                : "group-hover:from-destructive/20 group-hover:to-destructive/15",
            )}
          >
            <TrendIcon className="size-4" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-foreground/80 text-xs font-medium">
              {isPositive ? "Trending up" : "Trending down"} this month
            </span>
            <span className="text-muted-foreground/60 text-[11px] @[200px]/card:text-xs">
              {description}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
