import { CommunicatorReviews } from "./_components/CommunicatorReviews";

interface PageProps {
  params: Promise<{ eventType: string; eventId: string }>;
}

export default async function CommunicatorReviewsPage({ params }: PageProps) {
  const { eventId, eventType } = await params;

  return <CommunicatorReviews eventId={eventId} eventType={eventType} />;
}
