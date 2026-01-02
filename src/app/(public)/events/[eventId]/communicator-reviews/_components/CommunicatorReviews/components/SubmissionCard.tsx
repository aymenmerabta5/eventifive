import Link from "next/link";
import type { Route } from "next";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  FileStack,
  User,
  Mail,
  Calendar,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AssignedSubmission } from "../types";

interface SubmissionCardProps {
  submission: AssignedSubmission;
  eventId: string;
  index: number;
}

export function SubmissionCard({
  submission,
  eventId,
  index,
}: SubmissionCardProps) {
  const submittedDate = submission.submittedAt
    ? new Date(submission.submittedAt)
    : null;

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300",
        "hover:-translate-y-0.5 hover:shadow-lg",
        "border-border/60 hover:border-primary/30",
        "bg-card/80 backdrop-blur-sm",
      )}
      style={{
        animationDelay: `${index * 50}ms`,
      }}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="from-primary/5 via-primary/3 pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Left accent bar */}
      <div className="bg-primary/50 group-hover:bg-primary absolute top-0 left-0 h-full w-1 transition-colors duration-300" />

      <CardHeader className="gap-3 pb-3 pl-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-1">
            <CardTitle className="text-foreground font-display line-clamp-2 text-lg leading-snug font-semibold tracking-tight sm:text-xl">
              {submission.title}
            </CardTitle>
            <CardDescription className="flex flex-wrap items-center gap-x-4 gap-y-1">
              {submission.submitterName && (
                <span className="text-muted-foreground inline-flex items-center gap-1.5 text-sm">
                  <User className="h-3.5 w-3.5" />
                  {submission.submitterName}
                </span>
              )}
              {submission.submitterEmail && (
                <span className="text-muted-foreground inline-flex items-center gap-1.5 text-sm">
                  <Mail className="h-3.5 w-3.5" />
                  <span className="max-w-[200px] truncate">
                    {submission.submitterEmail}
                  </span>
                </span>
              )}
            </CardDescription>
          </div>

          {/* File count badge */}
          <Badge
            variant="outline"
            className="bg-secondary/50 border-secondary text-secondary-foreground flex-shrink-0 gap-1.5 px-3 py-1.5"
          >
            <FileStack className="h-3.5 w-3.5" />
            {submission.fileCount} file{submission.fileCount === 1 ? "" : "s"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0 pl-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Timestamp */}
          {submittedDate && (
            <div className="text-muted-foreground flex items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {submittedDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span className="bg-border h-3 w-px" />
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {submittedDate.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}

          {/* Review button */}
          <Button
            asChild
            variant="default"
            size="sm"
            className={cn(
              "group/btn gap-2 font-medium transition-all",
              "sm:ml-auto",
            )}
          >
            <Link
              href={
                `/events/${eventId}/review?submissionId=${submission.id}` as Route
              }
            >
              <span>Review Application</span>
              <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
