"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  IconClock,
  IconCalendarEvent,
  IconArrowLeft,
} from "@tabler/icons-react";
import Link from "next/link";
import { formatRelative } from "date-fns";

interface WorkshopPendingViewProps {
  workshopTitle: string;
  eventTitle: string;
  proposedAt: Date;
}

export function WorkshopPendingView({
  workshopTitle,
  eventTitle,
  proposedAt,
}: WorkshopPendingViewProps) {
  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="animate-in fade-in slide-in-from-bottom-4 text-center duration-700">
          <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-2xl bg-amber-500/10">
            <IconClock className="size-10 text-amber-500" />
          </div>
          <h1 className="font-display text-foreground text-3xl font-bold">
            Proposal Under Review
          </h1>
          <p className="text-muted-foreground mt-2">
            Your workshop proposal is being reviewed by the organizers
          </p>
        </div>

        {/* Main card */}
        <Card
          className={cn(
            "animate-in fade-in slide-in-from-bottom-6 fill-mode-backwards duration-700 [animation-delay:200ms]",
            "border-border/50 relative overflow-hidden",
            "from-card via-card to-card/80 bg-gradient-to-b",
            "shadow-xl shadow-amber-500/5",
          )}
        >
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
          <div className="absolute -top-24 -right-24 size-48 rounded-full bg-amber-500/5 blur-2xl" />

          <CardContent className="relative p-6 sm:p-8">
            <div className="space-y-6">
              {/* Workshop details */}
              <div className="border-border/50 rounded-xl border bg-amber-500/5 p-6">
                <h2 className="font-display text-lg font-semibold">
                  {workshopTitle}
                </h2>
                <div className="text-muted-foreground mt-2 flex items-center gap-2 text-sm">
                  <IconCalendarEvent className="size-4" />
                  <span>{eventTitle}</span>
                </div>
              </div>

              {/* Status info */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-2 animate-pulse rounded-full bg-amber-500" />
                  <span className="text-sm font-medium text-amber-500">
                    Pending Review
                  </span>
                </div>
                <p className="text-muted-foreground text-sm">
                  Submitted {formatRelative(new Date(proposedAt), new Date())}
                </p>
              </div>

              {/* What to expect */}
              <div className="border-border/50 rounded-xl border p-4">
                <h3 className="mb-2 text-sm font-medium">What happens next?</h3>
                <ul className="text-muted-foreground space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 size-1.5 rounded-full bg-amber-500/60" />
                    The event organizers will review your proposal
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 size-1.5 rounded-full bg-amber-500/60" />
                    You'll receive an email notification once a decision is made
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1.5 size-1.5 rounded-full bg-amber-500/60" />
                    If accepted, you'll be able to upload materials and manage
                    registrations
                  </li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex justify-center pt-4">
                <Button variant="outline" asChild>
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
