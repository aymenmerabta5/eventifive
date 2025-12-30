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
        "@container/card group relative overflow-hidden rounded-2xl border border-border/50",
        "bg-gradient-to-br from-card via-card to-card/80",
        "shadow-sm transition-all duration-500 ease-out",
        "hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5",
        "dark:border-border/30"
      )}
      data-slot="card"
    >
      {/* Accent glow edge - top */}
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-px",
          "bg-gradient-to-r from-transparent via-primary/50 to-transparent",
          "opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        )}
      />

      {/* Trend indicator strip - uses chart colors for positive, destructive for negative */}
      <div
        className={cn(
          "absolute left-0 top-0 h-full w-1 rounded-l-2xl transition-all duration-300",
          isPositive
            ? "bg-gradient-to-b from-chart-2 via-chart-1 to-chart-5"
            : "bg-gradient-to-b from-destructive/70 via-destructive to-destructive/80",
          "opacity-80 group-hover:opacity-100"
        )}
      />

      {/* Background pattern - subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Content */}
      <div className="relative flex flex-col gap-4 p-5 @[200px]/card:p-6">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground/80">
            {title}
          </span>

          {/* Change badge */}
          <div
            className={cn(
              "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
              "transition-transform duration-300 group-hover:scale-105",
              isPositive
                ? "bg-primary/10 text-primary dark:bg-primary/20"
                : "bg-destructive/10 text-destructive dark:bg-destructive/20"
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
              "font-display text-3xl font-bold tracking-tight text-foreground",
              "tabular-nums transition-colors duration-300",
              "@[250px]/card:text-4xl"
            )}
          >
            {value}
          </span>
        </div>

        {/* Footer with trend info */}
        <div className="flex items-center gap-2 border-t border-border/30 pt-3">
          <div
            className={cn(
              "flex size-6 items-center justify-center rounded-full",
              "transition-all duration-300",
              isPositive
                ? "bg-secondary text-primary"
                : "bg-destructive/10 text-destructive"
            )}
          >
            <TrendIcon className="size-3.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-foreground/80">
              {isPositive ? "Trending up" : "Trending down"} this month
            </span>
            <span className="text-[11px] text-muted-foreground/70 @[200px]/card:text-xs">
              {description}
            </span>
          </div>
        </div>
      </div>

      {/* Hover glow effect - uses primary/accent colors */}
      <div
        className={cn(
          "pointer-events-none absolute -bottom-8 -right-8 size-32 rounded-full blur-3xl",
          "opacity-0 transition-opacity duration-500 group-hover:opacity-100",
          isPositive ? "bg-primary/15" : "bg-destructive/15"
        )}
      />
    </div>
  );
}
