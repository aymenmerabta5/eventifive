"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function EventApprovalsCard({ eventId }: { eventId: string }) {
	const router = useRouter();

	const invitesQuery = useQuery(
		orpc.events.invites.listForEvent.queryOptions({
			input: { eventId },
		}),
	);

	const approveCommitteeMutation = useMutation(
		orpc.events.invites.approveCommittee.mutationOptions({
			onSuccess: async () => {
				toast.success("Approved");
				await invitesQuery.refetch();
			},
			onError: (error) => toast.error(error.message || "Failed to approve"),
		}),
	);

	const committee = invitesQuery.data?.committee ?? [];
	const reviewers = committee.filter((c) => c.type === "reviewer");
	const workshopFacilitators = committee.filter((c) => c.type === "workshop_facilitator");

	return (
		<Card className="shadow-lg">
			<CardHeader>
				<CardTitle className="text-2xl font-bold md:text-3xl">Event approvals</CardTitle>
				<CardDescription>
					Manage pending/accepted/approved committee invites for this event.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="rounded-lg border p-4">
					<div className="text-sm font-medium">Event</div>
					<div className="text-muted-foreground mt-1 text-xs">
						Event ID: <span className="font-mono">{eventId}</span>
					</div>
					<div className="mt-3 flex flex-wrap gap-2">
						<Button
							variant="outline"
							onClick={() => router.push("/dashboard?view=my-events")}
						>
							Back to my events
						</Button>
					</div>
				</div>

				<div className="rounded-lg border p-4">
					<div className="text-sm font-medium">Reviewer committee</div>
					<div className="mt-3 space-y-2">
						{invitesQuery.isPending ? (
							<div className="text-muted-foreground text-sm">Loading…</div>
						) : null}
						{!invitesQuery.isPending && reviewers.length === 0 ? (
							<div className="text-muted-foreground text-sm">No reviewer invites.</div>
						) : null}

						{reviewers.map((c) => (
							<div
								key={`reviewer-${c.id}`}
								className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3"
							>
								<div className="text-sm">
									<span className="font-medium">{c.userEmail}</span>{" "}
									<span className="text-muted-foreground">({c.status})</span>
								</div>
								<Button
									variant="outline"
									disabled={c.status !== "accepted" || approveCommitteeMutation.isPending}
									onClick={() =>
										approveCommitteeMutation.mutate({ eventId, committeeId: c.id })
									}
								>
									Approve accepted
								</Button>
							</div>
						))}
					</div>
				</div>

				<div className="rounded-lg border p-4">
					<div className="text-sm font-medium">Workshop-facilitator committee</div>
					<div className="mt-3 space-y-2">
						{!invitesQuery.isPending && workshopFacilitators.length === 0 ? (
							<div className="text-muted-foreground text-sm">
								No workshop-facilitator invites.
							</div>
						) : null}

						{workshopFacilitators.map((c) => (
							<div
								key={`wf-${c.id}`}
								className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3"
							>
								<div className="text-sm">
									<span className="font-medium">{c.userEmail}</span>{" "}
									<span className="text-muted-foreground">({c.status})</span>
								</div>
								<Button
									variant="outline"
									disabled={c.status !== "accepted" || approveCommitteeMutation.isPending}
									onClick={() =>
										approveCommitteeMutation.mutate({ eventId, committeeId: c.id })
									}
								>
									Approve accepted
								</Button>
							</div>
						))}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}



