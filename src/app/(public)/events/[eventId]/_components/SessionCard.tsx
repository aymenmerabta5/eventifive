"use client";

import Link from "next/link";
import type { Route } from "next";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  IconCalendar,
  IconMapPin,
  IconUser,
  IconMessageCircle,
  IconChartBar,
  IconExternalLink,
  IconLock,
} from "@tabler/icons-react";
import { formatDateFull, formatTime } from "@/lib/date";
import { SessionStatusBadge, getSessionStatus } from "./SessionStatusBadge";
import { cn } from "@/lib/utils";

export interface Session {
  id: string;
  eventId: string;
  title: string;
  description: string | null;
  startAt: Date;
  endAt: Date;
  roomId: number | null;
  chairId: string | null;
  meetingLink: string | null;
  qaEnabled: boolean;
  qaModerated: boolean;
  room: {
    id: number;
    name: string;
    capacity: number | null;
    location: string | null;
  } | null;
  chair: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  } | null;
}

interface SessionCardProps {
  session: Session;
  eventId: string;
  isRegistered: boolean;
  compact?: boolean;
}

export function SessionCard({
  session,
  eventId,
  isRegistered,
  compact = false,
}: SessionCardProps) {
  const status = getSessionStatus(session.startAt, session.endAt);
  const isLive = status === "live";
  const isEnded = status === "ended";

  return (
    <div
      className={cn(
        "border-border/50 relative overflow-hidden rounded-2xl border",
        "from-card via-card to-card/80 bg-gradient-to-br",
        "transition-all duration-300",
        isLive && [
          "border-destructive/30 ring-destructive/10 ring-2",
          "shadow-destructive/5 shadow-lg",
        ],
        isEnded && "opacity-70",
        !isLive && !isEnded && "hover:border-primary/30 hover:shadow-md",
      )}
    >
      {/* Live indicator strip */}
      {isLive && (
        <div className="from-destructive via-destructive to-destructive/50 absolute top-0 left-0 h-full w-1 bg-gradient-to-b" />
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

      <div className={cn("relative", compact ? "p-4" : "p-5")}>
        {/* Header */}
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3
            className={cn(
              "font-display text-foreground leading-tight font-semibold",
              compact ? "text-base" : "text-lg",
            )}
          >
            {session.title}
          </h3>
          <SessionStatusBadge status={status} />
        </div>

        {/* Meta info */}
        <div className={cn("space-y-2", compact ? "mb-3" : "mb-4")}>
          {/* Date & Time */}
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <div className="bg-primary/10 flex size-6 items-center justify-center rounded-md">
              <IconCalendar className="text-primary size-3.5" />
            </div>
            <span>
              {formatDateFull(session.startAt)} &bull;{" "}
              {formatTime(session.startAt)} – {formatTime(session.endAt)}
            </span>
          </div>

          {/* Room & Chair */}
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {session.room && (
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <div className="bg-chart-2/10 flex size-6 items-center justify-center rounded-md">
                  <IconMapPin className="text-chart-2 size-3.5" />
                </div>
                <span>
                  {session.room.name}
                  {session.room.location && (
                    <span className="text-muted-foreground/70">
                      {" "}
                      ({session.room.location})
                    </span>
                  )}
                </span>
              </div>
            )}
            {session.chair && (
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <div className="bg-chart-3/10 flex size-6 items-center justify-center rounded-md">
                  <IconUser className="text-chart-3 size-3.5" />
                </div>
                <span>{session.chair.name}</span>
              </div>
            )}
          </div>

          {/* Description (only if not compact and has description) */}
          {!compact && session.description && (
            <p className="text-muted-foreground line-clamp-2 text-sm">
              {session.description}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="border-border/50 flex flex-wrap gap-2 border-t pt-3">
          <TooltipProvider>
            {/* Q&A Button */}
            <SessionActionButton
              href={`/events/${eventId}/sessions/${session.id}/qa`}
              icon={<IconMessageCircle className="size-4" />}
              label="Q&A"
              disabled={!isRegistered || !session.qaEnabled}
              disabledReason={
                !isRegistered
                  ? "Register to access Q&A"
                  : !session.qaEnabled
                    ? "Q&A not enabled for this session"
                    : undefined
              }
              color="primary"
            />

            {/* Polls Button */}
            <SessionActionButton
              href={`/events/${eventId}/sessions/${session.id}/polls`}
              icon={<IconChartBar className="size-4" />}
              label="Polls"
              disabled={!isRegistered}
              disabledReason={
                !isRegistered ? "Register to access Polls" : undefined
              }
              color="chart-2"
            />

            {/* Meeting Link Button */}
            {session.meetingLink && (
              <SessionActionButton
                href={session.meetingLink}
                icon={<IconExternalLink className="size-4" />}
                label="Join Meeting"
                disabled={!isRegistered}
                disabledReason={
                  !isRegistered ? "Register to join meeting" : undefined
                }
                external
                color="chart-3"
              />
            )}
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}

interface SessionActionButtonProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
  disabledReason?: string;
  external?: boolean;
  color?: "primary" | "chart-2" | "chart-3";
}

function SessionActionButton({
  href,
  icon,
  label,
  disabled,
  disabledReason,
  external,
  color = "primary",
}: SessionActionButtonProps) {
  const colorClasses = {
    primary: "hover:border-primary/30 hover:bg-primary/5 hover:text-primary",
    "chart-2": "hover:border-chart-2/30 hover:bg-chart-2/5 hover:text-chart-2",
    "chart-3": "hover:border-chart-3/30 hover:bg-chart-3/5 hover:text-chart-3",
  };

  const buttonContent = (
    <Button
      variant="outline"
      size="sm"
      className={cn("border-border/50 gap-2", !disabled && colorClasses[color])}
      disabled={disabled}
      asChild={!disabled}
    >
      {disabled ? (
        <span className="flex items-center gap-2">
          {icon}
          {label}
          <IconLock className="text-muted-foreground size-3" />
        </span>
      ) : external ? (
        <a href={href} target="_blank" rel="noopener noreferrer">
          {icon}
          {label}
        </a>
      ) : (
        <Link href={href as Route}>
          {icon}
          {label}
        </Link>
      )}
    </Button>
  );

  if (disabled && disabledReason) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
        <TooltipContent>
          <p>{disabledReason}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return buttonContent;
}
