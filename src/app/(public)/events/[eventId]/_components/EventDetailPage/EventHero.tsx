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
      <div className="from-primary/20 via-chart-2/10 pointer-events-none absolute -top-20 -left-20 size-80 rounded-full bg-gradient-to-br to-transparent blur-3xl" />
      <div className="from-chart-3/15 via-chart-4/10 pointer-events-none absolute top-0 -right-20 size-64 rounded-full bg-gradient-to-bl to-transparent blur-3xl" />

      <div className="relative">
        {/* Breadcrumb / Navigation */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Link
              href="/events"
              className="text-muted-foreground hover:text-primary transition-colors"
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
                "border-border/50 gap-2",
                "hover:border-primary/50 hover:bg-primary/5",
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
                "from-primary to-chart-2 bg-gradient-to-r",
                "hover:from-primary/90 hover:to-chart-2/90",
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
            "border-border/50 relative overflow-hidden rounded-3xl border",
            "from-card via-card to-card/80 bg-gradient-to-br",
            status === "cancelled" && "border-destructive/30",
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
              "absolute top-0 right-0 left-0 h-1",
              status === "cancelled"
                ? "from-destructive via-destructive/50 to-destructive bg-gradient-to-r"
                : "from-primary via-chart-2 to-chart-3 bg-gradient-to-r",
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
                      "bg-primary/10 text-primary border-primary/20",
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
                    "text-foreground sm:text-4xl lg:text-5xl",
                  )}
                >
                  {title}
                </h1>

                {/* Organizer */}
                <p className="text-muted-foreground text-lg">{organizerName}</p>

                {/* Meta info */}
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  {location && (
                    <div className="text-muted-foreground flex items-center gap-2">
                      <div className="bg-primary/10 flex size-8 items-center justify-center rounded-lg">
                        <IconMapPin className="text-primary size-4" />
                      </div>
                      <span>{location}</span>
                    </div>
                  )}
                  <div className="text-muted-foreground flex items-center gap-2">
                    <div className="bg-chart-2/10 flex size-8 items-center justify-center rounded-lg">
                      <IconCalendar className="text-chart-2 size-4" />
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
                  "border-border/50 bg-muted/30 rounded-2xl border p-6",
                )}
              >
                <div className="text-center">
                  <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                    Starts at
                  </p>
                  <p className="font-display text-primary text-4xl font-bold">
                    {formatTime(startDate)}
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm">
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
