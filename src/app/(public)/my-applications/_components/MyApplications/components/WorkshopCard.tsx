import Link from "next/link";
import type { Route } from "next";
import {
  IconCalendarEvent,
  IconExternalLink,
  IconPresentation,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { STATUS_CONFIG } from "../constants";
import { formatDate } from "../utils";
import type { WorkshopApplication } from "../types";

interface WorkshopCardProps {
  application: WorkshopApplication;
}

export function WorkshopCard({ application }: WorkshopCardProps) {
  const statusInfo = STATUS_CONFIG[application.status];
  const StatusIcon = statusInfo.icon;

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
          application.status === "pending" &&
            "bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500",
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
            <IconPresentation className="size-3" />
            Workshop
          </Badge>
        </div>

        {/* Application Title & Description */}
        <div className="mb-4 space-y-1">
          <h3 className="group-hover:text-primary line-clamp-2 text-lg leading-tight font-semibold transition-colors">
            {application.title}
          </h3>
          {application.description && (
            <p className="text-muted-foreground line-clamp-2 text-sm">
              {application.description}
            </p>
          )}
          {application.researchDomain && (
            <p className="text-muted-foreground text-xs">
              Domain: {application.researchDomain}
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

          <p className="text-muted-foreground pl-10 text-xs">
            Proposed {formatDate(application.proposedAt)}
          </p>
        </div>

        {/* Rejection Reason */}
        {application.status === "rejected" && application.rejectionReason && (
          <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm">
            <p className="text-red-600 dark:text-red-400">
              {application.rejectionReason}
            </p>
          </div>
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
