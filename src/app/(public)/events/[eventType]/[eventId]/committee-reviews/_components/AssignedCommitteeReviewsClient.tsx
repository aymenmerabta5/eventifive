"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { orpc } from "@/utils/orpc";
import { authClient } from "@/lib/auth-client";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { IconArrowUpRight } from "@tabler/icons-react";
import { FileText, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Route } from "next";

interface AssignedCommitteeReviewsClientProps {
	eventId: string;
	eventType: string;
}

export default function AssignedCommitteeReviewsClient({
	eventId,
	eventType,
}: AssignedCommitteeReviewsClientProps) {
	const { data: session } = authClient.useSession();
	const { data, isLoading, isError, error } = useQuery({
		...orpc.submissions.listAssigned.queryOptions({
			input: { eventId },
		}),
		enabled: !!session?.user,
	});

	const submissions = data?.submissions ?? [];

	const typeSlug = useMemo(() => eventType.replaceAll("_", "-"), [eventType]);

	if (!session?.user) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center px-4">
				<Card className="w-full max-w-3xl">
					<CardHeader>
						<CardTitle>Sign in required</CardTitle>
						<CardDescription>
							You need to be signed in as a reviewer to see committee registrations.
						</CardDescription>
					</CardHeader>
				</Card>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center px-4">
				<Card className="w-full max-w-3xl">
					<CardHeader>
						<Skeleton className="h-8 w-72" />
						<Skeleton className="h-4 w-96" />
					</CardHeader>
					<CardContent className="space-y-4">
						{Array.from({ length: 3 }).map((_, idx) => (
							<div key={idx} className="space-y-2 rounded-lg border p-4">
								<Skeleton className="h-5 w-2/3" />
								<Skeleton className="h-4 w-1/2" />
								<Skeleton className="h-4 w-1/3" />
							</div>
						))}
					</CardContent>
				</Card>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center px-4">
				<Card className="w-full max-w-3xl">
					<CardHeader>
						<CardTitle>Could not load committee registrations</CardTitle>
						<CardDescription>
							{error instanceof Error ? error.message : "Please try again later."}
						</CardDescription>
					</CardHeader>
				</Card>
			</div>
		);
	}

	return (
		<div className="flex min-h-[60vh] items-center justify-center px-4 py-10">
			<div className="w-full max-w-4xl space-y-6">
				<div className="space-y-3 text-center">
					<Badge variant="secondary" className="px-4 py-1.5 inline-flex items-center gap-2">
						<Users className="h-4 w-4" />
						Committee registrations assigned to you
					</Badge>
					<h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
						Review committee applications
					</h1>
					<p className="mx-auto max-w-2xl text-muted-foreground text-sm">
						You can open each application, review the uploaded documents, and accept or reject it.
					</p>
				</div>

				<Separator />

				{submissions.length === 0 ? (
					<Card className="border-dashed border-muted-foreground/40">
						<CardContent className="flex flex-col items-center justify-center gap-3 py-10 text-center">
							<FileText className="h-8 w-8 text-muted-foreground" />
							<p className="text-sm text-muted-foreground">
								No committee registrations assigned to you yet for this event.
							</p>
						</CardContent>
					</Card>
				) : (
					<div className="space-y-4">
						{submissions.map((submission) => (
							<Card key={submission.id} className="border-border/70 shadow-sm">
								<CardHeader className="gap-2">
									<div className="flex items-center justify-between gap-4">
										<div>
											<CardTitle className="text-lg font-semibold leading-tight">
												{submission.title}
											</CardTitle>
											<CardDescription className="text-sm">
												{submission.submitterName ?? "Unknown submitter"}
												{submission.submitterEmail ? ` • ${submission.submitterEmail}` : ""}
											</CardDescription>
										</div>
										<Badge variant="outline">
											{submission.fileCount} file{submission.fileCount === 1 ? "" : "s"}
										</Badge>
									</div>
									{submission.submittedAt ? (
										<p className="text-xs text-muted-foreground">
											Submitted on {new Date(submission.submittedAt).toLocaleString()}
										</p>
									) : null}
								</CardHeader>
								<CardContent>
									<Button
										asChild
										variant="outline"
										className={cn(
											"w-full justify-between font-semibold",
											"hover:border-primary/50 hover:text-primary"
										)}
									>
										<Link
											href={
												`/events/${typeSlug}/${eventId}/review?submissionId=${submission.id}` as Route
											}
										>
											<span>Open and review</span>
											<IconArrowUpRight className="h-4 w-4 opacity-70" />
										</Link>
									</Button>
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

