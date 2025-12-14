"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Link2, Trash2, UserPlus, Users } from "lucide-react";
import { MAX_SPEAKERS, REQUIRED_REVIEWERS } from "../constants";
import { getStatusBadgeVariant } from "../utils";
import type { InvitesData } from "../types";
import type { UseMutationResult } from "@tanstack/react-query";

interface InvitesStepProps {
  eventId: string;
  eventType: string;
  invitesData: InvitesData | undefined;
  isLoading: boolean;
  inviteSpeakerMutation: UseMutationResult<{ ok: true }, Error, { eventId: string; email: string; affiliation?: string }>;
  inviteReviewerMutation: UseMutationResult<{ ok: true }, Error, { eventId: string; email: string }>;
  inviteCommitteeMutation: UseMutationResult<{ ok: true }, Error, { eventId: string; email: string }>;
  removeSpeakerMutation: UseMutationResult<{ ok: true }, Error, { eventId: string; inviteId: number }>;
  removeReviewerMutation: UseMutationResult<{ ok: true }, Error, { eventId: string; inviteId: number }>;
  removeCommitteeMutation: UseMutationResult<{ ok: true }, Error, { eventId: string; inviteId: number }>;
}

export function InvitesStep({
  eventId,
  eventType,
  invitesData,
  isLoading,
  inviteSpeakerMutation,
  inviteReviewerMutation,
  inviteCommitteeMutation,
  removeSpeakerMutation,
  removeReviewerMutation,
  removeCommitteeMutation,
}: InvitesStepProps) {
  const [speakerEmail, setSpeakerEmail] = useState("");
  const [speakerAffiliation, setSpeakerAffiliation] = useState("");
  const [reviewerEmail, setReviewerEmail] = useState("");
  const [committeeEmail, setCommitteeEmail] = useState("");

  const handleInviteSpeaker = () => {
    if (!speakerEmail.trim()) {
      toast.error("Speaker email is required");
      return;
    }
    inviteSpeakerMutation.mutate({
      eventId,
      email: speakerEmail.trim(),
      affiliation: speakerAffiliation.trim() || undefined,
    });
    setSpeakerEmail("");
    setSpeakerAffiliation("");
  };

  const handleInviteReviewer = () => {
    if (!reviewerEmail.trim()) {
      toast.error("Reviewer email is required");
      return;
    }
    inviteReviewerMutation.mutate({
      eventId,
      email: reviewerEmail.trim(),
    });
    setReviewerEmail("");
  };

  const handleInviteCommittee = () => {
    if (!committeeEmail.trim()) {
      toast.error("Committee member email is required");
      return;
    }
    inviteCommitteeMutation.mutate({
      eventId,
      email: committeeEmail.trim(),
    });
    setCommitteeEmail("");
  };

  const hasSpeaker = !!invitesData?.speaker;
  const reviewerCount = invitesData?.reviewers.length ?? 0;
  const canAddReviewer = reviewerCount < REQUIRED_REVIEWERS;

  return (
    <div className="space-y-6">
      {/* Event Info */}
      <div className="rounded-lg border p-4">
        <div className="text-sm font-medium">Draft event created</div>
        <div className="text-muted-foreground mt-1 text-xs">
          Event ID: <span className="font-mono">{eventId}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (!eventType) {
                toast.error("Event type is missing.");
                return;
              }
              const url = new URL(
                `/events/${eventType}/${eventId}`,
                window.location.origin
              ).toString();
              void navigator.clipboard.writeText(url);
              toast.success("Event page link copied.");
            }}
          >
            <Link2 className="mr-2 size-4" />
            Copy event page link
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-muted-foreground text-sm">Loading invites...</div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {/* Speaker Section */}
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <UserPlus className="size-4" />
            Speaker ({hasSpeaker ? 1 : 0}/{MAX_SPEAKERS})
          </div>
          <div className="text-muted-foreground mt-1 text-xs">
            Invite one speaker for your event. They must accept the invitation.
          </div>

          {hasSpeaker && invitesData?.speaker ? (
            <div className="mt-4 rounded-md border p-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-medium">
                    {invitesData.speaker.userName || invitesData.speaker.userEmail}
                  </div>
                  {invitesData.speaker.userName && (
                    <div className="text-muted-foreground text-xs">
                      {invitesData.speaker.userEmail}
                    </div>
                  )}
                  {invitesData.speaker.affiliation && (
                    <div className="text-muted-foreground text-xs">
                      {invitesData.speaker.affiliation}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusBadgeVariant(invitesData.speaker.status)}>
                    {invitesData.speaker.status}
                  </Badge>
                  {invitesData.speaker.status !== "accepted" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        removeSpeakerMutation.mutate({
                          eventId,
                          inviteId: invitesData.speaker!.id,
                        })
                      }
                      disabled={removeSpeakerMutation.isPending}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  placeholder="speaker@email.com"
                  type="email"
                  value={speakerEmail}
                  onChange={(e) => setSpeakerEmail(e.target.value)}
                  disabled={inviteSpeakerMutation.isPending}
                />
              </div>
              <div className="space-y-2">
                <Label>Affiliation (optional)</Label>
                <Input
                  placeholder="University / Company"
                  value={speakerAffiliation}
                  onChange={(e) => setSpeakerAffiliation(e.target.value)}
                  disabled={inviteSpeakerMutation.isPending}
                />
              </div>
              <Button
                className="w-full"
                onClick={handleInviteSpeaker}
                disabled={inviteSpeakerMutation.isPending}
              >
                Invite Speaker
              </Button>
            </div>
          )}
        </div>

        {/* Reviewers Section */}
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Users className="size-4" />
            Reviewers ({reviewerCount}/{REQUIRED_REVIEWERS})
          </div>
          <div className="text-muted-foreground mt-1 text-xs">
            Invite {REQUIRED_REVIEWERS} reviewers. All must accept for the event to start.
          </div>

          <div className="mt-4 space-y-3">
            {invitesData?.reviewers.map((reviewer) => (
              <div key={reviewer.id} className="rounded-md border p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-medium">
                      {reviewer.userName || reviewer.userEmail}
                    </div>
                    {reviewer.userName && (
                      <div className="text-muted-foreground text-xs">
                        {reviewer.userEmail}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusBadgeVariant(reviewer.status)}>
                      {reviewer.status}
                    </Badge>
                    {reviewer.status !== "accepted" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          removeReviewerMutation.mutate({
                            eventId,
                            inviteId: reviewer.id,
                          })
                        }
                        disabled={removeReviewerMutation.isPending}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {canAddReviewer && (
              <div className="space-y-2 pt-2">
                <Label>Add Reviewer</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="reviewer@email.com"
                    type="email"
                    value={reviewerEmail}
                    onChange={(e) => setReviewerEmail(e.target.value)}
                    disabled={inviteReviewerMutation.isPending}
                  />
                  <Button
                    onClick={handleInviteReviewer}
                    disabled={inviteReviewerMutation.isPending}
                  >
                    Invite
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Committee Section */}
      <div className="rounded-lg border p-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Users className="size-4" />
          Committee Members ({invitesData?.committee.length ?? 0})
        </div>
        <div className="text-muted-foreground mt-1 text-xs">
          Add committee members to help organize your event.
        </div>

        <div className="mt-4 space-y-3">
          {invitesData?.committee.map((member) => (
            <div key={member.id} className="rounded-md border p-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-medium">
                    {member.userName || member.userEmail}
                  </div>
                  {member.userName && (
                    <div className="text-muted-foreground text-xs">
                      {member.userEmail}
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    removeCommitteeMutation.mutate({
                      eventId,
                      inviteId: member.id,
                    })
                  }
                  disabled={removeCommitteeMutation.isPending}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}

          <div className="space-y-2 pt-2">
            <Label>Add Committee Member</Label>
            <div className="flex gap-2">
              <Input
                placeholder="member@email.com"
                type="email"
                value={committeeEmail}
                onChange={(e) => setCommitteeEmail(e.target.value)}
                disabled={inviteCommitteeMutation.isPending}
              />
              <Button
                onClick={handleInviteCommittee}
                disabled={inviteCommitteeMutation.isPending}
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
