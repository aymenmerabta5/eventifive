"use client";

import { motion } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import type { Route } from "next";
import { IconClock, IconMapPin, IconArrowRight } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { STATUS_CONFIG } from "../constants";
import { cn, formatDateLong, formatTimeRange12h, getEventStatus } from "../utils";
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
        className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-3xl"
      >
        <article
          className={cn(
            "relative overflow-hidden rounded-3xl border bg-card transition-all duration-500",
            "hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2",
            isLive && "ring-2 ring-destructive/30",
            isEnded && "opacity-70 hover:opacity-100"
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
                "group-hover:scale-110 group-hover:rotate-1"
              )}
              unoptimized={!!event.imageUrl}
            />

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            {/* Top badges */}
            <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
              {/* Status badge */}
              <Badge
                variant="outline"
                className={cn(
                  "gap-1.5 font-semibold text-xs backdrop-blur-md",
                  config.className
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
                className="bg-card/90 text-card-foreground backdrop-blur-md border-0 shadow-sm"
              >
                {formatDateLong(startDate).split(",")[0]}
              </Badge>
            </div>

            {/* Title overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <h3 className="text-xl md:text-2xl font-bold text-white line-clamp-2 drop-shadow-lg transition-colors duration-300">
                {event.title}
              </h3>
            </div>

            {/* Live glow effect */}
            {isLive && (
              <>
                <div className="absolute -top-20 -right-20 size-40 rounded-full bg-destructive/30 blur-3xl animate-pulse" />
                <div className="absolute inset-0 border-2 border-destructive/30 rounded-3xl" />
              </>
            )}
          </div>

          {/* Content section */}
          <div className="p-5 space-y-4">
            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
                  <IconClock className="size-3.5 text-primary" />
                </div>
                <span className="font-medium">
                  {formatTimeRange12h(startDate, endDate)}
                </span>
              </div>

              {event.location && (
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
                    <IconMapPin className="size-3.5 text-primary" />
                  </div>
                  <span className="font-medium line-clamp-1">
                    {event.location}
                  </span>
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
            <div className="pt-2">
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-between font-semibold rounded-xl transition-all duration-300",
                  "group-hover:bg-primary group-hover:text-primary-foreground",
                  "group-hover:border-transparent group-hover:shadow-lg group-hover:shadow-primary/20"
                )}
              >
                <span>Explore Event</span>
                <IconArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </div>
          </div>

          {/* Decorative corner */}
          <div className="absolute -bottom-16 -right-16 size-32 rounded-full bg-gradient-to-br from-primary/10 to-secondary/20 blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100" />
        </article>
      </Link>
    </motion.div>
  );
}
