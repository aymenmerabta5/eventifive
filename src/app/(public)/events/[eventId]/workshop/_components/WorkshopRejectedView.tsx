"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  IconX,
  IconCalendarEvent,
  IconArrowLeft,
  IconPlus,
} from "@tabler/icons-react";
import Link from "next/link";
import { formatRelative } from "date-fns";
import { useState } from "react";
import { WorkshopForm } from "./WorkshopForm";

interface WorkshopRejectedViewProps {
  workshopTitle: string;
  eventTitle: string;
  rejectionReason: string | null;
  respondedAt: Date | null;
  eventId: string;
  eventType?: string;
}

export function WorkshopRejectedView({
  workshopTitle,
  eventTitle,
  rejectionReason,
  respondedAt,
  eventId,
  eventType,
}: WorkshopRejectedViewProps) {
  const [showNewProposal, setShowNewProposal] = useState(false);

  if (showNewProposal) {
    return (
      <WorkshopForm eventId={eventId} eventType={eventType ?? undefined} />
    );
  }

  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="animate-in fade-in slide-in-from-bottom-4 text-center duration-700">
          <div className="bg-destructive/10 mx-auto mb-4 flex size-20 items-center justify-center rounded-2xl">
            <IconX className="text-destructive size-10" />
          </div>
          <h1 className="font-display text-foreground text-3xl font-bold">
            Proposal Not Accepted
          </h1>
          <p className="text-muted-foreground mt-2">
            Unfortunately, your workshop proposal was not accepted
          </p>
        </div>

        {/* Main card */}
        <Card
          className={cn(
            "animate-in fade-in slide-in-from-bottom-6 fill-mode-backwards duration-700 [animation-delay:200ms]",
            "border-border/50 relative overflow-hidden",
            "from-card via-card to-card/80 bg-gradient-to-b",
            "shadow-destructive/5 shadow-xl",
          )}
        >
          <div className="via-destructive/50 absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent to-transparent" />
          <div className="bg-destructive/5 absolute -top-24 -right-24 size-48 rounded-full blur-2xl" />

          <CardContent className="relative p-6 sm:p-8">
            <div className="space-y-6">
              {/* Workshop details */}
              <div className="border-border/50 bg-destructive/5 rounded-xl border p-6">
                <h2 className="font-display text-lg font-semibold">
                  {workshopTitle}
                </h2>
                <div className="text-muted-foreground mt-2 flex items-center gap-2 text-sm">
                  <IconCalendarEvent className="size-4" />
                  <span>{eventTitle}</span>
                </div>
              </div>

              {/* Rejection reason */}
              {rejectionReason && (
                <div className="border-destructive/30 bg-destructive/5 rounded-xl border p-4">
                  <h3 className="text-destructive mb-2 text-sm font-medium">
                    Reason for rejection
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {rejectionReason}
                  </p>
                </div>
              )}

              {/* Status info */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="bg-destructive size-2 rounded-full" />
                  <span className="text-destructive text-sm font-medium">
                    Rejected
                  </span>
                </div>
                {respondedAt && (
                  <p className="text-muted-foreground text-sm">
                    Decision made{" "}
                    {formatRelative(new Date(respondedAt), new Date())}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col items-center gap-3 pt-4 sm:flex-row sm:justify-center">
                <Button
                  variant="default"
                  onClick={() => setShowNewProposal(true)}
                  className="w-full gap-2 sm:w-auto"
                >
                  <IconPlus className="size-4" />
                  Submit New Proposal
                </Button>
                <Button variant="outline" asChild className="w-full sm:w-auto">
                  <Link href="/registrations" className="gap-2">
                    <IconArrowLeft className="size-4" />
                    Back to My Registrations
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
