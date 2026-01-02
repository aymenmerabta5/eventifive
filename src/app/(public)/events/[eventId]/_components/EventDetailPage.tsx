import { notFound } from "next/navigation";
import { client } from "@/utils/orpc";
import { getSession } from "@/server/better-auth/server";
import type { JSONContent } from "@tiptap/react";

import {
  EventHero,
  EventCancellationBanner,
  EventInfoCard,
} from "./EventDetailPage/index";
import { EventImageGallery } from "./EventImageGallery";
import { SessionsSection } from "./SessionsSection";
import { WorkshopsSection } from "./WorkshopsSection";
import { EventRegistrationSection } from "./EventRegistrationSection";
import ParticipationOptions from "./Testimonials";

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
        })
        .catch(() => null)
    : null;

  const now = new Date();
  const eventStart = new Date(event.startDate);
  const delayDate = new Date();
  delayDate.setDate(now.getDate() + 7);
  const isEventMoreThan7DaysAway = eventStart > delayDate;

  return (
    <main className="relative min-h-screen">
      {/* Background pattern */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Background gradients */}
      <div className="from-primary/10 via-chart-2/5 pointer-events-none fixed top-20 -left-40 size-[500px] rounded-full bg-gradient-to-br to-transparent blur-3xl" />
      <div className="from-chart-3/10 via-chart-4/5 pointer-events-none fixed -right-40 bottom-20 size-[500px] rounded-full bg-gradient-to-bl to-transparent blur-3xl" />

      <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Hero Section */}
          <EventHero
            eventId={event.id}
            title={event.title}
            organizerName={event.organizerName}
            type={event.type}
            location={event.location}
            startDate={new Date(event.startDate)}
            endDate={new Date(event.endDate)}
            status={event.status}
          />

          {/* Image Gallery */}
          <EventImageGallery
            imageUrls={event.imageUrls}
            eventTitle={event.title}
          />

          {/* Cancellation Banner */}
          {event.status === "cancelled" && (
            <EventCancellationBanner reason={event.cancellationReason} />
          )}

          {/* Event Info Card */}
          <EventInfoCard
            startDate={new Date(event.startDate)}
            endDate={new Date(event.endDate)}
            type={event.type}
            location={event.location}
            bigDescription={event.bigDescription as JSONContent | string | null}
            smallDescription={event.smallDescription}
            theme={event.theme}
          />

          {/* Sessions Section */}
          <SessionsSection
            eventId={event.id}
            isRegistered={!!registrationStatus?.isRegistered}
          />

          {/* Workshops Section */}
          <WorkshopsSection
            eventId={event.id}
            isEventRegistered={!!registrationStatus?.isRegistered}
            isAuthenticated={!!session?.user}
          />

          {/* Registration Section - only for published events */}
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

          {/* Participation Options - only if event is more than 7 days away */}
          {isEventMoreThan7DaysAway && <ParticipationOptions />}
        </div>
      </div>
    </main>
  );
}
