import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CommitteeMembershipCard } from "./CommitteeMembershipCard";
import type { CommitteeAssignment } from "../types";

interface CommitteeSectionProps {
	assignments: CommitteeAssignment[];
}

export function CommitteeSection({ assignments }: CommitteeSectionProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-lg">Committee memberships</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				{assignments.length === 0 ? (
					<div className="text-muted-foreground text-sm">No committee memberships.</div>
				) : (
					assignments.map((assignment) => (
						<CommitteeMembershipCard
							key={`committee-${assignment.id}`}
							assignment={assignment}
						/>
					))
				)}
			</CardContent>
		</Card>
	);
}
