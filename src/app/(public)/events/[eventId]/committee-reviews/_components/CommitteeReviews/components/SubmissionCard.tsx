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
import { IconArrowUpRight } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { AssignedSubmission } from "../types";

interface SubmissionCardProps {
  submission: AssignedSubmission;
  typeSlug: string;
  eventId: string;
}

export function SubmissionCard({
  submission,
  typeSlug,
  eventId,
}: SubmissionCardProps) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="gap-2">
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg leading-tight font-semibold">
              {submission.title}
            </CardTitle>
            <CardDescription className="text-sm">
              {submission.submitterName ?? "Unknown submitter"}
              {submission.submitterEmail
                ? ` • ${submission.submitterEmail}`
                : ""}
            </CardDescription>
          </div>
          <Badge variant="outline">
            {submission.fileCount} file{submission.fileCount === 1 ? "" : "s"}
          </Badge>
        </div>
        {submission.submittedAt && (
          <p className="text-muted-foreground text-xs">
            Submitted on {new Date(submission.submittedAt).toLocaleString()}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <Button
          asChild
          variant="outline"
          className={cn(
            "w-full justify-between font-semibold",
            "hover:border-primary/50 hover:text-primary",
          )}
        >
          <Link
            href={
              `/events/${typeSlug}/${eventId}/review?submissionId=${submission.id}` as Route
            }
          >
            <span>Open and review</span>
            <IconArrowUpRight className="h-4 w-4 opacity-70" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
