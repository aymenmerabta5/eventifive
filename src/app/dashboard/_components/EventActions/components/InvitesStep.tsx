"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Trash2,
  UserPlus,
  Users,
  Mail,
  Building2,
  Send,
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { FormSection, FormGroup } from "./FormSection";
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

function getStatusStyles(status: string) {
  switch (status) {
    case "accepted":
      return {
        badge:
          "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
        ring: "ring-emerald-500/20",
      };
    case "rejected":
      return {
        badge: "bg-destructive/10 text-destructive border-destructive/20",
        ring: "ring-destructive/20",
      };
    case "pending":
    default:
      return {
        badge:
          "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
        ring: "ring-amber-500/20",
      };
  }
}

interface InviteCardProps {
  name: string;
  email: string;
  affiliation?: string | null;
  status: string;
  onRemove?: () => void;
  isRemoving?: boolean;
}

function InviteCard({
  name,
  email,
  affiliation,
  status,
  onRemove,
  isRemoving,
}: InviteCardProps) {
  const styles = getStatusStyles(status);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={cn(
        "group bg-card relative overflow-hidden rounded-xl border p-4 transition-all hover:shadow-md",
        styles.ring,
      )}
    >
      {/* Status indicator line */}
      <div
        className={cn(
          "absolute top-0 left-0 h-full w-1 transition-all",
          status === "accepted" && "bg-emerald-500",
          status === "rejected" && "bg-destructive",
          status === "pending" && "bg-amber-500",
        )}
      />

      <div className="flex items-start gap-3 pl-2">
        {/* Avatar placeholder */}
        <div className="bg-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-full">
          <UserCircle className="size-6" />
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-foreground truncate font-medium">
              {name || email.split("@")[0]}
            </span>
            <Badge
              variant="outline"
              className={cn("shrink-0 border text-xs capitalize", styles.badge)}
            >
              {status}
            </Badge>
          </div>
          <div className="text-muted-foreground mt-0.5 flex items-center gap-1 text-sm">
            <Mail className="size-3" />
            <span className="truncate">{email}</span>
          </div>
          {affiliation && (
            <div className="text-muted-foreground/80 mt-0.5 flex items-center gap-1 text-xs">
              <Building2 className="size-3" />
              <span className="truncate">{affiliation}</span>
            </div>
          )}
        </div>

        {/* Remove button */}
        {status !== "accepted" && onRemove && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            disabled={isRemoving}
            className="size-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <Trash2 className="text-destructive size-4" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}

interface InviteFormProps {
  placeholder: string;
  showAffiliation?: boolean;
  onSubmit: (email: string, affiliation?: string) => void;
  isSubmitting?: boolean;
}

function InviteForm({
  placeholder,
  showAffiliation = false,
  onSubmit,
  isSubmitting,
}: InviteFormProps) {
  const [email, setEmail] = useState("");
  const [affiliation, setAffiliation] = useState("");

  const handleSubmit = () => {
    if (!email.trim()) return;
    onSubmit(email.trim(), affiliation.trim() || undefined);
    setEmail("");
    setAffiliation("");
  };

  return (
    <div className="bg-muted/30 ring-border/50 space-y-3 rounded-xl p-4 ring-1">
      <div className="text-foreground flex items-center gap-2 text-sm font-medium">
        <Send className="text-primary size-4" />
        Send Invitation
      </div>
      <div className="space-y-2">
        <div className="relative">
          <Mail className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder={placeholder}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            className="h-10 pl-10"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !showAffiliation) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
        </div>
        {showAffiliation && (
          <div className="relative">
            <Building2 className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              placeholder="Organization / University (optional)"
              value={affiliation}
              onChange={(e) => setAffiliation(e.target.value)}
              disabled={isSubmitting}
              className="h-10 pl-10"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
          </div>
        )}
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !email.trim()}
          className="w-full"
        >
          <UserPlus className="mr-2 size-4" />
          {isSubmitting ? "Sending..." : "Send Invite"}
        </Button>
      </div>
    </div>
  );
}

export function InvitesStep({
  eventId,
  invitesData,
  isLoading,
  inviteSpeakerMutation,
  inviteReviewerMutation,
  removeSpeakerMutation,
  removeReviewerMutation,
}: InvitesStepProps) {
  const handleInviteSpeaker = (email: string, affiliation?: string) => {
    inviteSpeakerMutation.mutate({
      eventId,
      email,
      affiliation,
    });
  };

  const handleInviteReviewer = (email: string) => {
    inviteReviewerMutation.mutate({
      eventId,
      email,
    });
  };

  const speakerCount = invitesData?.speakers.length ?? 0;
  const reviewerCount = invitesData?.reviewers.length ?? 0;
  const acceptedSpeakers =
    invitesData?.speakers.filter((s) => s.status === "accepted").length ?? 0;
  const acceptedReviewers =
    invitesData?.reviewers.filter((r) => r.status === "accepted").length ?? 0;
  const canAddReviewer = reviewerCount < REQUIRED_REVIEWERS;

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="text-muted-foreground flex items-center gap-2">
            <div className="border-primary size-4 animate-spin rounded-full border-2 border-t-transparent" />
            <span>Loading invites...</span>
          </div>
        </div>
      )}

      {!isLoading && (
        <FormGroup columns={2}>
          {/* Speakers Section */}
          <FormSection
            icon={<UserPlus className="size-5" />}
            title="Speakers"
            description={`${acceptedSpeakers}/${speakerCount} accepted · At least 1 required`}
          >
            <div className="space-y-4">
              {/* Speaker list */}
              <AnimatePresence mode="popLayout">
                {invitesData?.speakers.map((speaker) => (
                  <InviteCard
                    key={speaker.id}
                    name={speaker.userName || ""}
                    email={speaker.userEmail}
                    affiliation={speaker.affiliation}
                    status={speaker.status}
                    onRemove={() =>
                      removeSpeakerMutation.mutate({
                        eventId,
                        inviteId: speaker.id,
                      })
                    }
                    isRemoving={removeSpeakerMutation.isPending}
                  />
                ))}
              </AnimatePresence>

              {speakerCount === 0 && (
                <div className="border-border/60 flex flex-col items-center justify-center rounded-xl border border-dashed py-8 text-center">
                  <div className="bg-muted flex size-12 items-center justify-center rounded-full">
                    <UserPlus className="text-muted-foreground size-6" />
                  </div>
                  <p className="text-foreground mt-3 text-sm font-medium">
                    No speakers invited yet
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Invite speakers to present at your event
                  </p>
                </div>
              )}

              {/* Invite form */}
              <InviteForm
                placeholder="speaker@email.com"
                showAffiliation
                onSubmit={handleInviteSpeaker}
                isSubmitting={inviteSpeakerMutation.isPending}
              />
            </div>
          </FormSection>

          {/* Reviewers Section */}
          <FormSection
            icon={<Users className="size-5" />}
            title="Reviewers"
            description={`${acceptedReviewers}/${reviewerCount} accepted · ${REQUIRED_REVIEWERS} required`}
          >
            <div className="space-y-4">
              {/* Reviewer list */}
              <AnimatePresence mode="popLayout">
                {invitesData?.reviewers.map((reviewer) => (
                  <InviteCard
                    key={reviewer.id}
                    name={reviewer.userName || ""}
                    email={reviewer.userEmail}
                    status={reviewer.status}
                    onRemove={() =>
                      removeReviewerMutation.mutate({
                        eventId,
                        inviteId: reviewer.id,
                      })
                    }
                    isRemoving={removeReviewerMutation.isPending}
                  />
                ))}
              </AnimatePresence>

              {reviewerCount === 0 && (
                <div className="border-border/60 flex flex-col items-center justify-center rounded-xl border border-dashed py-8 text-center">
                  <div className="bg-muted flex size-12 items-center justify-center rounded-full">
                    <Users className="text-muted-foreground size-6" />
                  </div>
                  <p className="text-foreground mt-3 text-sm font-medium">
                    No reviewers invited yet
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Invite {REQUIRED_REVIEWERS} reviewers for submissions
                  </p>
                </div>
              )}

              {/* Progress indicator */}
              {reviewerCount > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Reviewer slots
                    </span>
                    <span className="font-medium">
                      {reviewerCount}/{REQUIRED_REVIEWERS}
                    </span>
                  </div>
                  <div className="bg-muted h-2 overflow-hidden rounded-full">
                    <motion.div
                      className="bg-primary h-full"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(reviewerCount / REQUIRED_REVIEWERS) * 100}%`,
                      }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}

              {/* Invite form */}
              {canAddReviewer && (
                <InviteForm
                  placeholder="reviewer@email.com"
                  onSubmit={handleInviteReviewer}
                  isSubmitting={inviteReviewerMutation.isPending}
                />
              )}

              {!canAddReviewer && (
                <div className="bg-primary/5 text-primary rounded-xl p-4 text-center text-sm">
                  All reviewer slots filled. Remove a reviewer to add a new one.
                </div>
              )}
            </div>
          </FormSection>
        </FormGroup>
      )}
    </div>
  );
}
