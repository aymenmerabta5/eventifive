import { notFound } from "next/navigation";
import { Review } from "./_components/Review";

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

  return <Review eventId={eventId} submissionId={submissionId} />;
}
