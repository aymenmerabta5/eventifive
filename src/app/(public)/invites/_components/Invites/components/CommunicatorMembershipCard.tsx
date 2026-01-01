import type { CommunicatorAssignment } from "../types";

interface CommunicatorMembershipCardProps {
  assignment: CommunicatorAssignment;
}

export function CommunicatorMembershipCard({
  assignment,
}: CommunicatorMembershipCardProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3">
      <div className="space-y-1">
        <div className="text-sm font-medium">Communicator</div>
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

// Backwards compatibility alias
export { CommunicatorMembershipCard as CommitteeMembershipCard };
