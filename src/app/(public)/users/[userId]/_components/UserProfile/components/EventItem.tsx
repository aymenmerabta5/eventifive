import { IconBuilding, IconCalendar } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDateLong } from "@/lib/date";
import { STATUS_TOKENS, ROLE_TOKENS, DEFAULT_ROLE_TOKEN } from "../constants";
import type { RecentEvent } from "../types";

interface EventItemProps {
  event: RecentEvent;
}

export function EventItem({ event }: EventItemProps) {
  const statusToken = STATUS_TOKENS[event.status ?? "past"];
  const roleToken =
    ROLE_TOKENS[event.role as string] ??
    (event.role
      ? { label: event.role, classes: DEFAULT_ROLE_TOKEN.classes }
      : DEFAULT_ROLE_TOKEN);

  const formattedDate = event.date ? formatDateLong(event.date) : "Date TBA";

  return (
    <Card className="border-border/50 bg-muted/30 space-y-2 rounded-2xl px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-foreground text-sm font-semibold">{event.title}</p>
          {roleToken && (
            <p className="text-muted-foreground flex items-center gap-2 text-xs">
              <Badge
                variant="outline"
                className={`text-[11px] ${roleToken.classes}`}
              >
                {roleToken.label}
              </Badge>
            </p>
          )}
        </div>
        {statusToken && (
          <Badge
            variant="outline"
            className={`text-xs ${statusToken.classes}`}
          >
            {statusToken.label}
          </Badge>
        )}
      </div>
      <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-xs">
        <Badge
          variant="secondary"
          className="bg-background/60 gap-1 rounded-full"
        >
          <IconCalendar className="text-primary h-3.5 w-3.5" />
          {formattedDate}
        </Badge>
        {event.location && (
          <Badge
            variant="secondary"
            className="bg-background/60 gap-1 rounded-full"
          >
            <IconBuilding className="text-primary h-3.5 w-3.5" />
            {event.location}
          </Badge>
        )}
      </div>
    </Card>
  );
}
