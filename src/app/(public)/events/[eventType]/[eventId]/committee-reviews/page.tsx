import AssignedCommitteeReviewsClient from "./_components/AssignedCommitteeReviewsClient";

interface PageProps {
	params: Promise<{ eventType: string; eventId: string }>;
}

export default async function CommitteeReviewsPage({ params }: PageProps) {
	const { eventId, eventType } = await params;

	return <AssignedCommitteeReviewsClient eventId={eventId} eventType={eventType} />;
}

