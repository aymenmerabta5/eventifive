import EventCard from "./EventCard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Route } from "next";

export interface Event {
    id: number;
    title: string;
    category: string;
    date: string;
    time: string;
    location: string;
    description: string;
}

export interface EventRowProps {
    events: Event[] | readonly Event[];
    title: string;
    description: string;
    route: Route | string;
}

export default function EventRow({ events, title, description, route }: EventRowProps) {
    return (
        <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold">{title}</h2>
            <p className="text-muted-foreground">{description}</p>
            <Link href={route as Route}>
                <Button variant="link">View All</Button>
            </Link>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {events.map((event) => (
                    <EventCard key={event.id} event={event} />
                ))}
            </div>
        </div>
    );
}