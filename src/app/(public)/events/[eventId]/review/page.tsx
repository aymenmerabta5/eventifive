import { notFound } from "next/navigation";
import ReviewPage from "./_components/ReviewPage";

export default async function ReviewPageRoute({
	params,
	searchParams,
}: {
	params: Promise<{ eventType: string; eventId: string }>;
	searchParams: Promise<{ submissionId?: string }>;
}) {
	const { eventId } = await params;
	const { submissionId } = await searchParams;

	if (!submissionId) {
		notFound();
	}

	return <ReviewPage eventId={eventId} submissionId={submissionId} />;
}
