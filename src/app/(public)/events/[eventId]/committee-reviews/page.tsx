import { CommitteeReviews } from "./_components/CommitteeReviews";

interface PageProps {
	params: Promise<{ eventType: string; eventId: string }>;
}

export default async function CommitteeReviewsPage({ params }: PageProps) {
	const { eventId, eventType } = await params;

	return <CommitteeReviews eventId={eventId} eventType={eventType} />;
}

