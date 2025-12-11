import JoinForm from "./_components/JoinForm";

export default function EventRegisterPage({
  params,
}: {
  params: { eventType: string; eventId: string };
}) {
  const { eventId } = params;

  return <JoinForm eventId={eventId} />;
}