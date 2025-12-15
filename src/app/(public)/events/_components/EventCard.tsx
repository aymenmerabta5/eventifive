import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  IconArrowUpRight,
  IconCalendar,
  IconClock,
  IconMapPin,
} from "@tabler/icons-react";
import Image from "next/image";
import type { Event } from "@/server/db/schema";
import Link from "next/link";
import type { Route } from "next";

type EventCardData = Pick<
  Event,
  "id" | "title" | "type" | "startDate" | "endDate" | "location" | "smallDescription"
> & {
  imageUrl?: string | null;
};

export interface EventCardProps {
  event: Readonly<EventCardData>;
}

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
});

function formatDate(date: Date) {
  return dateFormatter.format(new Date(date));
}

function formatTimeRange(startDate: Date, endDate: Date) {
  const start = timeFormatter.format(new Date(startDate));
  const end = timeFormatter.format(new Date(endDate));
  return `${start} – ${end}`;
}

export default function EventCard({ event }: EventCardProps) {
  const now = new Date();
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);

  const weekFromNow = new Date(now);
  weekFromNow.setDate(now.getDate() + 7);
  const showCommitteeReminder = startDate > weekFromNow;

  const typeLabel = event.type.replaceAll("_", " ").toUpperCase();

  const isUpcoming = now < startDate;
  const isLive = now >= startDate && now <= endDate;
  const isEnded = now > endDate;

  const statusLabel = isLive
    ? "Live"
    : isEnded
      ? "Ended"
      : isUpcoming
        ? "Upcoming"
        : "Scheduled";

  const statusClassName = isLive
    ? "border-primary/30 bg-primary/10 text-primary"
    : isEnded
      ? "border-border bg-muted/50 text-muted-foreground"
      : "border-border/60 bg-background/70 text-foreground";

  return (
    <Card
      className="group relative overflow-hidden rounded-2xl border bg-card/60 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10 dark:hover:shadow-primary/15"
    >
      {/* TEACHING: We use the imageUrl from the API if available, otherwise fallback to placeholder */}
      <div className="from-primary/20 to-primary/5 relative aspect-video w-full overflow-hidden bg-linear-to-br">
        <Image
          src={event.imageUrl || "/download.jpg"}
          alt={event.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          unoptimized={!!event.imageUrl}
        />
        <div className="absolute inset-0 bg-transparent dark:bg-linear-to-t dark:from-background/90 dark:via-background/25 dark:to-transparent" />

        <div className="absolute -top-24 -right-24 size-56 rounded-full bg-primary/15 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          <Badge
            variant="secondary"
            className="bg-background/80 text-foreground backdrop-blur supports-backdrop-filter:bg-background/60"
          >
            {typeLabel}
          </Badge>
        </div>

        <div className="absolute top-4 right-4">
          <Badge variant="outline" className={statusClassName}>
            {statusLabel}
          </Badge>
        </div>
      </div>

      <CardHeader className="space-y-2 pb-4">
        <CardTitle className="text-foreground line-clamp-2 text-xl font-semibold tracking-tight">
          <Link
            href={`/events/${event.id}` as Route}
            className="hover:text-primary focus-visible:ring-ring rounded-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            {event.title}
          </Link>
        </CardTitle>

        {showCommitteeReminder && (
          <div className="bg-muted/40 text-muted-foreground rounded-lg border border-border/60 px-3 py-2 text-xs leading-relaxed">
            <span className="text-foreground font-medium">Action needed:</span>{" "}
            submit committee registration.
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        <div className="grid gap-2.5">
          <div className="text-muted-foreground flex items-center gap-2.5 text-sm">
            <IconCalendar aria-hidden="true" className="text-primary size-4 shrink-0" />
            <span className="font-medium">{formatDate(startDate)}</span>
          </div>
          <div className="text-muted-foreground flex items-center gap-2.5 text-sm">
            <IconClock aria-hidden="true" className="text-primary size-4 shrink-0" />
            <span className="font-medium">
              {formatTimeRange(startDate, endDate)}
            </span>
          </div>
          <div className="text-muted-foreground flex items-center gap-2.5 text-sm">
            <IconMapPin aria-hidden="true" className="text-primary size-4 shrink-0" />
            <span className="font-medium">{event.location || "TBA"}</span>
          </div>
        </div>

        <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
          {event.smallDescription || "No description available."}
        </p>
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          asChild
          variant="outline"
          className="group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary/40 w-full justify-between font-semibold transition-colors"
        >
          <Link href={`/events/${event.id}` as Route}>
            <span>View details</span>
            <IconArrowUpRight
              aria-hidden="true"
              className="size-4 opacity-70 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
