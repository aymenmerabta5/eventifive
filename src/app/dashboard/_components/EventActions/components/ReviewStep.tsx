"use client";

import {
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  User,
  Sparkles,
  AlertTriangle,
  Rocket,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { FormSection } from "./FormSection";
import { REQUIRED_REVIEWERS } from "../constants";
import { checkEventReadiness } from "../utils";
import type { InvitesData } from "../types";

interface ReviewStepProps {
  invitesData: InvitesData | undefined;
  isLoading: boolean;
}

interface StatusCardProps {
  icon: React.ReactNode;
  title: string;
  status: "success" | "warning" | "error" | "pending";
  count?: string;
  description?: string;
}

function StatusCard({
  icon,
  title,
  status,
  count,
  description,
}: StatusCardProps) {
  const statusStyles = {
    success: {
      bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
      border: "border-emerald-500/30",
      icon: "text-emerald-600 dark:text-emerald-400",
      text: "text-emerald-700 dark:text-emerald-300",
    },
    warning: {
      bg: "bg-amber-500/10 dark:bg-amber-500/20",
      border: "border-amber-500/30",
      icon: "text-amber-600 dark:text-amber-400",
      text: "text-amber-700 dark:text-amber-300",
    },
    error: {
      bg: "bg-destructive/10",
      border: "border-destructive/30",
      icon: "text-destructive",
      text: "text-destructive",
    },
    pending: {
      bg: "bg-muted/50",
      border: "border-border",
      icon: "text-muted-foreground",
      text: "text-muted-foreground",
    },
  };

  const styles = statusStyles[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative overflow-hidden rounded-xl border p-4 transition-all",
        styles.bg,
        styles.border,
      )}
    >
      {/* Subtle gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent dark:from-white/5" />

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex size-10 items-center justify-center rounded-xl",
              status === "success" && "bg-emerald-500/20",
              status === "warning" && "bg-amber-500/20",
              status === "error" && "bg-destructive/20",
              status === "pending" && "bg-muted",
            )}
          >
            <div className={styles.icon}>{icon}</div>
          </div>
          <div>
            <div className="text-foreground font-medium">{title}</div>
            {description && (
              <div className="text-muted-foreground text-xs">{description}</div>
            )}
          </div>
        </div>

        {count && (
          <div className={cn("flex items-center gap-2", styles.text)}>
            {status === "success" && <CheckCircle2 className="size-5" />}
            {status === "warning" && <Clock className="size-5" />}
            {status === "error" && <XCircle className="size-5" />}
            <span className="font-semibold">{count}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function ReviewStep({ invitesData, isLoading }: ReviewStepProps) {
  const readiness = checkEventReadiness(
    invitesData?.speakers ?? [],
    invitesData?.reviewers ?? [],
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground flex items-center gap-2">
          <div className="border-primary size-4 animate-spin rounded-full border-2 border-t-transparent" />
          <span>Loading review data...</span>
        </div>
      </div>
    );
  }

  // Determine speaker status
  const getSpeakerStatus = (): "success" | "warning" | "error" => {
    if (readiness.speakerCount === 0) return "error";
    if (readiness.speakersAccepted >= 1) return "success";
    return "warning";
  };

  // Determine reviewer status
  const getReviewerStatus = (): "success" | "warning" | "error" => {
    if (readiness.reviewerCount < REQUIRED_REVIEWERS) return "error";
    if (readiness.reviewersAccepted === REQUIRED_REVIEWERS) return "success";
    return "warning";
  };

  const speakerStatus = getSpeakerStatus();
  const reviewerStatus = getReviewerStatus();

  return (
    <div className="space-y-6">
      {/* Event Readiness Dashboard */}
      <FormSection
        icon={<Sparkles className="size-5" />}
        title="Event Readiness"
        description="Your event can start when requirements are met"
        variant="highlight"
      >
        <div className="space-y-4">
          {/* Status Cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Speakers Status */}
            <StatusCard
              icon={<User className="size-5" />}
              title="Speakers"
              status={speakerStatus}
              count={
                speakerStatus === "error"
                  ? "Not invited"
                  : `${readiness.speakersAccepted}/${readiness.speakerCount} accepted`
              }
              description={
                speakerStatus === "success"
                  ? "At least one speaker confirmed"
                  : speakerStatus === "warning"
                    ? "Waiting for acceptance"
                    : "Invite at least one speaker"
              }
            />

            {/* Reviewers Status */}
            <StatusCard
              icon={<Users className="size-5" />}
              title="Reviewers"
              status={reviewerStatus}
              count={
                reviewerStatus === "error"
                  ? `${readiness.reviewerCount}/${REQUIRED_REVIEWERS} invited`
                  : `${readiness.reviewersAccepted}/${REQUIRED_REVIEWERS} accepted`
              }
              description={
                reviewerStatus === "success"
                  ? "All reviewers confirmed"
                  : reviewerStatus === "warning"
                    ? "Waiting for acceptance"
                    : `Invite ${REQUIRED_REVIEWERS} reviewers`
              }
            />
          </div>

          {/* Overall Status Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className={cn(
              "relative overflow-hidden rounded-2xl border-2 p-6",
              readiness.isReady
                ? "border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent"
                : "border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent",
            )}
          >
            {/* Decorative background elements */}
            <div className="from-primary/10 pointer-events-none absolute -top-8 -right-8 size-32 rounded-full bg-gradient-to-br to-transparent blur-2xl" />
            <div className="from-primary/10 pointer-events-none absolute -bottom-8 -left-8 size-32 rounded-full bg-gradient-to-tr to-transparent blur-2xl" />

            <div className="relative flex flex-col items-center justify-center gap-4 text-center sm:flex-row sm:text-left">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className={cn(
                  "flex size-16 items-center justify-center rounded-2xl shadow-lg",
                  readiness.isReady
                    ? "bg-emerald-500 text-white shadow-emerald-500/30"
                    : "bg-amber-500 text-white shadow-amber-500/30",
                )}
              >
                {readiness.isReady ? (
                  <Rocket className="size-8" />
                ) : (
                  <AlertTriangle className="size-8" />
                )}
              </motion.div>

              <div className="flex-1">
                <h3
                  className={cn(
                    "text-xl font-bold",
                    readiness.isReady
                      ? "text-emerald-700 dark:text-emerald-300"
                      : "text-amber-700 dark:text-amber-300",
                  )}
                >
                  {readiness.isReady
                    ? "Event Ready to Launch!"
                    : "Almost There..."}
                </h3>
                <p
                  className={cn(
                    "mt-1 text-sm",
                    readiness.isReady
                      ? "text-emerald-600/80 dark:text-emerald-400/80"
                      : "text-amber-600/80 dark:text-amber-400/80",
                  )}
                >
                  {readiness.isReady
                    ? "All requirements are met. You can publish your event and start accepting registrations."
                    : "Complete the requirements above to unlock your event."}
                </p>
              </div>

              {/* Progress ring for non-ready state */}
              {!readiness.isReady && (
                <div className="relative">
                  <svg className="size-16" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-amber-500/20"
                    />
                    <motion.circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeLinecap="round"
                      className="text-amber-500"
                      strokeDasharray={251.2}
                      initial={{ strokeDashoffset: 251.2 }}
                      animate={{
                        strokeDashoffset:
                          251.2 *
                          (1 -
                            ((speakerStatus === "success" ? 1 : 0) +
                              (reviewerStatus === "success" ? 1 : 0)) /
                              2),
                      }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                      {Math.round(
                        ((speakerStatus === "success" ? 1 : 0) +
                          (reviewerStatus === "success" ? 1 : 0)) *
                          50,
                      )}
                      %
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Checklist */}
          <div className="bg-muted/30 ring-border/50 space-y-2 rounded-xl p-4 ring-1">
            <h4 className="text-foreground text-sm font-medium">
              Requirements Checklist
            </h4>
            <div className="space-y-2">
              <ChecklistItem
                checked={readiness.speakersAccepted >= 1}
                label="At least one speaker has accepted"
              />
              <ChecklistItem
                checked={readiness.reviewerCount >= REQUIRED_REVIEWERS}
                label={`${REQUIRED_REVIEWERS} reviewers invited`}
              />
              <ChecklistItem
                checked={readiness.reviewersAccepted === REQUIRED_REVIEWERS}
                label={`All ${REQUIRED_REVIEWERS} reviewers have accepted`}
              />
            </div>
          </div>
        </div>
      </FormSection>
    </div>
  );
}

function ChecklistItem({
  checked,
  label,
}: {
  checked: boolean;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "flex size-5 items-center justify-center rounded-full transition-colors",
          checked
            ? "bg-emerald-500 text-white"
            : "border-border bg-background border-2",
        )}
      >
        {checked && <CheckCircle2 className="size-3" />}
      </div>
      <span
        className={cn(
          "text-sm transition-colors",
          checked ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {label}
      </span>
    </div>
  );
}
