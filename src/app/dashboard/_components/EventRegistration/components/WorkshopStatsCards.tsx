"use client";

import { cn } from "@/lib/utils";
import {
  IconPresentation,
  IconCircleCheck,
  IconClock,
  IconCircleX,
} from "@tabler/icons-react";

interface WorkshopStatsCardsProps {
  total: number;
  accepted: number;
  pending: number;
  rejected: number;
}

export function WorkshopStatsCards({
  total,
  accepted,
  pending,
  rejected,
}: WorkshopStatsCardsProps) {
  const stats = [
    {
      label: "Total Applications",
      value: total,
      description: "All workshop applications",
      icon: IconPresentation,
      colorClass: "text-chart-3",
      bgClass: "from-chart-3/10 to-chart-3/5",
      iconBgClass: "bg-chart-3/10",
    },
    {
      label: "Accepted",
      value: accepted,
      description: "Approved workshops",
      icon: IconCircleCheck,
      colorClass: "text-primary",
      bgClass: "from-primary/10 to-primary/5",
      iconBgClass: "bg-primary/10",
    },
    {
      label: "Pending",
      value: pending,
      description: "Awaiting decision",
      icon: IconClock,
      colorClass: "text-chart-4",
      bgClass: "from-chart-4/10 to-chart-4/5",
      iconBgClass: "bg-chart-4/10",
    },
    {
      label: "Rejected",
      value: rejected,
      description: "Not approved",
      icon: IconCircleX,
      colorClass: "text-destructive",
      bgClass: "from-destructive/10 to-destructive/5",
      iconBgClass: "bg-destructive/10",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={cn(
            "relative overflow-hidden rounded-2xl border border-border/50",
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

          {/* Gradient accent */}
          <div
            className={cn(
              "pointer-events-none absolute -right-8 -top-8 size-24 rounded-full blur-2xl",
              stat.bgClass.replace("from-", "bg-").split(" ")[0]
            )}
          />

          <div className="relative p-5">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <p className={cn("font-display text-3xl font-bold", stat.colorClass)}>
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </div>
              <div
                className={cn(
                  "flex size-12 items-center justify-center rounded-xl",
                  stat.iconBgClass
                )}
              >
                <stat.icon className={cn("size-6", stat.colorClass)} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
