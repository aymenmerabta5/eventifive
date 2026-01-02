import Link from "next/link";
import type { Route } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileSearch, CheckCircle, ArrowLeft } from "lucide-react";

interface ReviewHeaderProps {
  eventId: string;
  isReadOnly: boolean;
  submitterName?: string | null;
}

export function ReviewHeader({
  eventId,
  isReadOnly,
  submitterName,
}: ReviewHeaderProps) {
  return (
    <header className="space-y-6">
      {/* Back navigation */}
      <div className="flex items-center justify-between">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground -ml-2 gap-2"
        >
          <Link href={`/events/${eventId}/communicator-reviews` as Route}>
            <ArrowLeft className="h-4 w-4" />
            Back to applications
          </Link>
        </Button>

        {isReadOnly && (
          <Badge
            variant="secondary"
            className="bg-primary/10 text-primary border-primary/20 gap-1.5 border"
          >
            <CheckCircle className="h-3.5 w-3.5" />
            Review Submitted
          </Badge>
        )}
      </div>

      {/* Main header content */}
      <div className="space-y-4 text-center">
        {/* Top badge */}
        <div className="flex justify-center">
          <Badge
            variant="secondary"
            className="border-primary/20 bg-primary/10 text-primary inline-flex items-center gap-2 border px-4 py-2 font-medium backdrop-blur-sm"
          >
            <FileSearch className="h-4 w-4" />
            <span>Review Application</span>
          </Badge>
        </div>

        {/* Main heading */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <div className="bg-primary/30 h-32 w-96 rounded-full blur-3xl" />
          </div>
          <h1 className="font-display relative text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            <span className="from-foreground via-foreground to-foreground/70 bg-gradient-to-br bg-clip-text text-transparent">
              Submission
            </span>{" "}
            <span className="text-primary">Review</span>
          </h1>
        </div>

        {/* Description */}
        <p className="text-muted-foreground mx-auto max-w-xl text-base leading-relaxed">
          {isReadOnly ? (
            <>
              This review has been submitted{" "}
              {submitterName && (
                <>
                  by{" "}
                  <span className="text-foreground font-medium">
                    {submitterName}
                  </span>
                </>
              )}{" "}
              and is now read-only.
            </>
          ) : (
            <>
              Examine the submission details, download attachments, and provide
              your{" "}
              <span className="text-foreground font-medium">
                recommendation
              </span>
              .
            </>
          )}
        </p>

        {/* Decorative line */}
        <div className="flex items-center justify-center gap-4 pt-2">
          <div className="bg-border h-px w-16" />
          <div className="bg-primary/50 h-1.5 w-1.5 rounded-full" />
          <div className="bg-border h-px w-16" />
        </div>
      </div>
    </header>
  );
}
