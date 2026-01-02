"use client";

import {
  IconCalendarEvent,
  IconExternalLink,
  IconSparkles,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { EventItem } from "./EventItem";
import { MAX_RECENT_EVENTS } from "../constants";
import Link from "next/link";
import type { RecentEvent } from "../types";

interface ParticipationCardProps {
  recentEvents: RecentEvent[];
  isOwnProfile?: boolean;
}

export function ParticipationCard({
  recentEvents,
  isOwnProfile,
}: ParticipationCardProps) {
  const displayedEvents = recentEvents.slice(0, MAX_RECENT_EVENTS);
  const hasEvents = displayedEvents.length > 0;
  const upcomingCount = recentEvents.filter(
    (e) => e.status === "upcoming",
  ).length;

  return (
    <div className="group border-border/50 bg-card/50 hover:border-border hover:shadow-primary/5 relative overflow-hidden rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:shadow-lg">
      {/* Subtle gradient accent */}
      <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-500/60 via-orange-500 to-amber-500/60" />

      {/* Header */}
      <div className="border-border/50 flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10">
            <IconCalendarEvent className="size-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Recent Activity</h3>
            <p className="text-muted-foreground text-xs">
              {hasEvents
                ? `${recentEvents.length} event${recentEvents.length !== 1 ? "s" : ""}${upcomingCount > 0 ? ` • ${upcomingCount} upcoming` : ""}`
                : "No events yet"}
            </p>
          </div>
        </div>
        {hasEvents && (
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="gap-2 rounded-full"
          >
            <Link href="/events">
              <IconExternalLink className="size-4" />
              All
            </Link>
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {hasEvents ? (
          <div className="space-y-3">
            {displayedEvents.map((event) => (
              <EventItem key={event.id ?? event.title} event={event} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="relative mb-4">
              <div className="absolute inset-0 scale-150 rounded-full bg-amber-500/10 blur-xl" />
              <div className="border-border/50 bg-card relative flex size-16 items-center justify-center rounded-2xl border">
                <IconSparkles className="text-muted-foreground size-7" />
              </div>
            </div>
            <p className="text-muted-foreground max-w-xs text-sm">
              {isOwnProfile
                ? "Your event participations will appear here."
                : "No recent event activity to show."}
            </p>
            {isOwnProfile && (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="mt-4 gap-2 rounded-full"
              >
                <Link href="/events">
                  <IconCalendarEvent className="size-4" />
                  Browse Events
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
