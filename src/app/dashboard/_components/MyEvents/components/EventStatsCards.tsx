import { cn } from "@/lib/utils";
import {
  IconLayoutGrid,
  IconCalendarEvent,
  IconHistory,
} from "@tabler/icons-react";
import type { EventStats } from "../types";

interface EventStatsCardsProps {
  stats: EventStats;
}

interface StatCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  accentColor: "primary" | "chart-2" | "chart-3";
}

function StatCard({
  title,
  value,
  description,
  icon,
  accentColor,
}: StatCardProps) {
  const colorClasses = {
    primary: {
      icon: "bg-primary/10 text-primary",
      strip: "from-primary via-chart-1 to-chart-5",
      glow: "bg-primary/15",
    },
    "chart-2": {
      icon: "bg-chart-2/10 text-chart-2",
      strip: "from-chart-2 via-chart-3 to-chart-4",
      glow: "bg-chart-2/15",
    },
    "chart-3": {
      icon: "bg-chart-3/10 text-chart-3",
      strip: "from-chart-3 via-chart-4 to-chart-5",
      glow: "bg-chart-3/15",
    },
  };

  const colors = colorClasses[accentColor];

  return (
    <div
      className={cn(
        "group border-border/50 relative overflow-hidden rounded-2xl border",
        "from-card via-card to-card/80 bg-gradient-to-br",
        "shadow-sm transition-all duration-500 ease-out",
        "hover:shadow-primary/5 hover:-translate-y-0.5 hover:shadow-lg",
      )}
    >
      {/* Accent strip */}
      <div
        className={cn(
          "absolute top-0 left-0 h-full w-1 rounded-l-2xl",
          "bg-gradient-to-b",
          colors.strip,
          "opacity-80 transition-opacity group-hover:opacity-100",
        )}
      />

      {/* Background pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Content */}
      <div className="relative p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-3">
            <span className="text-muted-foreground/80 text-xs font-medium tracking-wider uppercase">
              {title}
            </span>
            <div className="font-display text-foreground text-3xl font-bold tabular-nums">
              {value}
            </div>
            <p className="text-muted-foreground text-xs">{description}</p>
          </div>

          <div
            className={cn(
              "flex size-10 items-center justify-center rounded-xl",
              "transition-transform duration-300 group-hover:scale-110",
              colors.icon,
            )}
          >
            {icon}
          </div>
        </div>
      </div>

      {/* Hover glow */}
      <div
        className={cn(
          "pointer-events-none absolute -right-8 -bottom-8 size-32 rounded-full blur-3xl",
          "opacity-0 transition-opacity duration-500 group-hover:opacity-100",
          colors.glow,
        )}
      />
    </div>
  );
}

export function EventStatsCards({ stats }: EventStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard
        title="Total Events"
        value={stats.total}
        description="All events you have created"
        icon={<IconLayoutGrid className="size-5" />}
        accentColor="primary"
      />
      <StatCard
        title="Upcoming"
        value={stats.upcoming}
        description="Events that are still active"
        icon={<IconCalendarEvent className="size-5" />}
        accentColor="chart-2"
      />
      <StatCard
        title="Completed"
        value={stats.past}
        description="Finished events"
        icon={<IconHistory className="size-5" />}
        accentColor="chart-3"
      />
    </div>
  );
}
