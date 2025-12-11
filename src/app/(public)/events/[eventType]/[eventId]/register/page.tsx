import JoinForm from "./_components/JoinForm";

export default async function EventJoinPage({
  params,
}: {
  params: Promise<{ eventType: string; eventId: string }>;
}) {
  const { eventId } = await params;

  return <JoinForm eventId={eventId} />;
}