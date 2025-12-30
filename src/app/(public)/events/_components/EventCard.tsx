"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  IconArrowRight,
  IconCalendarEvent,
  IconClock,
  IconMapPin,
} from "@tabler/icons-react";
import Image from "next/image";
import type { Event } from "@/server/db/schema";
import Link from "next/link";
import type { Route } from "next";
import { formatDateLong, formatTimeRange12h } from "@/lib/date";
import { cn } from "@/lib/utils";

type EventCardData = Pick<
  Event,
  | "id"
  | "title"
  | "type"
  | "startDate"
  | "endDate"
  | "location"
  | "smallDescription"
> & {
  imageUrl?: string | null;
};

export interface EventCardProps {
  event: Readonly<EventCardData>;
}

type EventStatus = "live" | "upcoming" | "ended";

function getEventStatus(startDate: Date, endDate: Date): EventStatus {
  const now = new Date();
  if (now >= startDate && now <= endDate) return "live";
  if (now < startDate) return "upcoming";
  return "ended";
}

const statusConfig: Record<
  EventStatus,
  { label: string; className: string; dotClassName?: string }
> = {
  live: {
    label: "Live",
    className:
      "bg-destructive text-destructive-foreground border-destructive shadow-lg shadow-destructive/25",
    dotClassName: "bg-destructive-foreground animate-pulse",
  },
  upcoming: {
    label: "Upcoming",
    className:
      "bg-chart-4/10 text-chart-4 border-chart-4/30",
  },
  ended: {
    label: "Ended",
    className:
      "bg-muted text-muted-foreground border-border",
  },
};

const typeLabels: Record<string, string> = {
  congress: "Congress",
  seminar: "Seminar",
  workshop: "Workshop",
  scientific_meeting: "Scientific Meeting",
  conference: "Conference",
  symposium: "Symposium",
};

export default function EventCard({ event }: EventCardProps) {
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  const status = getEventStatus(startDate, endDate);
  const config = statusConfig[status];
  const isLive = status === "live";
  const isEnded = status === "ended";

  return (
    <Link
      href={`/events/${event.id}` as Route}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-2xl"
    >
      <article
        className={cn(
          "relative overflow-hidden rounded-2xl border bg-card transition-all duration-500",
          "hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1",
          isLive && "ring-2 ring-destructive/20",
          isEnded && "opacity-75 hover:opacity-100"
        )}
      >
        {/* Image section */}
        <div className="relative aspect-[16/10] w-full overflow-hidden">
          <Image
            src={event.imageUrl || "/download.jpg"}
            alt={event.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className={cn(
              "object-cover transition-transform duration-700 ease-out",
              "group-hover:scale-105"
            )}
            unoptimized={!!event.imageUrl}
          />

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          {/* Top badges */}
          <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
            {/* Event type badge */}
            <Badge
              variant="secondary"
              className="bg-card/90 text-card-foreground backdrop-blur-sm border-0 shadow-sm"
            >
              {typeLabels[event.type] || event.type}
            </Badge>

            {/* Status badge */}
            <Badge
              variant="outline"
              className={cn("gap-1.5 font-medium", config.className)}
            >
              {isLive && (
                <span
                  className={cn("size-1.5 rounded-full", config.dotClassName)}
                />
              )}
              {config.label}
            </Badge>
          </div>

          {/* Bottom gradient text area */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h3 className="text-xl font-bold text-white line-clamp-2 drop-shadow-sm group-hover:text-primary transition-colors">
              {event.title}
            </h3>
          </div>

          {/* Live indicator glow */}
          {isLive && (
            <div className="absolute -top-20 -right-20 size-40 rounded-full bg-destructive/20 blur-3xl animate-pulse" />
          )}
        </div>

        {/* Content section */}
        <div className="p-5 space-y-4">
          {/* Meta info */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                <IconCalendarEvent className="size-4 text-primary" />
              </div>
              <span className="font-medium">{formatDateLong(startDate)}</span>
            </div>

            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                <IconClock className="size-4 text-primary" />
              </div>
              <span className="font-medium">
                {formatTimeRange12h(startDate, endDate)}
              </span>
            </div>

            {event.location && (
              <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                  <IconMapPin className="size-4 text-primary" />
                </div>
                <span className="font-medium line-clamp-1">{event.location}</span>
              </div>
            )}
          </div>

          {/* Description */}
          {event.smallDescription && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {event.smallDescription}
            </p>
          )}

          {/* Action button */}
          <Button
            variant="outline"
            className={cn(
              "w-full justify-between font-semibold transition-all duration-300",
              "group-hover:bg-primary group-hover:text-primary-foreground",
              "group-hover:border-transparent group-hover:shadow-lg group-hover:shadow-primary/20"
            )}
          >
            <span>View Details</span>
            <IconArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
        </div>

        {/* Decorative corner accent */}
        <div className="absolute -bottom-8 -right-8 size-24 rounded-full bg-gradient-to-br from-primary/5 to-secondary/10 blur-2xl transition-opacity duration-500 opacity-0 group-hover:opacity-100" />
      </article>
    </Link>
  );
}
