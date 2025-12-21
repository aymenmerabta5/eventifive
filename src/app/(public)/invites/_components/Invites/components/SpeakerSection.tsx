import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SpeakerInviteCard } from "./SpeakerInviteCard";
import type { SpeakerInvite } from "../types";

interface SpeakerSectionProps {
  invites: SpeakerInvite[];
  onAccept: (eventId: string) => void;
  onReject: (eventId: string) => void;
  isDisabled: boolean;
}

export function SpeakerSection({
  invites,
  onAccept,
  onReject,
  isDisabled,
}: SpeakerSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Speaker invites</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {invites.length === 0 ? (
          <div className="text-muted-foreground text-sm">
            No speaker invites.
          </div>
        ) : (
          invites.map((invite) => (
            <SpeakerInviteCard
              key={`speaker-${invite.id}`}
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
