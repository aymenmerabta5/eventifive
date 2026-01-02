"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import {
  IconFileText,
  IconCalendarEvent,
  IconExternalLink,
  IconChevronDown,
  IconMessageCircle,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { STATUS_CONFIG } from "../constants";
import { formatDate, formatSubmissionType } from "../utils";
import type { SubmissionApplication } from "../types";

interface SubmissionCardProps {
  application: SubmissionApplication;
}

export function SubmissionCard({ application }: SubmissionCardProps) {
  const [showFeedback, setShowFeedback] = useState(false);

  const statusInfo = STATUS_CONFIG[application.status];
  const StatusIcon = statusInfo.icon;
  const hasFeedback =
    application.reviewerFeedback && application.reviewerFeedback.length > 0;

  return (
    <div
      className={cn(
        "group border-border/50 relative overflow-hidden rounded-2xl border transition-all duration-300",
        "bg-card hover:border-border",
        "hover:shadow-primary/5 hover:-translate-y-0.5 hover:shadow-lg",
        application.status === "accepted" &&
          "border-emerald-500/30 ring-2 ring-emerald-500/20",
      )}
    >
      {/* Status indicator line */}
      <div
        className={cn(
          "absolute top-0 right-0 left-0 h-1",
          application.status === "accepted" &&
            "bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-500",
          application.status === "rejected" &&
            "bg-gradient-to-r from-red-500 via-red-400 to-red-500",
          application.status === "draft" && "bg-muted",
        )}
      />

      <div className="p-5 pt-6">
        {/* Header: Status & Type */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <Badge
            variant="outline"
            className={cn("gap-1.5 font-medium", statusInfo.className)}
          >
            <StatusIcon className="size-3.5" />
            {statusInfo.label}
          </Badge>
          <Badge variant="secondary" className="gap-1 text-xs">
            <IconFileText className="size-3" />
            {formatSubmissionType(application.submissionType)}
          </Badge>
        </div>

        {/* Application Title & Abstract */}
        <div className="mb-4 space-y-1">
          <h3 className="group-hover:text-primary line-clamp-2 text-lg leading-tight font-semibold transition-colors">
            {application.title}
          </h3>
          {application.abstract && (
            <p className="text-muted-foreground line-clamp-2 text-sm">
              {application.abstract}
            </p>
          )}
        </div>

        {/* Event Info */}
        <div className="mb-5 space-y-2.5">
          <div className="flex items-center gap-2.5 text-sm">
            <div className="bg-primary/10 flex size-8 items-center justify-center rounded-lg">
              <IconCalendarEvent className="text-primary size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{application.event.title}</p>
              <p className="text-muted-foreground text-xs">
                {formatDate(application.event.startDate)} –{" "}
                {formatDate(application.event.endDate)}
              </p>
            </div>
          </div>

          {application.submittedAt && (
            <p className="text-muted-foreground pl-10 text-xs">
              Submitted {formatDate(application.submittedAt)}
            </p>
          )}
        </div>

        {/* Reviewer Feedback Toggle */}
        {hasFeedback && (
          <ReviewerFeedbackSection
            feedback={application.reviewerFeedback!}
            isOpen={showFeedback}
            onToggle={() => setShowFeedback(!showFeedback)}
          />
        )}

        {/* Action Button */}
        <Button
          size="sm"
          variant="outline"
          className="group-hover:bg-primary group-hover:text-primary-foreground w-full gap-2 transition-all group-hover:border-transparent"
          asChild
        >
          <Link href={`/events/${application.event.id}` as Route}>
            <IconExternalLink className="size-4" />
            View Event
          </Link>
        </Button>
      </div>
    </div>
  );
}

// Internal sub-component for reviewer feedback
interface ReviewerFeedbackSectionProps {
  feedback: NonNullable<SubmissionApplication["reviewerFeedback"]>;
  isOpen: boolean;
  onToggle: () => void;
}

function ReviewerFeedbackSection({
  feedback,
  isOpen,
  onToggle,
}: ReviewerFeedbackSectionProps) {
  return (
    <div className="mb-4">
      <button
        onClick={onToggle}
        className="text-primary flex items-center gap-2 text-sm hover:underline"
      >
        <IconMessageCircle className="size-4" />
        {isOpen ? "Hide" : "Show"} Reviewer Feedback ({feedback.length})
        <IconChevronDown
          className={cn("size-4 transition-transform", isOpen && "rotate-180")}
        />
      </button>

      {isOpen && (
        <div className="mt-3 space-y-2">
          {feedback.map((item, index) => (
            <div
              key={index}
              className="bg-muted/50 border-border/50 rounded-xl border p-3 text-sm"
            >
              <div className="mb-1 flex items-center gap-2">
                <span className="font-medium">Reviewer {index + 1}</span>
                {item.recommendation && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      item.recommendation === "accept"
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
                        : "border-red-500/20 bg-red-500/10 text-red-600",
                    )}
                  >
                    {item.recommendation === "accept" ? "Accept" : "Reject"}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">
                {item.comment || "No comment provided."}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
