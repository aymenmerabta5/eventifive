import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Calendar, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlreadySubmittedStateProps {
  existingProposal: {
    id: string;
    title: string;
    status: string;
    submittedAt: Date | null;
  };
}

export function AlreadySubmittedState({
  existingProposal,
}: AlreadySubmittedStateProps) {
  const formatDate = (date: Date | null) => {
    if (!date) return "Unknown date";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="animate-in fade-in slide-in-from-bottom-4 text-center duration-700">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
          <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Proposal Already Submitted
          </h1>
          <p className="text-muted-foreground mx-auto max-w-lg text-lg">
            You have already submitted a workshop proposal for this event. You
            can only submit one proposal per event.
          </p>
        </div>

        {/* Proposal Details Card */}
        <Card
          className={cn(
            "animate-in fade-in slide-in-from-bottom-6 fill-mode-backwards duration-700 [animation-delay:200ms]",
            "border-border/50 relative overflow-hidden",
            "from-card via-card to-card/80 bg-gradient-to-b",
            "shadow-primary/5 shadow-xl",
            "backdrop-blur-sm",
          )}
        >
          {/* Decorative top gradient line */}
          <div className="via-primary/50 absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent" />

          {/* Subtle corner accent */}
          <div className="bg-primary/5 absolute -top-24 -right-24 h-48 w-48 rounded-full blur-2xl" />

          <CardContent className="relative p-6 sm:p-8 lg:p-10">
            <div className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                  <FileText className="h-4 w-4" />
                  Workshop Title
                </div>
                <p className="text-lg font-semibold">{existingProposal.title}</p>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4">
                <div className="via-border h-px flex-1 bg-gradient-to-r from-transparent to-transparent" />
                <div className="bg-primary/30 h-1.5 w-1.5 rounded-full" />
                <div className="via-border h-px flex-1 bg-gradient-to-l from-transparent to-transparent" />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                  <CheckCircle2 className="h-4 w-4" />
                  Status
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1.5 text-sm font-medium text-amber-600 dark:text-amber-400">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
                  {existingProposal.status === "pending"
                    ? "Pending Review"
                    : existingProposal.status}
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4">
                <div className="via-border h-px flex-1 bg-gradient-to-r from-transparent to-transparent" />
                <div className="bg-primary/30 h-1.5 w-1.5 rounded-full" />
                <div className="via-border h-px flex-1 bg-gradient-to-l from-transparent to-transparent" />
              </div>

              {/* Submission Date */}
              <div className="space-y-2">
                <div className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                  <Calendar className="h-4 w-4" />
                  Submitted On
                </div>
                <p className="text-foreground/80">
                  {formatDate(existingProposal.submittedAt)}
                </p>
              </div>
            </div>

            {/* Info box */}
            <div className="border-border/40 bg-muted/30 mt-6 rounded-lg border p-4">
              <p className="text-muted-foreground text-sm">
                Your proposal is currently being reviewed by the event
                organizers. You will be notified via email once a decision has
                been made. If you need to make changes to your submission,
                please contact the event organizers directly.
              </p>
            </div>
          </CardContent>

          {/* Decorative bottom gradient line */}
          <div className="via-primary/30 absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent to-transparent" />
        </Card>

        {/* Footer text */}
        <p className="animate-in fade-in fill-mode-backwards text-muted-foreground text-center text-xs duration-700 [animation-delay:400ms]">
          Need help? Contact our support team for assistance with your
          submission.
        </p>
      </div>
    </div>
  );
}
