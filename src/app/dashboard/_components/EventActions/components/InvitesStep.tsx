"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Trash2, UserPlus, Users } from "lucide-react";
import { REQUIRED_REVIEWERS } from "../constants";
import { getStatusBadgeVariant } from "../utils";
import type { InvitesData } from "../types";
import type { UseMutationResult } from "@tanstack/react-query";

interface InvitesStepProps {
  eventId: string;
  eventType: string;
  invitesData: InvitesData | undefined;
  isLoading: boolean;
  inviteSpeakerMutation: UseMutationResult<
    { ok: true },
    Error,
    { eventId: string; email: string; affiliation?: string }
  >;
  inviteReviewerMutation: UseMutationResult<
    { ok: true },
    Error,
    { eventId: string; email: string }
  >;
  removeSpeakerMutation: UseMutationResult<
    { ok: true },
    Error,
    { eventId: string; inviteId: number }
  >;
  removeReviewerMutation: UseMutationResult<
    { ok: true },
    Error,
    { eventId: string; inviteId: number }
  >;
}

export function InvitesStep({
  eventId,
  eventType,
  invitesData,
  isLoading,
  inviteSpeakerMutation,
  inviteReviewerMutation,
  removeSpeakerMutation,
  removeReviewerMutation,
}: InvitesStepProps) {
  const [speakerEmail, setSpeakerEmail] = useState("");
  const [speakerAffiliation, setSpeakerAffiliation] = useState("");
  const [reviewerEmail, setReviewerEmail] = useState("");

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

  const speakerCount = invitesData?.speakers.length ?? 0;
  const reviewerCount = invitesData?.reviewers.length ?? 0;
  const canAddReviewer = reviewerCount < REQUIRED_REVIEWERS;

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {isLoading && (
        <div className="text-muted-foreground text-sm">Loading invites...</div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {/* Speakers Section */}
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <UserPlus className="size-4" />
            Speakers ({speakerCount})
          </div>
          <div className="text-muted-foreground mt-1 text-xs">
            Invite speakers for your event. At least one must accept the
            invitation.
          </div>

          <div className="mt-4 space-y-3">
            {invitesData?.speakers.map((speaker) => (
              <div key={speaker.id} className="rounded-md border p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-medium">
                      {speaker.userName || speaker.userEmail}
                    </div>
                    {speaker.userName && (
                      <div className="text-muted-foreground text-xs">
                        {speaker.userEmail}
                      </div>
                    )}
                    {speaker.affiliation && (
                      <div className="text-muted-foreground text-xs">
                        {speaker.affiliation}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusBadgeVariant(speaker.status)}>
                      {speaker.status}
                    </Badge>
                    {speaker.status !== "accepted" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          removeSpeakerMutation.mutate({
                            eventId,
                            inviteId: speaker.id,
                          })
                        }
                        disabled={removeSpeakerMutation.isPending}
                      >
                        <Trash2 className="text-destructive size-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Add Speaker Form - always visible */}
            <div className="space-y-2 pt-2">
              <Label>Add Speaker</Label>
              <div className="space-y-2">
                <Input
                  placeholder="speaker@email.com"
                  type="email"
                  value={speakerEmail}
                  onChange={(e) => setSpeakerEmail(e.target.value)}
                  disabled={inviteSpeakerMutation.isPending}
                />
                <Input
                  placeholder="Affiliation (optional)"
                  value={speakerAffiliation}
                  onChange={(e) => setSpeakerAffiliation(e.target.value)}
                  disabled={inviteSpeakerMutation.isPending}
                />
                <Button
                  className="w-full"
                  onClick={handleInviteSpeaker}
                  disabled={inviteSpeakerMutation.isPending}
                >
                  Invite Speaker
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Reviewers Section */}
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Users className="size-4" />
            Reviewers ({reviewerCount}/{REQUIRED_REVIEWERS})
          </div>
          <div className="text-muted-foreground mt-1 text-xs">
            Invite {REQUIRED_REVIEWERS} reviewers. All must accept for the event
            to start.
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
                        <Trash2 className="text-destructive size-4" />
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
    </div>
  );
}
