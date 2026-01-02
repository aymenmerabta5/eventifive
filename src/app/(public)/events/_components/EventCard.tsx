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
    className: "bg-chart-4/10 text-chart-4 border-chart-4/30",
  },
  ended: {
    label: "Ended",
    className: "bg-muted text-muted-foreground border-border",
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
      className="group focus-visible:ring-ring block rounded-2xl focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      <article
        className={cn(
          "bg-card relative overflow-hidden rounded-2xl border transition-all duration-500",
          "hover:shadow-primary/5 hover:-translate-y-1 hover:shadow-xl",
          isLive && "ring-destructive/20 ring-2",
          isEnded && "opacity-75 hover:opacity-100",
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
              "group-hover:scale-105",
            )}
            unoptimized={!!event.imageUrl}
          />

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="from-primary/10 to-secondary/10 absolute inset-0 bg-gradient-to-br via-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          {/* Top badges */}
          <div className="absolute top-4 right-4 left-4 flex items-start justify-between">
            {/* Event type badge */}
            <Badge
              variant="secondary"
              className="bg-card/90 text-card-foreground border-0 shadow-sm backdrop-blur-sm"
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
          <div className="absolute right-0 bottom-0 left-0 p-5">
            <h3 className="group-hover:text-primary line-clamp-2 text-xl font-bold text-white drop-shadow-sm transition-colors">
              {event.title}
            </h3>
          </div>

          {/* Live indicator glow */}
          {isLive && (
            <div className="bg-destructive/20 absolute -top-20 -right-20 size-40 animate-pulse rounded-full blur-3xl" />
          )}
        </div>

        {/* Content section */}
        <div className="space-y-4 p-5">
          {/* Meta info */}
          <div className="space-y-2.5">
            <div className="text-muted-foreground flex items-center gap-2.5 text-sm">
              <div className="bg-primary/10 flex size-8 items-center justify-center rounded-lg">
                <IconCalendarEvent className="text-primary size-4" />
              </div>
              <span className="font-medium">{formatDateLong(startDate)}</span>
            </div>

            <div className="text-muted-foreground flex items-center gap-2.5 text-sm">
              <div className="bg-primary/10 flex size-8 items-center justify-center rounded-lg">
                <IconClock className="text-primary size-4" />
              </div>
              <span className="font-medium">
                {formatTimeRange12h(startDate, endDate)}
              </span>
            </div>

            {event.location && (
              <div className="text-muted-foreground flex items-center gap-2.5 text-sm">
                <div className="bg-primary/10 flex size-8 items-center justify-center rounded-lg">
                  <IconMapPin className="text-primary size-4" />
                </div>
                <span className="line-clamp-1 font-medium">
                  {event.location}
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          {event.smallDescription && (
            <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
              {event.smallDescription}
            </p>
          )}

          {/* Action button */}
          <Button
            variant="outline"
            className={cn(
              "w-full justify-between font-semibold transition-all duration-300",
              "group-hover:bg-primary group-hover:text-primary-foreground",
              "group-hover:shadow-primary/20 group-hover:border-transparent group-hover:shadow-lg",
            )}
          >
            <span>View Details</span>
            <IconArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Button>
        </div>

        {/* Decorative corner accent */}
        <div className="from-primary/5 to-secondary/10 absolute -right-8 -bottom-8 size-24 rounded-full bg-gradient-to-br opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
      </article>
    </Link>
  );
}
