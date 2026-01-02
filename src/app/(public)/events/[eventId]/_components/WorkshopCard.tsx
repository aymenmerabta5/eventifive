"use client";

import Link from "next/link";
import type { Route } from "next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  IconCalendar,
  IconUser,
  IconUsers,
  IconFileDescription,
  IconLoader2,
  IconLock,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { formatDateFull, formatTime } from "@/lib/date";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { toast } from "sonner";

export interface Workshop {
  id: string;
  title: string;
  description: string | null;
  researchDomain: string | null;
  capacity: number | null;
  startAt: Date | null;
  endAt: Date | null;
  facilitator: {
    id: string;
    name: string;
    image: string | null;
  };
  registrationCount: number;
  isRegistered: boolean;
  isFull: boolean;
}

type WorkshopStatus = "live" | "upcoming" | "ended" | "unscheduled";

function getWorkshopStatus(
  startAt: Date | null,
  endAt: Date | null,
): WorkshopStatus {
  if (!startAt || !endAt) return "unscheduled";

  const now = new Date();
  const start = new Date(startAt);
  const end = new Date(endAt);

  if (now >= start && now <= end) return "live";
  if (now < start) return "upcoming";
  return "ended";
}

interface WorkshopCardProps {
  workshop: Workshop;
  eventId: string;
  isEventRegistered: boolean;
  isAuthenticated: boolean;
}

export function WorkshopCard({
  workshop,
  eventId,
  isEventRegistered,
  isAuthenticated,
}: WorkshopCardProps) {
  const queryClient = useQueryClient();
  const status = getWorkshopStatus(workshop.startAt, workshop.endAt);
  const isLive = status === "live";
  const isEnded = status === "ended";

  const registerMutation = useMutation({
    ...orpc.workshops.register.mutationOptions(),
    onSuccess: () => {
      toast.success("Successfully registered for the workshop!");
      queryClient.invalidateQueries({
        queryKey: ["workshops", "listByEvent", eventId],
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to register for workshop");
    },
  });

  const unregisterMutation = useMutation({
    ...orpc.workshops.unregister.mutationOptions(),
    onSuccess: () => {
      toast.success("Successfully unregistered from the workshop");
      queryClient.invalidateQueries({
        queryKey: ["workshops", "listByEvent", eventId],
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to unregister from workshop");
    },
  });

  const handleRegister = () => {
    registerMutation.mutate({ workshopId: workshop.id });
  };

  const handleUnregister = () => {
    unregisterMutation.mutate({ workshopId: workshop.id });
  };

  const isLoading = registerMutation.isPending || unregisterMutation.isPending;
  const canRegister =
    isAuthenticated &&
    isEventRegistered &&
    !workshop.isFull &&
    !workshop.isRegistered;
  const canUnregister = workshop.isRegistered && !isEnded && !isLive;

  const capacityText = workshop.capacity
    ? `${workshop.registrationCount}/${workshop.capacity}`
    : `${workshop.registrationCount} registered`;

  return (
    <div
      className={cn(
        "border-border/50 relative overflow-hidden rounded-2xl border",
        "from-card via-card to-card/80 bg-gradient-to-br",
        "transition-all duration-300",
        isLive && [
          "border-emerald-500/30 ring-2 ring-emerald-500/10",
          "shadow-lg shadow-emerald-500/5",
        ],
        isEnded && "opacity-70",
        !isLive && !isEnded && "hover:border-primary/30 hover:shadow-md",
      )}
    >
      {/* Live indicator strip */}
      {isLive && (
        <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-emerald-500 via-emerald-500 to-emerald-500/50" />
      )}

      {/* Pattern overlay for live */}
      {isLive && (
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: "20px 20px",
          }}
        />
      )}

      <div className="relative p-5">
        {/* Header */}
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3 className="font-display text-foreground text-lg leading-tight font-semibold">
            {workshop.title}
          </h3>
          <div className="flex items-center gap-2">
            {workshop.isFull && (
              <Badge variant="destructive" className="text-xs">
                Full
              </Badge>
            )}
            {workshop.isRegistered && (
              <Badge
                variant="default"
                className="gap-1 bg-emerald-500 hover:bg-emerald-500"
              >
                <IconCheck className="size-3" />
                Registered
              </Badge>
            )}
            <WorkshopStatusBadge status={status} />
          </div>
        </div>

        {/* Meta info */}
        <div className="mb-4 space-y-2">
          {/* Facilitator */}
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <div className="bg-primary/10 flex size-6 items-center justify-center rounded-md">
              <IconUser className="text-primary size-3.5" />
            </div>
            <span>{workshop.facilitator.name}</span>
          </div>

          {/* Date & Time (if scheduled) */}
          {workshop.startAt && workshop.endAt && (
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <div className="bg-chart-2/10 flex size-6 items-center justify-center rounded-md">
                <IconCalendar className="text-chart-2 size-3.5" />
              </div>
              <span>
                {formatDateFull(workshop.startAt)} &bull;{" "}
                {formatTime(workshop.startAt)} – {formatTime(workshop.endAt)}
              </span>
            </div>
          )}

          {/* Capacity */}
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <div className="bg-chart-3/10 flex size-6 items-center justify-center rounded-md">
              <IconUsers className="text-chart-3 size-3.5" />
            </div>
            <span>{capacityText}</span>
          </div>

          {/* Description */}
          {workshop.description && (
            <p className="text-muted-foreground line-clamp-2 text-sm">
              {workshop.description}
            </p>
          )}

          {/* Research Domain */}
          {workshop.researchDomain && (
            <Badge variant="secondary" className="text-xs">
              {workshop.researchDomain}
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="border-border/50 flex flex-wrap gap-2 border-t pt-3">
          <TooltipProvider>
            {/* Register/Unregister Button */}
            {workshop.isRegistered ? (
              <>
                {/* Resources Button - only when registered */}
                <Button
                  variant="outline"
                  size="sm"
                  className="border-border/50 hover:border-primary/30 hover:bg-primary/5 hover:text-primary gap-2"
                  asChild
                >
                  <Link
                    href={
                      `/events/${eventId}/workshops/${workshop.id}/resources` as Route
                    }
                  >
                    <IconFileDescription className="size-4" />
                    Resources
                  </Link>
                </Button>

                {/* Unregister Button */}
                {canUnregister && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border/50 hover:border-destructive/30 hover:bg-destructive/5 hover:text-destructive gap-2"
                    onClick={handleUnregister}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <IconLoader2 className="size-4 animate-spin" />
                    ) : (
                      <IconX className="size-4" />
                    )}
                    Unregister
                  </Button>
                )}
              </>
            ) : (
              <RegisterButton
                canRegister={canRegister}
                isAuthenticated={isAuthenticated}
                isEventRegistered={isEventRegistered}
                isFull={workshop.isFull}
                isLoading={isLoading}
                onRegister={handleRegister}
              />
            )}
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}

interface RegisterButtonProps {
  canRegister: boolean;
  isAuthenticated: boolean;
  isEventRegistered: boolean;
  isFull: boolean;
  isLoading: boolean;
  onRegister: () => void;
}

function RegisterButton({
  canRegister,
  isAuthenticated,
  isEventRegistered,
  isFull,
  isLoading,
  onRegister,
}: RegisterButtonProps) {
  const getDisabledReason = () => {
    if (!isAuthenticated) return "Login to register for workshops";
    if (!isEventRegistered) return "Register for the event first";
    if (isFull) return "This workshop has reached its capacity";
    return undefined;
  };

  const disabledReason = getDisabledReason();

  const button = (
    <Button
      variant={canRegister ? "default" : "outline"}
      size="sm"
      className={cn(
        "gap-2",
        !canRegister && "border-border/50",
        canRegister && "bg-emerald-500 hover:bg-emerald-600",
      )}
      disabled={!canRegister || isLoading}
      onClick={canRegister ? onRegister : undefined}
    >
      {isLoading ? (
        <IconLoader2 className="size-4 animate-spin" />
      ) : !canRegister ? (
        <IconLock className="size-4" />
      ) : (
        <IconCheck className="size-4" />
      )}
      Register
    </Button>
  );

  if (disabledReason) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent>
          <p>{disabledReason}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return button;
}

interface WorkshopStatusBadgeProps {
  status: WorkshopStatus;
}

function WorkshopStatusBadge({ status }: WorkshopStatusBadgeProps) {
  switch (status) {
    case "live":
      return (
        <Badge
          variant="default"
          className="gap-1 bg-emerald-500 hover:bg-emerald-500"
        >
          <span className="size-1.5 animate-ping rounded-full bg-white" />
          Live
        </Badge>
      );
    case "upcoming":
      return (
        <Badge variant="secondary" className="text-xs">
          Upcoming
        </Badge>
      );
    case "ended":
      return (
        <Badge
          variant="outline"
          className="text-muted-foreground border-muted text-xs"
        >
          Ended
        </Badge>
      );
    case "unscheduled":
      return (
        <Badge
          variant="outline"
          className="text-muted-foreground border-muted text-xs"
        >
          TBA
        </Badge>
      );
  }
}

export { getWorkshopStatus };
export type { WorkshopStatus };
