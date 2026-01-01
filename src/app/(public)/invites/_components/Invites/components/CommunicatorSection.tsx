import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CommunicatorMembershipCard } from "./CommunicatorMembershipCard";
import type { CommunicatorAssignment } from "../types";

interface CommunicatorSectionProps {
  assignments: CommunicatorAssignment[];
}

export function CommunicatorSection({ assignments }: CommunicatorSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Communicator Roles</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {assignments.length === 0 ? (
          <div className="text-muted-foreground text-sm">
            No communicator assignments.
          </div>
        ) : (
          assignments.map((assignment) => (
            <CommunicatorMembershipCard
              key={`communicator-${assignment.id}`}
              assignment={assignment}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}

// Backwards compatibility alias
export { CommunicatorSection as CommitteeSection };
