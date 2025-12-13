"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function InvitesClient() {
	const invitesQuery = useQuery(orpc.events.listMyInvites.queryOptions());

	const acceptSpeaker = useMutation(
		orpc.events.acceptSpeaker.mutationOptions({
			onSuccess: async () => {
				await invitesQuery.refetch();
				toast.success("Speaker invite accepted");
			},
			onError: (e: Error) => toast.error(e.message || "Failed to accept speaker invite"),
		}),
	);

	return (
		<div className="mx-auto w-full max-w-4xl space-y-6 p-4 md:p-8">
			<h1 className="text-2xl font-bold">Your invites</h1>

			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Committee memberships</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					{invitesQuery.isPending ? (
						<div className="text-muted-foreground text-sm">Loading…</div>
					) : null}

					{!invitesQuery.isPending && (invitesQuery.data?.committee.length ?? 0) === 0 ? (
						<div className="text-muted-foreground text-sm">No committee memberships.</div>
					) : null}

					{invitesQuery.data?.committee.map((inv) => (
						<div
							key={`committee-${inv.id}`}
							className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3"
						>
							<div className="space-y-1">
								<div className="text-sm font-medium">Committee Member</div>
								<div className="text-muted-foreground text-xs">
									Event: <span className="font-mono">{inv.eventId}</span>
								</div>
								<div className="text-muted-foreground text-xs">
									Assigned: {new Date(inv.assignedAt).toLocaleDateString()}
								</div>
							</div>
						</div>
					))}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Speaker invites</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					{invitesQuery.isPending ? (
						<div className="text-muted-foreground text-sm">Loading…</div>
					) : null}

					{!invitesQuery.isPending && (invitesQuery.data?.speakers.length ?? 0) === 0 ? (
						<div className="text-muted-foreground text-sm">No speaker invites.</div>
					) : null}

					{invitesQuery.data?.speakers.map((inv) => (
						<div
							key={`speaker-${inv.id}`}
							className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3"
						>
							<div className="space-y-1">
								<div className="text-sm font-medium">Speaker</div>
								<div className="text-muted-foreground text-xs">
									Event: <span className="font-mono">{inv.eventId}</span>
								</div>
								<div className="text-muted-foreground text-xs">Status: {inv.status}</div>
							</div>
							<Button
								disabled={inv.status !== "pending" || acceptSpeaker.isPending}
								onClick={() => {
									acceptSpeaker.mutate({ eventId: inv.eventId });
								}}
							>
								Accept
							</Button>
						</div>
					))}
				</CardContent>
			</Card>
		</div>
	);
}
