import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteDropdown } from "./DeleteDropdown";
import { cn } from "@/lib/utils";
import {
  IconMapPin,
} from "@tabler/icons-react";
import { EVENT_TYPE_LABELS } from "../../MyEvents/constants";
import {
  formatSchedule,
  formatDate,
  getEventDisplayStatus,
  getStatusBadgeVariant,
} from "../../MyEvents/utils";
import type { AdminEvent, EventActionHandlers } from "../../MyEvents/types";

interface EventTableRowProps {
  event: AdminEvent;
  showOrganizer?: boolean;
  deleteOnly?: boolean;
  onDelete?: (event: AdminEvent) => void;
}

function getStatusStyles(variant: string): string {
  switch (variant) {
    case "default":
      return "bg-primary/10 text-primary border-primary/30";
    case "secondary":
      return "bg-secondary text-secondary-foreground border-secondary";
    case "destructive":
      return "bg-destructive/10 text-destructive border-destructive/30";
    case "outline":
      return "bg-muted text-muted-foreground border-border";
    default:
      return "bg-secondary text-secondary-foreground border-secondary";
  }
}

export function EventTableRow({
  event,
  showOrganizer = false,
  deleteOnly = false,
  onDelete,
}: EventTableRowProps) {
  const displayStatus = getEventDisplayStatus(event);
  const badgeVariant = getStatusBadgeVariant(displayStatus);
  const statusStyles = getStatusStyles(badgeVariant);

  return (
    <TableRow
      className={cn(
        "group border-border/50",
        "transition-colors duration-200",
        "hover:bg-secondary/30"
      )}
    >
      <TableCell>
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg",
              "bg-gradient-to-br from-primary/10 to-chart-2/10",
              "text-xs font-bold text-primary"
            )}
          >
            {event.title.charAt(0).toUpperCase()}
          </div>
          <div className="font-medium text-foreground">{event.title}</div>
        </div>
      </TableCell>

      {showOrganizer && (
        <TableCell>
          <div className="text-sm text-muted-foreground">{(event as any).organizerName ?? event.organizerId ?? "—"}</div>
        </TableCell>
      )}

      <TableCell>
        <Badge
          variant="secondary"
          className="bg-secondary/80 text-secondary-foreground"
        >
          {EVENT_TYPE_LABELS[event.type]}
        </Badge>
      </TableCell>

      <TableCell>
        <div className="space-y-0.5">
          <div className="text-sm font-medium text-foreground">{formatSchedule(event.startDate, event.endDate)}</div>
          <p className="text-xs text-muted-foreground">Created {formatDate(event.createdAt)}</p>
        </div>
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <IconMapPin className="size-3.5" />
          <span>{event.location || "TBA"}</span>
        </div>
      </TableCell>

      <TableCell>
        <Badge variant="outline" className={cn("font-medium", statusStyles)}>
          {displayStatus}
        </Badge>
      </TableCell>

      <TableCell>
        <DeleteDropdown event={event} onDelete={onDelete} />
      </TableCell>
    </TableRow>
  );
}
