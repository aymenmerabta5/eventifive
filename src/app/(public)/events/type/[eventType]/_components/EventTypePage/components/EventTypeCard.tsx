"use client";

import { motion } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import type { Route } from "next";
import { IconClock, IconMapPin, IconArrowRight } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { STATUS_CONFIG } from "../constants";
import {
  cn,
  formatDateLong,
  formatTimeRange12h,
  getEventStatus,
} from "../utils";
import type { EventCardData } from "../types";

interface EventTypeCardProps {
  event: EventCardData;
  index: number;
}

export function EventTypeCard({ event, index }: EventTypeCardProps) {
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  const status = getEventStatus(startDate, endDate);
  const isLive = status === "live";
  const isEnded = status === "ended";

  const config = STATUS_CONFIG[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      <Link
        href={`/events/${event.id}` as Route}
        className="group focus-visible:ring-ring block rounded-3xl focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <article
          className={cn(
            "bg-card relative overflow-hidden rounded-3xl border transition-all duration-500",
            "hover:shadow-primary/10 hover:-translate-y-2 hover:shadow-2xl",
            isLive && "ring-destructive/30 ring-2",
            isEnded && "opacity-70 hover:opacity-100",
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
                "object-cover transition-all duration-700 ease-out",
                "group-hover:scale-110 group-hover:rotate-1",
              )}
              unoptimized={!!event.imageUrl}
            />

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="from-primary/20 to-secondary/20 absolute inset-0 bg-gradient-to-br via-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            {/* Top badges */}
            <div className="absolute top-4 right-4 left-4 flex items-start justify-between">
              {/* Status badge */}
              <Badge
                variant="outline"
                className={cn(
                  "gap-1.5 text-xs font-semibold backdrop-blur-md",
                  config.className,
                )}
              >
                {isLive && config.dotClassName && (
                  <span
                    className={cn("size-2 rounded-full", config.dotClassName)}
                  />
                )}
                {config.label}
              </Badge>

              {/* Date badge */}
              <Badge
                variant="secondary"
                className="bg-card/90 text-card-foreground border-0 shadow-sm backdrop-blur-md"
              >
                {formatDateLong(startDate).split(",")[0]}
              </Badge>
            </div>

            {/* Title overlay */}
            <div className="absolute right-0 bottom-0 left-0 p-5">
              <h3 className="line-clamp-2 text-xl font-bold text-white drop-shadow-lg transition-colors duration-300 md:text-2xl">
                {event.title}
              </h3>
            </div>

            {/* Live glow effect */}
            {isLive && (
              <>
                <div className="bg-destructive/30 absolute -top-20 -right-20 size-40 animate-pulse rounded-full blur-3xl" />
                <div className="border-destructive/30 absolute inset-0 rounded-3xl border-2" />
              </>
            )}
          </div>

          {/* Content section */}
          <div className="space-y-4 p-5">
            {/* Meta info */}
            <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 flex size-7 items-center justify-center rounded-lg">
                  <IconClock className="text-primary size-3.5" />
                </div>
                <span className="font-medium">
                  {formatTimeRange12h(startDate, endDate)}
                </span>
              </div>

              {event.location && (
                <div className="flex items-center gap-2">
                  <div className="bg-primary/10 flex size-7 items-center justify-center rounded-lg">
                    <IconMapPin className="text-primary size-3.5" />
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
            <div className="pt-2">
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-between rounded-xl font-semibold transition-all duration-300",
                  "group-hover:bg-primary group-hover:text-primary-foreground",
                  "group-hover:shadow-primary/20 group-hover:border-transparent group-hover:shadow-lg",
                )}
              >
                <span>Explore Event</span>
                <IconArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </div>
          </div>

          {/* Decorative corner */}
          <div className="from-primary/10 to-secondary/20 absolute -right-16 -bottom-16 size-32 rounded-full bg-gradient-to-br opacity-0 blur-2xl transition-all duration-500 group-hover:opacity-100" />
        </article>
      </Link>
    </motion.div>
  );
}
