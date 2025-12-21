import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { STATUS_STYLES } from "../constants";
import type { SpeakerInvite, InviteStatus } from "../types";

interface SpeakerInviteCardProps {
  invite: SpeakerInvite;
  onAccept: (eventId: string) => void;
  onReject: (eventId: string) => void;
  isDisabled: boolean;
}

export function SpeakerInviteCard({
  invite,
  onAccept,
  onReject,
  isDisabled,
}: SpeakerInviteCardProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-md border p-3",
        STATUS_STYLES[invite.status as InviteStatus],
      )}
    >
      <div className="space-y-1">
        <div className="text-sm font-medium">Speaker</div>
        <div className="text-muted-foreground text-xs">
          Event: <span className="font-medium">{invite.eventTitle}</span>
        </div>
        <div className="text-muted-foreground text-xs">
          Status: {invite.status}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {invite.status === "pending" && (
          <>
            <Button
              variant="outline"
              disabled={isDisabled}
              onClick={() => onAccept(invite.eventId)}
            >
              Accept
            </Button>
            <Button
              variant="destructive"
              disabled={isDisabled}
              onClick={() => onReject(invite.eventId)}
            >
              Reject
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
