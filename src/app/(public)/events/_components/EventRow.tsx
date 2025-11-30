import EventCard from "./EventCard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Route } from "next";

export interface Event {
  id: string;
  title: string;
  type:
    | "congress"
    | "seminar"
    | "workshop"
    | "scientific_meeting"
    | "conference"
    | "symposium";
  startDate: Date;
  endDate: Date;
  location: string | null;
  description: string | null;
}

export interface EventRowProps {
  events: Event[] | readonly Event[];
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
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="flex items-center justify-between gap-4">
        <p className="text-muted-foreground text-sm">{description}</p>
        <Link href={route as Route}>
          <Button variant="link" className="text-lg font-bold">View All</Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
