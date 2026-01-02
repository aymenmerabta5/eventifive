import Link from "next/link";
import type { Route } from "next";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { STATUS_STYLES } from "../constants";
import type { ReviewerInvite, InviteStatus } from "../types";

interface ReviewerInviteCardProps {
  invite: ReviewerInvite;
  onAccept: (eventId: string) => void;
  onReject: (eventId: string) => void;
  isDisabled: boolean;
}

export function ReviewerInviteCard({
  invite,
  onAccept,
  onReject,
  isDisabled,
}: ReviewerInviteCardProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-md border p-3",
        STATUS_STYLES[invite.status as InviteStatus],
      )}
    >
      <div className="space-y-1">
        <div className="text-sm font-medium">Reviewer</div>
        <div className="text-muted-foreground text-xs">
          Event: <span className="font-medium">{invite.eventTitle}</span>
        </div>
        <div className="text-muted-foreground text-xs">
          Status: {invite.status}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
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
        {invite.status === "accepted" && invite.eventType && (
          <Button
            asChild
            variant="ghost"
            className={cn(
              "text-primary hover:text-primary",
              "underline-offset-4 hover:underline",
            )}
          >
            <Link
              href={`/events/${invite.eventId}/communicator-reviews` as Route}
            >
              View communicator registrations
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
