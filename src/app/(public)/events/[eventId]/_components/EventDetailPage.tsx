import Link from "next/link";
import { notFound } from "next/navigation";
import { client } from "@/utils/orpc";
import {
  IconCalendar,
  IconCalendarEvent,
  IconClock,
  IconMapPin,
  IconTag,
  IconAlertTriangle,
} from "@tabler/icons-react";
import ParticipationOptions from "./Testimonials";
import { EventRegistrationSection } from "./EventRegistrationSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Editor from "@/components/rich-text-editor/Editor";
import type { JSONContent } from "@tiptap/react";
import { EventImageGallery } from "./EventImageGallery";
import { formatDateFull, formatTime } from "@/lib/date";
import { getSession } from "@/server/better-auth/server";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ eventType: string; eventId: string }>;
}) {
  const { eventId } = await params;

  // Fetch event and session in parallel
  const [event, session] = await Promise.all([
    client.events.get({ id: eventId }).catch(() => null),
    getSession(),
  ]);

  if (!event) {
    notFound();
  }

  // Check registration status if user is logged in
  const registrationStatus = session?.user
    ? await client.events
        .getRegistrationStatus({
          eventId,
          userId: session.user.id,
        })
        .catch(() => null)
    : null;

  const bigDescriptionIsRichText =
    typeof event.bigDescription === "object" && event.bigDescription !== null;
  const bigDescriptionAsString =
    typeof event.bigDescription === "string" ? event.bigDescription : null;

  const now = new Date();
  const eventStart = new Date(event.startDate);
  const delayDate = new Date();
  delayDate.setDate(now.getDate() + 7);
  const isEventMoreThan7DaysAway = eventStart > delayDate;

  return (
    <main className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.25)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.25)_1px,transparent_1px)] bg-size-[24px_24px]" />

      <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-muted-foreground text-center sm:text-left">
              {event.organizerName}
            </p>
            <h1 className="text-foreground text-center text-4xl leading-tight font-bold tracking-tight sm:text-left sm:text-5xl">
              Event Details
            </h1>
            <p className="text-muted-foreground text-center text-sm sm:text-left">
              Discover dates, location, and key information about this event.
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" className="group gap-2 rounded-4xl">
              <Link href={`/events/${event.id}/calender`} aria-label="View event schedule">
                <IconCalendarEvent className="size-4" />
                View Schedule
              </Link>
            </Button>
            <Button asChild className="group bg-primary gap-2 rounded-4xl">
              <Link href="/events" aria-label="Back to events list">
                <span
                  aria-hidden
                  className="transition-transform group-hover:-translate-x-0.5"
                >
                  ←
                </span>
                Back to Events
              </Link>
            </Button>
          </div>
        </div>

        {/* Event Image Gallery */}
        <EventImageGallery
          imageUrls={event.imageUrls}
          eventTitle={event.title}
        />

        {/* Cancellation Banner */}
        {event.status === "cancelled" && (
          <Alert variant="destructive" className="mb-6">
            <IconAlertTriangle className="h-5 w-5" />
            <AlertTitle>This event has been cancelled</AlertTitle>
            {event.cancellationReason && (
              <AlertDescription>
                Reason: {event.cancellationReason}
              </AlertDescription>
            )}
          </Alert>
        )}

        <Card className="group overflow-hidden">
          <CardHeader className="bg-card/50 border-b p-6">
            <div className="space-y-3">
              <Badge variant="secondary" className="w-fit capitalize">
                {event.type.replaceAll("_", " ")}
              </Badge>
              <CardTitle className="text-foreground text-2xl leading-tight font-bold tracking-tight sm:text-3xl lg:text-4xl">
                {event.title}
              </CardTitle>
              <div className="text-muted-foreground flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:gap-4">
                <div className="inline-flex items-center gap-2">
                  <IconMapPin className="text-primary size-4" strokeWidth={2} />
                  <span>{event.location ?? "To be announced"}</span>
                </div>
                <div
                  className="bg-border hidden h-4 w-px sm:block"
                  aria-hidden
                />
                <div className="inline-flex items-center gap-2">
                  <IconCalendar
                    className="text-primary size-4"
                    strokeWidth={2}
                  />
                  <span>
                    {formatDateFull(event.startDate)} ·{" "}
                    {formatTime(event.startDate)} —{" "}
                    {formatDateFull(event.endDate)} ·{" "}
                    {formatTime(event.endDate)}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <section aria-labelledby="schedule-heading" className="space-y-4">
              <h2
                id="schedule-heading"
                className="text-muted-foreground text-xs font-semibold tracking-wider uppercase"
              >
                Schedule
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="bg-card rounded-lg border p-4">
                  <div className="text-foreground mb-2 flex items-center gap-2 text-sm font-medium">
                    <IconCalendar
                      className="text-primary size-4"
                      strokeWidth={2}
                    />
                    Start
                  </div>
                  <div className="space-y-1">
                    <p className="text-foreground text-base font-semibold">
                      {formatDateFull(event.startDate)}
                    </p>
                    <p className="text-muted-foreground inline-flex items-center gap-2 text-sm">
                      <IconClock
                        className="text-primary size-4"
                        strokeWidth={2}
                      />
                      {formatTime(event.startDate)}
                    </p>
                  </div>
                </div>

                <div className="bg-card rounded-lg border p-4">
                  <div className="text-foreground mb-2 flex items-center gap-2 text-sm font-medium">
                    <IconCalendar
                      className="text-primary size-4"
                      strokeWidth={2}
                    />
                    End
                  </div>
                  <div className="space-y-1">
                    <p className="text-foreground text-base font-semibold">
                      {formatDateFull(event.endDate)}
                    </p>
                    <p className="text-muted-foreground inline-flex items-center gap-2 text-sm">
                      <IconClock
                        className="text-primary size-4"
                        strokeWidth={2}
                      />
                      {formatTime(event.endDate)}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <div className="bg-border my-6 h-px w-full" aria-hidden />

            <section aria-labelledby="details-heading" className="space-y-4">
              <h2
                id="details-heading"
                className="text-muted-foreground text-xs font-semibold tracking-wider uppercase"
              >
                Details
              </h2>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div className="bg-card rounded-lg border p-4">
                  <dt className="text-foreground mb-2 flex items-center gap-2 text-sm font-medium">
                    <IconTag className="text-primary size-4" strokeWidth={2} />
                    Type
                  </dt>
                  <dd className="text-muted-foreground text-sm capitalize">
                    {event.type.replaceAll("_", " ")}
                  </dd>
                </div>

                <div className="bg-card rounded-lg border p-4">
                  <dt className="text-foreground mb-2 flex items-center gap-2 text-sm font-medium">
                    <IconMapPin
                      className="text-primary size-4"
                      strokeWidth={2}
                    />
                    Location
                  </dt>
                  <dd className="text-muted-foreground text-sm">
                    {event.location ?? "To be announced"}
                  </dd>
                </div>

                <div className="bg-card rounded-lg border p-4 sm:col-span-2">
                  <dt className="text-foreground mb-2 flex items-center gap-2 text-sm font-medium">
                    <IconTag className="text-primary size-4" strokeWidth={2} />
                    Description
                  </dt>
                  <dd className="text-muted-foreground text-sm leading-relaxed">
                    {bigDescriptionIsRichText ? (
                      <Editor
                        value={
                          event.bigDescription as
                            | JSONContent
                            | string
                            | undefined
                        }
                        content={
                          event.bigDescription as JSONContent | undefined
                        }
                        readOnly
                      />
                    ) : bigDescriptionAsString ? (
                      bigDescriptionAsString
                    ) : (
                      (event.smallDescription ?? "No description available.")
                    )}
                  </dd>
                </div>

                {event.theme && (
                  <div className="bg-card rounded-lg border p-4 sm:col-span-2">
                    <dt className="text-foreground mb-2 flex items-center gap-2 text-sm font-medium">
                      <IconTag
                        className="text-primary size-4"
                        strokeWidth={2}
                      />
                      Theme
                    </dt>
                    <dd className="text-muted-foreground text-sm">
                      {event.theme}
                    </dd>
                  </div>
                )}
              </dl>
            </section>
          </CardContent>
        </Card>

        {/* Only show registration section for published events */}
        {event.status === "published" && (
          <EventRegistrationSection
            eventId={event.id}
            priceAmount={event.priceAmount}
            priceCurrency={event.priceCurrency}
            eventTitle={event.title}
            isAuthenticated={!!session?.user}
            registrationStatus={registrationStatus}
          />
        )}

        {isEventMoreThan7DaysAway && <ParticipationOptions />}
      </div>
    </main>
  );
}
