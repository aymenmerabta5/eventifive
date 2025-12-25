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
import {
  MapPin,
  MoreHorizontal,
  Pencil,
  Users,
  Share2,
  Trash2,
  Send,
  RotateCcw,
  XCircle,
  Archive,
} from "lucide-react";
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

  return (
    <TableRow>
      <TableCell>
        <div className="font-medium">{event.title}</div>
      </TableCell>
      <TableCell>
        <Badge variant="secondary">{EVENT_TYPE_LABELS[event.type]}</Badge>
      </TableCell>
      <TableCell>
        <div className="text-sm font-medium">
          {formatSchedule(event.startDate, event.endDate)}
        </div>
        <p className="text-muted-foreground text-xs">
          Created {formatDate(event.createdAt)}
        </p>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1 text-sm">
          <MapPin className="text-muted-foreground size-3.5" />
          {event.location || "TBA"}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={badgeVariant}>{displayStatus}</Badge>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />

            {/* Status actions */}
            {canPublish(event) && onPublish && (
              <DropdownMenuItem onClick={() => onPublish(event)}>
                <Send className="mr-2 h-4 w-4" />
                Publish
              </DropdownMenuItem>
            )}
            {canUnpublish(event) && onUnpublish && (
              <DropdownMenuItem onClick={() => onUnpublish(event)}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Unpublish
              </DropdownMenuItem>
            )}
            {canArchive(event) && onArchive && (
              <DropdownMenuItem onClick={() => onArchive(event)}>
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            {/* Standard actions */}
            <DropdownMenuItem onClick={() => onUpdate(event)}>
              <Pencil className="mr-2 h-4 w-4" />
              Update
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onApprovals(event)}>
              <Users className="mr-2 h-4 w-4" />
              Event registrations
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onShare(event)}>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Destructive actions */}
            {canCancel(event) && onCancel && (
              <DropdownMenuItem
                onClick={() => onCancel(event)}
                className="text-destructive focus:text-destructive"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Cancel Event
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => onDelete(event)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
