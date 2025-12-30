"use client";

import { useMemo } from "react";
import {
  IconCalendarEvent,
  IconSparkles,
  IconClock,
  IconMapPin,
} from "@tabler/icons-react";

interface EventsHeaderProps {
  totalEvents?: number;
  liveCount?: number;
  upcomingCount?: number;
}

export function EventsHeader({
  totalEvents = 0,
  liveCount = 0,
  upcomingCount = 0,
}: EventsHeaderProps) {
  const stats = useMemo(
    () => [
      {
        label: "Total Events",
        value: totalEvents,
        icon: IconCalendarEvent,
        color: "text-primary",
        bg: "bg-primary/10",
      },
      {
        label: "Live Now",
        value: liveCount,
        icon: IconSparkles,
        color: "text-destructive",
        bg: "bg-destructive/10",
        highlight: liveCount > 0,
      },
      {
        label: "Upcoming",
        value: upcomingCount,
        icon: IconClock,
        color: "text-chart-4",
        bg: "bg-chart-4/10",
      },
    ],
    [totalEvents, liveCount, upcomingCount]
  );

  return (
    <div className="relative overflow-hidden container mx-auto">

      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center py-12 md:py-20 text-center">
          {/* Eyebrow */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/60 px-4 py-2 backdrop-blur-sm">
            <IconMapPin className="size-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              Discover & Connect
            </span>
          </div>

          {/* Title */}
          <h1 className="mb-4 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
            Find Your Next{" "}
            <span className="bg-gradient-to-r from-primary via-chart-2 to-chart-5 bg-clip-text text-transparent">
              Experience
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mb-8 max-w-2xl text-base md:text-lg text-muted-foreground">
            Explore conferences, workshops, and seminars that inspire growth.
            Connect with thought leaders and expand your horizons.
          </p>

          {/* Stats */}
          {totalEvents > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className={`flex items-center gap-3 rounded-xl border border-border/60 bg-card/80 px-4 py-3 backdrop-blur-sm ${
                    stat.highlight ? "ring-2 ring-destructive/20" : ""
                  }`}
                >
                  <div
                    className={`flex size-10 items-center justify-center rounded-xl ${stat.bg}`}
                  >
                    <stat.icon className={`size-5 ${stat.color}`} />
                  </div>
                  <div className="text-left">
                    <p className="text-xl font-bold text-foreground tabular-nums">
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-16" />
    </div>
  );
}
