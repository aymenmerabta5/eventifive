import { notFound } from "next/navigation";
import { EventTypePage as EventTypePageClient } from "./_components/EventTypePage";

// Map URL eventType to database eventType, tolerating hyphens/underscores and casing
function mapEventType(
  urlType: string,
):
  | "congress"
  | "seminar"
  | "workshop"
  | "scientific_meeting"
  | "conference"
  | "symposium" {
  const slug = urlType.toLowerCase().replace(/_/g, "-");
  const mapping: Record<
    string,
    | "congress"
    | "seminar"
    | "workshop"
    | "scientific_meeting"
    | "conference"
    | "symposium"
  > = {
    congress: "congress",
    seminar: "seminar",
    workshop: "workshop",
    "scientific-meeting": "scientific_meeting",
    conference: "conference",
    symposium: "symposium",
  };

  const mapped = mapping[slug];
  if (!mapped) {
    notFound();
  }
  return mapped;
}

export default async function EventTypePage({
  params,
}: {
  params: Promise<{ eventType: string }>;
}) {
  const { eventType: urlEventType } = await params;
  const eventType = mapEventType(urlEventType);
  if (!eventType) {
    // Signal 404 for unsupported slugs
    notFound();
  }

  return <EventTypePageClient eventType={eventType} />;
}
