import EventTypePageClient from "./_components/EventTypePage";

// Map URL eventType to database eventType
function mapEventType(
  urlType: string,
):
  | "congress"
  | "seminar"
  | "workshop"
  | "scientific_meeting"
  | "conference"
  | "symposium" {
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

  const mapped = mapping[urlType];
  if (!mapped) {
    throw new Error(`Invalid event type: ${urlType}`);
  }
  return mapped;
}

export default async function EventTypePage({
  params,
}: {
  params: { eventType: string };
}) {
  const { eventType: eventTypeParam } = await params;
  const eventType = mapEventType(eventTypeParam);

  return (
    <EventTypePageClient
      eventType={eventType}
      eventTypeParam={eventTypeParam}
    />
  );
}
