import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  IconMapPin,
  IconDotsVertical,
  IconPencil,
  IconUsers,
  IconShare,
  IconTrash,
  IconSend,
  IconRotate,
  IconCircleX,
  IconArchive,
} from "@tabler/icons-react";
import { EVENT_TYPE_LABELS } from "../constants";
import {
  formatSchedule,
  formatDate,
  getEventDisplayStatus,
  getStatusBadgeVariant,
  canPublish,
  canUnpublish,
  canCancel,
  canArchive,
} from "../utils";
import type { AdminEvent, EventActionHandlers } from "../types";

interface EventTableRowProps extends EventActionHandlers {
  event: AdminEvent;
}

// Map badge variants to our color palette
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
  onUpdate,
  onDelete,
  onApprovals,
  onShare,
  onPublish,
  onUnpublish,
  onCancel,
  onArchive,
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
          <div className="text-sm font-medium text-foreground">
            {formatSchedule(event.startDate, event.endDate)}
          </div>
          <p className="text-xs text-muted-foreground">
            Created {formatDate(event.createdAt)}
          </p>
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "size-8 opacity-0 transition-opacity group-hover:opacity-100",
                "hover:bg-secondary"
              )}
            >
              <IconDotsVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Actions
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* Status actions */}
            {canPublish(event) && onPublish && (
              <DropdownMenuItem
                onClick={() => onPublish(event)}
                className="gap-2"
              >
                <IconSend className="size-4 text-primary" />
                <span>Publish</span>
              </DropdownMenuItem>
            )}
            {canUnpublish(event) && onUnpublish && (
              <DropdownMenuItem
                onClick={() => onUnpublish(event)}
                className="gap-2"
              >
                <IconRotate className="size-4" />
                <span>Unpublish</span>
              </DropdownMenuItem>
            )}
            {canArchive(event) && onArchive && (
              <DropdownMenuItem
                onClick={() => onArchive(event)}
                className="gap-2"
              >
                <IconArchive className="size-4" />
                <span>Archive</span>
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            {/* Standard actions */}
            <DropdownMenuItem onClick={() => onUpdate(event)} className="gap-2">
              <IconPencil className="size-4" />
              <span>Update</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onApprovals(event)}
              className="gap-2"
            >
              <IconUsers className="size-4" />
              <span>Registrations</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onShare(event)} className="gap-2">
              <IconShare className="size-4" />
              <span>Share</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Destructive actions */}
            {canCancel(event) && onCancel && (
              <DropdownMenuItem
                onClick={() => onCancel(event)}
                className="gap-2 text-destructive focus:text-destructive"
              >
                <IconCircleX className="size-4" />
                <span>Cancel Event</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => onDelete(event)}
              className="gap-2 text-destructive focus:text-destructive"
            >
              <IconTrash className="size-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
