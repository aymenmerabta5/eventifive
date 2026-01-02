"use client";

import EventCard from "./EventCard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  IconArrowRight,
  IconBuildingBank,
  IconSchool,
  IconTool,
  IconFlask,
  IconMicrophone,
  IconMessage,
} from "@tabler/icons-react";
import type { Route } from "next";
import type { Event } from "@/server/db/schema";
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

export interface EventRowProps {
  events: EventCardData[] | readonly EventCardData[];
  title: string;
  description: string;
  route: Route | string;
  eventType?: string;
}

const typeIcons: Record<string, typeof IconBuildingBank> = {
  congress: IconBuildingBank,
  seminar: IconSchool,
  workshop: IconTool,
  scientific_meeting: IconFlask,
  conference: IconMicrophone,
  symposium: IconMessage,
};

export default function EventRow({
  events,
  title,
  description,
  route,
  eventType,
}: EventRowProps) {
  const Icon = (eventType && typeIcons[eventType]) || IconBuildingBank;

  return (
    <section className="relative">
      {/* Section header */}
      <header className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="from-primary to-primary/80 shadow-primary/20 flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg">
              <Icon className="text-primary-foreground size-6" />
            </div>

            {/* Text */}
            <div className="space-y-1">
              <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
                {title}
              </h2>
              <p className="text-muted-foreground max-w-prose text-sm leading-relaxed">
                {description}
              </p>
            </div>
          </div>

          <Button
            asChild
            variant="ghost"
            className={cn(
              "group w-fit gap-2 self-start font-semibold sm:self-auto",
              "hover:bg-primary/10 hover:text-primary",
            )}
          >
            <Link href={route as Route}>
              <span>View all</span>
              <IconArrowRight
                aria-hidden="true"
                className="size-4 opacity-70 transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </Link>
          </Button>
        </div>

        {/* Separator line */}
        <div className="from-border via-border/50 mt-6 h-px bg-gradient-to-r to-transparent" />
      </header>

      {/* Event cards grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </section>
  );
}
