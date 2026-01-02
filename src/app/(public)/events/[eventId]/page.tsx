import EventDetailPage from "./_components/EventDetailPage";

export default function Page(props: {
  params: Promise<{ eventType: string; eventId: string }>;
}) {
  return <EventDetailPage {...props} />;
}
