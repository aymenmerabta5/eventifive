"use client";

import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function EventApprovalsCard({ eventId }: { eventId: string }) {
	const router = useRouter();

	const invitesQuery = useQuery({
		...orpc.events.listInvites.queryOptions({
			input: { eventId },
		}),
	});

	const committee = invitesQuery.data?.committee ?? [];
	const speaker = invitesQuery.data?.speaker;

	return (
		<Card className="shadow-lg">
			<CardHeader>
				<CardTitle className="text-2xl font-bold md:text-3xl">Event team</CardTitle>
				<CardDescription>
					View the committee members and speakers for this event.
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
					<div className="text-sm font-medium">Committee members</div>
					<div className="mt-3 space-y-2">
						{invitesQuery.isPending ? (
							<div className="text-muted-foreground text-sm">Loading…</div>
						) : null}
						{!invitesQuery.isPending && committee.length === 0 ? (
							<div className="text-muted-foreground text-sm">No committee members.</div>
						) : null}

						{committee.map((c) => (
							<div
								key={`committee-${c.id}`}
								className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3"
							>
								<div className="text-sm">
									<span className="font-medium">{c.userName || c.userEmail}</span>
									{c.userName ? (
										<span className="text-muted-foreground ml-1">({c.userEmail})</span>
									) : null}
								</div>
								<div className="text-muted-foreground text-xs">
									Added {new Date(c.assignedAt).toLocaleDateString()}
								</div>
							</div>
						))}
					</div>
				</div>

				<div className="rounded-lg border p-4">
					<div className="text-sm font-medium">Speaker</div>
					<div className="mt-3 space-y-2">
						{invitesQuery.isPending ? (
							<div className="text-muted-foreground text-sm">Loading…</div>
						) : null}
						{!invitesQuery.isPending && !speaker ? (
							<div className="text-muted-foreground text-sm">No speaker assigned.</div>
						) : null}

						{speaker && (
							<div
								key={`speaker-${speaker.id}`}
								className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3"
							>
								<div className="text-sm">
									<span className="font-medium">{speaker.userName || speaker.userEmail}</span>
									{speaker.userName ? (
										<span className="text-muted-foreground ml-1">({speaker.userEmail})</span>
									) : null}
									{speaker.affiliation ? (
										<span className="text-muted-foreground ml-2">• {speaker.affiliation}</span>
									) : null}
								</div>
								<div className="text-xs">
									<span
										className={
											speaker.status === "accepted"
												? "text-green-600"
												: speaker.status === "rejected"
													? "text-red-600"
													: "text-muted-foreground"
										}
									>
										{speaker.status}
									</span>
								</div>
							</div>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
