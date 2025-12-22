"use client";

import { CheckCircle2, XCircle, Clock, Users, User } from "lucide-react";
import { REQUIRED_REVIEWERS } from "../constants";
import { checkEventReadiness } from "../utils";
import type { InvitesData } from "../types";

interface ReviewStepProps {
  invitesData: InvitesData | undefined;
  isLoading: boolean;
}

export function ReviewStep({ invitesData, isLoading }: ReviewStepProps) {
  const readiness = checkEventReadiness(
    invitesData?.speakers ?? [],
    invitesData?.reviewers ?? [],
  );

  if (isLoading) {
    return (
      <div className="text-muted-foreground text-sm">
        Loading review data...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Event Readiness */}
      <div className="rounded-lg border p-4">
        <div className="text-sm font-medium">Event Readiness</div>
        <div className="text-muted-foreground mt-1 text-xs">
          Your event can start when at least one speaker and all reviewers
          accept.
        </div>

        <div className="mt-4 space-y-3">
          {/* Speakers Status */}
          <div className="flex items-center justify-between rounded-md border p-3">
            <div className="flex items-center gap-2">
              <User className="size-4" />
              <span className="text-sm">Speakers</span>
            </div>
            <div className="flex items-center gap-2">
              {readiness.speakerCount === 0 ? (
                <>
                  <XCircle className="text-destructive size-4" />
                  <span className="text-destructive text-sm">Not invited</span>
                </>
              ) : readiness.speakersAccepted >= 1 ? (
                <>
                  <CheckCircle2 className="size-4 text-green-600" />
                  <span className="text-sm text-green-600">
                    {readiness.speakersAccepted}/{readiness.speakerCount}{" "}
                    Accepted
                  </span>
                </>
              ) : (
                <>
                  <Clock className="size-4 text-yellow-600" />
                  <span className="text-sm text-yellow-600">
                    {readiness.speakersAccepted}/{readiness.speakerCount}{" "}
                    Accepted
                  </span>
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
                  <XCircle className="text-destructive size-4" />
                  <span className="text-destructive text-sm">
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
    </div>
  );
}
