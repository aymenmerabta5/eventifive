"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import type { Route } from "next";
import { cn } from "@/lib/utils";

export function InvitesClient() {
	const invitesQuery = useQuery(orpc.events.listMyInvites.queryOptions());

	const getStatusStyles = (status: string) => {
		switch (status) {
			case "accepted":
				return "border-green-500 bg-green-50 dark:bg-green-900/20";
			case "rejected":
				return "border-red-500 bg-red-50 dark:bg-red-900/20";
			default:
				return "border-border";
		}
	};

	const acceptSpeaker = useMutation(
		orpc.events.acceptSpeaker.mutationOptions({
			onSuccess: async () => {
				await invitesQuery.refetch();
				toast.success("Speaker invite accepted");
			},
			onError: (e: Error) => toast.error(e.message || "Failed to accept speaker invite"),
		}),
	);

	const rejectSpeaker = useMutation(
		orpc.events.rejectSpeaker.mutationOptions({
			onSuccess: async () => {
				await invitesQuery.refetch();
				toast.success("Speaker invite rejected");
			},
			onError: (e: Error) => toast.error(e.message || "Failed to reject speaker invite"),
		}),
	);

	const acceptReviewer = useMutation(
		orpc.events.acceptReviewer.mutationOptions({
			onSuccess: async () => {
				await invitesQuery.refetch();
				toast.success("Reviewer invite accepted");
			},
			onError: (e: Error) => toast.error(e.message || "Failed to accept reviewer invite"),
		}),
	);

	const rejectReviewer = useMutation(
		orpc.events.rejectReviewer.mutationOptions({
			onSuccess: async () => {
				await invitesQuery.refetch();
				toast.success("Reviewer invite rejected");
			},
			onError: (e: Error) => toast.error(e.message || "Failed to reject reviewer invite"),
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

					{!invitesQuery.isPending && (invitesQuery.data?.committeeAssignments.length ?? 0) === 0 ? (
						<div className="text-muted-foreground text-sm">No committee memberships.</div>
					) : null}

					{invitesQuery.data?.committeeAssignments.map((inv) => (
						<div
							key={`committee-${inv.id}`}
							className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3"
						>
							<div className="space-y-1">
								<div className="text-sm font-medium">Committee Member</div>
								<div className="text-muted-foreground text-xs">
									Event: <span className="font-medium">{inv.eventTitle}</span>
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

					{!invitesQuery.isPending && (invitesQuery.data?.speakerInvites.length ?? 0) === 0 ? (
						<div className="text-muted-foreground text-sm">No speaker invites.</div>
					) : null}

					{invitesQuery.data?.speakerInvites.map((inv) => (
						<div
							key={`speaker-${inv.id}`}
							className={cn(
								"flex flex-wrap items-center justify-between gap-3 rounded-md border p-3",
								getStatusStyles(inv.status),
							)}
						>
							<div className="space-y-1">
								<div className="text-sm font-medium">Speaker</div>
								<div className="text-muted-foreground text-xs">
									Event: <span className="font-medium">{inv.eventTitle}</span>
								</div>
								<div className="text-muted-foreground text-xs">Status: {inv.status}</div>
							</div>
							<div className="flex items-center gap-2">
								{inv.status === "pending" ? (
									<>
										<Button
											variant="outline"
											disabled={inv.status !== "pending" || acceptSpeaker.isPending || rejectSpeaker.isPending}
											onClick={() => {
												acceptSpeaker.mutate({ eventId: inv.eventId });
											}}
										>
											Accept
										</Button>
										<Button
											variant="destructive"
											disabled={inv.status !== "pending" || acceptSpeaker.isPending || rejectSpeaker.isPending}
											onClick={() => {
												rejectSpeaker.mutate({ eventId: inv.eventId });
											}}
										>
											Reject
										</Button>
									</>
								) : null}
							</div>
						</div>
					))}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Reviewer invites</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					{invitesQuery.isPending ? (
						<div className="text-muted-foreground text-sm">Loading…</div>
					) : null}

					{!invitesQuery.isPending && (invitesQuery.data?.reviewerInvites.length ?? 0) === 0 ? (
						<div className="text-muted-foreground text-sm">No reviewer invites.</div>
					) : null}

					{invitesQuery.data?.reviewerInvites.map((inv) => (
						<div
							key={`reviewer-${inv.id}`}
							className={cn(
								"flex flex-wrap items-center justify-between gap-3 rounded-md border p-3",
								getStatusStyles(inv.status),
							)}
						>
							<div className="space-y-1">
								<div className="text-sm font-medium">Reviewer</div>
								<div className="text-muted-foreground text-xs">
									Event: <span className="font-medium">{inv.eventTitle}</span>
								</div>
								<div className="text-muted-foreground text-xs">Status: {inv.status}</div>
							</div>
							<div className="flex flex-wrap items-center gap-2">
								{inv.status === "pending" ? (
									<>
										<Button
											variant="outline"
											disabled={
												inv.status !== "pending" ||
												acceptReviewer.isPending ||
												rejectReviewer.isPending
											}
											onClick={() => {
												acceptReviewer.mutate({ eventId: inv.eventId });
											}}
										>
											Accept
										</Button>
										<Button
											variant="destructive"
											disabled={
												inv.status !== "pending" ||
												acceptReviewer.isPending ||
												rejectReviewer.isPending
											}
											onClick={() => {
												rejectReviewer.mutate({ eventId: inv.eventId });
											}}
										>
											Reject
										</Button>
									</>
								) : null}
								{inv.status === "accepted" && inv.eventType ? (
									<Button
										asChild
										variant="ghost"
										className={cn(
											"text-primary hover:text-primary",
											"underline-offset-4 hover:underline"
										)}
									>
										<Link
											href={
												`/events/${inv.eventType.replaceAll("_", "-")}/${inv.eventId}/committee-reviews` as Route
											}
										>
											View committee registrations
										</Link>
									</Button>
								) : null}
							</div>
						</div>
					))}
				</CardContent>
			</Card>
		</div>
	);
}
