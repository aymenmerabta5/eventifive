import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { IconCalendar, IconClock, IconMapPin } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import type { Event } from "@/server/db/schema";

type EventCardData = Pick<
  Event,
  "id" | "title" | "type" | "startDate" | "endDate" | "location" | "description"
>;

export interface EventCardProps {
  event: Readonly<EventCardData>;
}

export default function EventCard({ event }: EventCardProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (startDate: Date, endDate: Date) => {
    const start = new Date(startDate).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const end = new Date(endDate).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${start} - ${end}`;
  };

  return (
    <Card
      key={event.id}
      className="group hover:border-primary/50 hover:shadow-primary/10 dark:hover:shadow-primary/20 overflow-hidden border-2 transition-all duration-300 hover:shadow-xl"
    >
      {/* Image Section */}
      <div className="from-primary/20 to-primary/5 relative h-56 w-full overflow-hidden bg-linear-to-br">
        <Image
          src={"/download.jpg"}
          alt={event.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Gradient Overlay */}
        <div className="from-background/80 via-background/20 absolute inset-0 bg-linear-to-t to-transparent" />
        {/* Category Badge */}
        <div className="absolute top-4 right-4">
          <span className="bg-primary/90 text-primary-foreground rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm">
            {event.type.replace("_", " ").toUpperCase()}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <CardHeader className="space-y-3 pb-4">
        <CardTitle className="text-foreground group-hover:text-primary line-clamp-2 text-xl font-bold transition-colors">
          {event.title}
        </CardTitle>

        {/* Event Details */}
        <div className="flex flex-col gap-2.5 pt-2">
          <div className="text-muted-foreground flex items-center gap-2.5 text-sm">
            <IconCalendar className="text-primary size-4 shrink-0" />
            <span className="font-medium">{formatDate(event.startDate)}</span>
          </div>
          <div className="text-muted-foreground flex items-center gap-2.5 text-sm">
            <IconClock className="text-primary size-4 shrink-0" />
            <span className="font-medium">
              {formatTime(event.startDate, event.endDate)}
            </span>
          </div>
          <div className="text-muted-foreground flex items-center gap-2.5 text-sm">
            <IconMapPin className="text-primary size-4 shrink-0" />
            <span className="font-medium">{event.location || "TBA"}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
          {event.description || "No description available"}
        </p>
        <Button
          className="group-hover:bg-primary group-hover:text-primary-foreground w-full font-semibold transition-colors"
          variant="outline"
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}
