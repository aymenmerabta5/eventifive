"use client";

import {
  IconMapPin,
  IconCalendar,
  IconMicrophone2,
  IconEye,
  IconUsers,
  IconUser,
  IconStar,
  IconGavel,
  IconSchool,
  IconUserCog,
  IconSparkles,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { formatDateLong } from "@/lib/date";
import { cn } from "@/lib/utils";
import type { RecentEvent } from "../types";

// Role icon mapping
const roleIcons: Record<string, typeof IconUser> = {
  speaker: IconMicrophone2,
  reviewer: IconEye,
  communicator: IconUsers,
  organizer: IconUserCog,
  admin: IconStar,
  attendee: IconUser,
  participant: IconUser,
  mentor: IconSchool,
  judge: IconGavel,
  workshop_facilitator: IconUsers,
};

// Role color mapping
const roleColors: Record<string, string> = {
  speaker:
    "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  reviewer:
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  communicator:
    "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  organizer:
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  admin: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  attendee: "bg-muted text-muted-foreground border-border/50",
  participant: "bg-muted text-muted-foreground border-border/50",
  mentor: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
  judge:
    "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  workshop_facilitator:
    "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
};

// Status styling
const statusStyles: Record<string, { label: string; classes: string }> = {
  upcoming: {
    label: "Upcoming",
    classes: "bg-primary/10 text-primary border-primary/20",
  },
  attending: {
    label: "Attending",
    classes:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  past: {
    label: "Completed",
    classes: "bg-muted text-muted-foreground border-border/50",
  },
};

interface EventItemProps {
  event: RecentEvent;
}

export function EventItem({ event }: EventItemProps) {
  const formattedDate = event.date ? formatDateLong(event.date) : "Date TBA";
  const roleKey = event.role?.toLowerCase() ?? "participant";
  const RoleIcon = roleIcons[roleKey] ?? IconUser;
  const roleColor = roleColors[roleKey] ?? roleColors.participant;
  const statusStyle =
    statusStyles[event.status ?? "past"] ?? statusStyles.past!;

  const isUpcoming = event.status === "upcoming";

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border transition-all duration-200",
        "hover:border-primary/30 hover:shadow-primary/5 hover:shadow-md",
        isUpcoming
          ? "border-primary/20 bg-primary/5"
          : "border-border/50 bg-muted/30",
      )}
    >
      {/* Status line */}
      {isUpcoming && (
        <div className="from-primary/60 via-primary to-primary/60 absolute top-0 right-0 left-0 h-0.5 bg-gradient-to-r" />
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {/* Title */}
            <h4 className="group-hover:text-primary line-clamp-2 text-sm leading-tight font-medium transition-colors">
              {event.title}
            </h4>

            {/* Role badge */}
            <div className="mt-2 flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn("gap-1 text-[11px]", roleColor)}
              >
                <RoleIcon className="size-3" />
                {event.role
                  ? event.role.charAt(0).toUpperCase() +
                    event.role.slice(1).replace("_", " ")
                  : "Participant"}
              </Badge>
            </div>
          </div>

          {/* Status badge */}
          <Badge
            variant="outline"
            className={cn("shrink-0 text-[11px]", statusStyle.classes)}
          >
            {isUpcoming && <IconSparkles className="mr-1 size-3" />}
            {statusStyle.label}
          </Badge>
        </div>

        {/* Meta info */}
        <div className="text-muted-foreground mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
          <div className="flex items-center gap-1.5">
            <IconCalendar className="text-primary size-3.5" />
            <span>{formattedDate}</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-1.5">
              <IconMapPin className="text-primary size-3.5" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
