"use client";

import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, Users, User } from "lucide-react";
import { REQUIRED_REVIEWERS } from "../constants";
import { checkEventReadiness, getStatusBadgeVariant } from "../utils";
import type { InvitesData } from "../types";

interface ReviewStepProps {
  invitesData: InvitesData | undefined;
  isLoading: boolean;
}

export function ReviewStep({ invitesData, isLoading }: ReviewStepProps) {
  const readiness = checkEventReadiness(
    invitesData?.speaker ?? null,
    invitesData?.reviewers ?? []
  );

  if (isLoading) {
    return (
      <div className="text-muted-foreground text-sm">Loading review data...</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Event Readiness */}
      <div className="rounded-lg border p-4">
        <div className="text-sm font-medium">Event Readiness</div>
        <div className="text-muted-foreground mt-1 text-xs">
          Your event can start when the speaker and all reviewers accept.
        </div>

        <div className="mt-4 space-y-3">
          {/* Speaker Status */}
          <div className="flex items-center justify-between rounded-md border p-3">
            <div className="flex items-center gap-2">
              <User className="size-4" />
              <span className="text-sm">Speaker</span>
            </div>
            <div className="flex items-center gap-2">
              {!readiness.hasSpeaker ? (
                <>
                  <XCircle className="size-4 text-destructive" />
                  <span className="text-sm text-destructive">Not invited</span>
                </>
              ) : readiness.speakerAccepted ? (
                <>
                  <CheckCircle2 className="size-4 text-green-600" />
                  <span className="text-sm text-green-600">Accepted</span>
                </>
              ) : (
                <>
                  <Clock className="size-4 text-yellow-600" />
                  <span className="text-sm text-yellow-600">Pending</span>
                </>
              )}
            </div>
          </div>

          {/* Reviewers Status */}
          <div className="flex items-center justify-between rounded-md border p-3">
            <div className="flex items-center gap-2">
              <Users className="size-4" />
              <span className="text-sm">Reviewers</span>
            </div>
            <div className="flex items-center gap-2">
              {readiness.reviewersAccepted === REQUIRED_REVIEWERS ? (
                <>
                  <CheckCircle2 className="size-4 text-green-600" />
                  <span className="text-sm text-green-600">
                    {readiness.reviewersAccepted}/{REQUIRED_REVIEWERS} Accepted
                  </span>
                </>
              ) : readiness.reviewerCount < REQUIRED_REVIEWERS ? (
                <>
                  <XCircle className="size-4 text-destructive" />
                  <span className="text-sm text-destructive">
                    {readiness.reviewerCount}/{REQUIRED_REVIEWERS} Invited
                  </span>
                </>
              ) : (
                <>
                  <Clock className="size-4 text-yellow-600" />
                  <span className="text-sm text-yellow-600">
                    {readiness.reviewersAccepted}/{REQUIRED_REVIEWERS} Accepted
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Overall Status */}
          <div className="mt-4 rounded-md border-2 p-4">
            <div className="flex items-center justify-center gap-2">
              {readiness.isReady ? (
                <>
                  <CheckCircle2 className="size-6 text-green-600" />
                  <span className="text-lg font-medium text-green-600">
                    Event Ready to Start
                  </span>
                </>
              ) : (
                <>
                  <Clock className="size-6 text-yellow-600" />
                  <span className="text-lg font-medium text-yellow-600">
                    Waiting for Acceptances
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Speaker Details */}
      <div className="rounded-lg border p-4">
        <div className="text-sm font-medium">Speaker</div>
        <div className="mt-3 space-y-2">
          {invitesData?.speaker ? (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3">
              <div className="text-sm">
                <span className="font-medium">
                  {invitesData.speaker.userName || invitesData.speaker.userEmail}
                </span>
                {invitesData.speaker.userName && (
                  <span className="text-muted-foreground ml-1">
                    ({invitesData.speaker.userEmail})
                  </span>
                )}
                {invitesData.speaker.affiliation && (
                  <span className="text-muted-foreground ml-2">
                    - {invitesData.speaker.affiliation}
                  </span>
                )}
              </div>
              <Badge variant={getStatusBadgeVariant(invitesData.speaker.status)}>
                {invitesData.speaker.status}
              </Badge>
            </div>
          ) : (
            <div className="text-muted-foreground text-sm">
              No speaker invited yet.
            </div>
          )}
        </div>
      </div>

      {/* Reviewers Details */}
      <div className="rounded-lg border p-4">
        <div className="text-sm font-medium">
          Reviewers ({invitesData?.reviewers.length ?? 0}/{REQUIRED_REVIEWERS})
        </div>
        <div className="mt-3 space-y-2">
          {invitesData?.reviewers.length === 0 ? (
            <div className="text-muted-foreground text-sm">
              No reviewers invited yet.
            </div>
          ) : (
            invitesData?.reviewers.map((reviewer) => (
              <div
                key={reviewer.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3"
              >
                <div className="text-sm">
                  <span className="font-medium">
                    {reviewer.userName || reviewer.userEmail}
                  </span>
                  {reviewer.userName && (
                    <span className="text-muted-foreground ml-1">
                      ({reviewer.userEmail})
                    </span>
                  )}
                </div>
                <Badge variant={getStatusBadgeVariant(reviewer.status)}>
                  {reviewer.status}
                </Badge>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Committee Details */}
      <div className="rounded-lg border p-4">
        <div className="text-sm font-medium">
          Committee Members ({invitesData?.committee.length ?? 0})
        </div>
        <div className="mt-3 space-y-2">
          {invitesData?.committee.length === 0 ? (
            <div className="text-muted-foreground text-sm">
              No committee members added yet.
            </div>
          ) : (
            invitesData?.committee.map((member) => (
              <div
                key={member.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3"
              >
                <div className="text-sm">
                  <span className="font-medium">
                    {member.userName || member.userEmail}
                  </span>
                  {member.userName && (
                    <span className="text-muted-foreground ml-1">
                      ({member.userEmail})
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
