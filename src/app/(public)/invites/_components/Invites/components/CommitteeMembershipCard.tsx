import type { CommitteeAssignment } from "../types";

interface CommitteeMembershipCardProps {
	assignment: CommitteeAssignment;
}

export function CommitteeMembershipCard({ assignment }: CommitteeMembershipCardProps) {
	return (
		<div className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3">
			<div className="space-y-1">
				<div className="text-sm font-medium">Committee Member</div>
				<div className="text-muted-foreground text-xs">
					Event: <span className="font-medium">{assignment.eventTitle}</span>
				</div>
				<div className="text-muted-foreground text-xs">
					Assigned: {assignment.assignedAt.toLocaleDateString()}
				</div>
			</div>
		</div>
	);
}
