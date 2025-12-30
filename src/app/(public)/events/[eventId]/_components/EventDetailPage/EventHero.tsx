"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  IconCalendarEvent,
  IconArrowLeft,
  IconMapPin,
  IconCalendar,
  IconSparkles,
} from "@tabler/icons-react";
import { formatDateFull, formatTime } from "@/lib/date";

interface EventHeroProps {
  eventId: string;
  title: string;
  organizerName: string;
  type: string;
  location: string | null;
  startDate: Date;
  endDate: Date;
  status: "draft" | "published" | "cancelled" | "archived";
}

export function EventHero({
  eventId,
  title,
  organizerName,
  type,
  location,
  startDate,
  endDate,
  status,
}: EventHeroProps) {
  return (
    <div className="relative">
      {/* Background decorative elements */}
      <div className="pointer-events-none absolute -left-20 -top-20 size-80 rounded-full bg-gradient-to-br from-primary/20 via-chart-2/10 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-0 size-64 rounded-full bg-gradient-to-bl from-chart-3/15 via-chart-4/10 to-transparent blur-3xl" />

      <div className="relative">
        {/* Breadcrumb / Navigation */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Link
              href="/events"
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              Events
            </Link>
            <span className="text-muted-foreground/50">/</span>
            <span className="text-foreground font-medium">{title}</span>
          </div>
          <div className="flex gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className={cn(
                "gap-2 border-border/50",
                "hover:border-primary/50 hover:bg-primary/5"
              )}
            >
              <Link href={`/events/${eventId}/calender`}>
                <IconCalendarEvent className="size-4" />
                View Schedule
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              className={cn(
                "gap-2",
                "bg-gradient-to-r from-primary to-chart-2",
                "hover:from-primary/90 hover:to-chart-2/90"
              )}
            >
              <Link href="/events">
                <IconArrowLeft className="size-4" />
                All Events
              </Link>
            </Button>
          </div>
        </div>

        {/* Hero Card */}
        <div
          className={cn(
            "relative overflow-hidden rounded-3xl border border-border/50",
            "bg-gradient-to-br from-card via-card to-card/80",
            status === "cancelled" && "border-destructive/30"
          )}
        >
          {/* Pattern overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
              backgroundSize: "24px 24px",
            }}
          />

          {/* Accent strip at top */}
          <div
            className={cn(
              "absolute left-0 right-0 top-0 h-1",
              status === "cancelled"
                ? "bg-gradient-to-r from-destructive via-destructive/50 to-destructive"
                : "bg-gradient-to-r from-primary via-chart-2 to-chart-3"
            )}
          />

          <div className="relative p-8 sm:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              {/* Left content */}
              <div className="space-y-4">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={cn(
                      "capitalize",
                      "bg-primary/10 text-primary border-primary/20"
                    )}
                  >
                    <IconSparkles className="mr-1 size-3" />
                    {type.replaceAll("_", " ")}
                  </Badge>
                  {status === "cancelled" && (
                    <Badge
                      variant="destructive"
                      className="bg-destructive/10 text-destructive border-destructive/20"
                    >
                      Cancelled
                    </Badge>
                  )}
                </div>

                {/* Title */}
                <h1
                  className={cn(
                    "font-display text-3xl font-bold tracking-tight",
                    "text-foreground sm:text-4xl lg:text-5xl"
                  )}
                >
                  {title}
                </h1>

                {/* Organizer */}
                <p className="text-muted-foreground text-lg">{organizerName}</p>

                {/* Meta info */}
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  {location && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                        <IconMapPin className="size-4 text-primary" />
                      </div>
                      <span>{location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-chart-2/10">
                      <IconCalendar className="size-4 text-chart-2" />
                    </div>
                    <span>
                      {formatDateFull(startDate)} &mdash;{" "}
                      {formatDateFull(endDate)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right content - Time display */}
              <div
                className={cn(
                  "hidden shrink-0 lg:block",
                  "rounded-2xl border border-border/50 bg-muted/30 p-6"
                )}
              >
                <div className="text-center">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Starts at
                  </p>
                  <p className="font-display text-4xl font-bold text-primary">
                    {formatTime(startDate)}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatDateFull(startDate)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
