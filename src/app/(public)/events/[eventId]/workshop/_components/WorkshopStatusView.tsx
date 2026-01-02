"use client";

import { useQuery } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { WorkshopForm } from "./WorkshopForm";
import { WorkshopManageView } from "./WorkshopManageView";
import { WorkshopPendingView } from "./WorkshopPendingView";
import { WorkshopRejectedView } from "./WorkshopRejectedView";
import { WorkshopForm as WorkshopFormType } from "./WorkshopForm";
import { IconLoader2 } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface WorkshopStatusViewProps {
  eventId: string;
  eventType?: string;
}

export function WorkshopStatusView({
  eventId,
  eventType,
}: WorkshopStatusViewProps) {
  const { data, isLoading, error } = useQuery({
    ...orpc.workshops.getMyWorkshopForEvent.queryOptions({
      input: { eventId },
    }),
    enabled: !!eventId,
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4">
          <div
            className={cn(
              "flex size-16 items-center justify-center rounded-2xl",
              "from-primary/20 via-primary/10 bg-gradient-to-br to-transparent",
            )}
          >
            <IconLoader2 className="text-primary size-8 animate-spin" />
          </div>
          <p className="text-muted-foreground text-sm">
            Loading workshop status...
          </p>
        </div>
      </div>
    );
  }

  // Error state - show proposal form
  if (error || !data) {
    return (
      <WorkshopForm eventId={eventId} eventType={eventType ?? undefined} />
    );
  }

  // No workshop - show proposal form
  if (!data.workshop) {
    return (
      <WorkshopForm eventId={eventId} eventType={eventType ?? undefined} />
    );
  }

  const { workshop, eventTitle } = data;

  // Accepted workshop - show management view
  if (workshop.proposalStatus === "accepted") {
    return (
      <WorkshopManageView
        workshopId={workshop.id}
        workshopTitle={workshop.title}
        eventTitle={eventTitle ?? "Event"}
        startAt={workshop.startAt}
        endAt={workshop.endAt}
        capacity={workshop.capacity}
        description={workshop.description}
        researchDomain={workshop.researchDomain}
      />
    );
  }

  // Pending workshop - show pending message
  if (workshop.proposalStatus === "pending") {
    return (
      <WorkshopPendingView
        workshopTitle={workshop.title}
        eventTitle={eventTitle ?? "Event"}
        proposedAt={workshop.proposedAt}
      />
    );
  }

  // Rejected workshop - show rejection message with option to submit new proposal
  if (workshop.proposalStatus === "rejected") {
    return (
      <WorkshopRejectedView
        workshopTitle={workshop.title}
        eventTitle={eventTitle ?? "Event"}
        rejectionReason={workshop.rejectionReason}
        respondedAt={workshop.respondedAt}
        eventId={eventId}
        eventType={eventType}
      />
    );
  }

  // Fallback to proposal form
  return <WorkshopForm eventId={eventId} eventType={eventType ?? undefined} />;
}
