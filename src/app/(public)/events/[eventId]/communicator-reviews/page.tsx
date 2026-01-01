import { CommunicatorReviews } from "./_components/CommunicatorReviews";

interface PageProps {
  params: Promise<{ eventId: string }>;
}

export default async function CommunicatorReviewsPage({ params }: PageProps) {
  const { eventId } = await params;

  return <CommunicatorReviews eventId={eventId} />;
}
