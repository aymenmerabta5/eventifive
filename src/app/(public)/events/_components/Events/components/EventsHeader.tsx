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
    [totalEvents, liveCount, upcomingCount],
  );

  return (
    <div className="relative container mx-auto overflow-hidden">
      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center py-12 text-center md:py-20">
          {/* Eyebrow */}
          <div className="border-primary/20 bg-card/60 mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 backdrop-blur-sm">
            <IconMapPin className="text-primary size-4" />
            <span className="text-foreground text-sm font-medium">
              Discover & Connect
            </span>
          </div>

          {/* Title */}
          <h1 className="text-foreground mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
            Find Your Next{" "}
            <span className="from-primary via-chart-2 to-chart-5 bg-gradient-to-r bg-clip-text text-transparent">
              Experience
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-muted-foreground mb-8 max-w-2xl text-base md:text-lg">
            Explore conferences, workshops, and seminars that inspire growth.
            Connect with thought leaders and expand your horizons.
          </p>

          {/* Stats */}
          {totalEvents > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className={`border-border/60 bg-card/80 flex items-center gap-3 rounded-xl border px-4 py-3 backdrop-blur-sm ${
                    stat.highlight ? "ring-destructive/20 ring-2" : ""
                  }`}
                >
                  <div
                    className={`flex size-10 items-center justify-center rounded-xl ${stat.bg}`}
                  >
                    <stat.icon className={`size-5 ${stat.color}`} />
                  </div>
                  <div className="text-left">
                    <p className="text-foreground text-xl font-bold tabular-nums">
                      {stat.value}
                    </p>
                    <p className="text-muted-foreground text-xs">
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
      <div className="absolute right-0 bottom-0 left-0 h-16" />
    </div>
  );
}
