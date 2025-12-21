import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReviewerInviteCard } from "./ReviewerInviteCard";
import type { ReviewerInvite } from "../types";

interface ReviewerSectionProps {
  invites: ReviewerInvite[];
  onAccept: (eventId: string) => void;
  onReject: (eventId: string) => void;
  isDisabled: boolean;
}

export function ReviewerSection({
  invites,
  onAccept,
  onReject,
  isDisabled,
}: ReviewerSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Reviewer invites</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {invites.length === 0 ? (
          <div className="text-muted-foreground text-sm">
            No reviewer invites.
          </div>
        ) : (
          invites.map((invite) => (
            <ReviewerInviteCard
              key={`reviewer-${invite.id}`}
              invite={invite}
              onAccept={onAccept}
              onReject={onReject}
              isDisabled={isDisabled}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
}
