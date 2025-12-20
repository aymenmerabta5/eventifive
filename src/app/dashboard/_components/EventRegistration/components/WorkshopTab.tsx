"use client";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Presentation } from "lucide-react";
import { WorkshopStatsCards } from "./WorkshopStatsCards";
import { WorkshopSubmissionCard } from "./WorkshopSubmissionCard";
import type { WorkshopSubmission } from "../types";

interface WorkshopTabProps {
	submissions: WorkshopSubmission[];
	isLoading: boolean;
	onAccept: (submissionId: string) => void;
	onReject: (submissionId: string) => void;
	isUpdating: boolean;
}

export function WorkshopTab({
	submissions,
	isLoading,
	onAccept,
	onReject,
	isUpdating,
}: WorkshopTabProps) {
	const stats = {
		total: submissions.length,
		accepted: submissions.filter((s) => s.status === "accepted").length,
		rejected: submissions.filter((s) => s.status === "rejected").length,
		pending: submissions.filter((s) => s.status === "draft").length,
	};

	return (
		<div className="space-y-6">
			<WorkshopStatsCards
				total={stats.total}
				accepted={stats.accepted}
				pending={stats.pending}
				rejected={stats.rejected}
			/>

			<Card>
				<CardHeader className="space-y-1">
					<CardTitle className="text-lg font-semibold">Workshop Applications</CardTitle>
					<CardDescription>
						Facilitator applications for workshop sessions.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoading && (
						<div className="text-muted-foreground text-sm">Loading...</div>
					)}

					{!isLoading && submissions.length === 0 && (
						<div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
							<Presentation className="h-12 w-12 text-muted-foreground/50" />
							<h3 className="mt-4 text-lg font-semibold">No workshop applications</h3>
							<p className="mt-2 text-sm text-muted-foreground">
								Workshop facilitator applications will appear here once they&apos;re submitted.
							</p>
						</div>
					)}

					{submissions.length > 0 && (
						<div className="space-y-4">
							{submissions.map((submission) => (
								<WorkshopSubmissionCard
									key={submission.id}
									submission={submission}
									onAccept={() => onAccept(submission.id)}
									onReject={() => onReject(submission.id)}
									isUpdating={isUpdating}
								/>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
