import EventCard from "./EventCard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { IconArrowRight } from "@tabler/icons-react";
import type { Route } from "next";
import type { Event } from "@/server/db/schema";

// TEACHING: Extended to include imageUrl for S3 presigned URLs
type EventCardData = Pick<
  Event,
  "id" | "title" | "type" | "startDate" | "endDate" | "location" | "smallDescription"
> & {
  imageUrl?: string | null;
};

export interface EventRowProps {
  events: EventCardData[] | readonly EventCardData[];
  title: string;
  description: string;
  route: Route | string;
}

export default function EventRow({
  events,
  title,
  description,
  route,
}: EventRowProps) {
  return (
    <section className="flex flex-col gap-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h2>
          <p className="text-muted-foreground max-w-prose text-sm leading-relaxed">
            {description}
          </p>
        </div>

        <Button
          asChild
          variant="ghost"
          className="text-foreground group w-fit gap-2 self-start font-semibold sm:self-auto"
        >
          <Link href={route as Route}>
            <span>View all</span>
            <IconArrowRight
              aria-hidden="true"
              className="size-4 opacity-70 transition-transform duration-300 group-hover:translate-x-0.5"
            />
          </Link>
        </Button>
      </header>

      <div className="bg-linear-to-r from-transparent via-border to-transparent h-px" />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </section>
  );
}
