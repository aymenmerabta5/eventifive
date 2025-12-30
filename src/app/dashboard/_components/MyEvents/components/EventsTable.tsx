import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EventTableRow } from "./EventTableRow";
import type { AdminEvent, EventActionHandlers } from "../types";

interface EventsTableProps extends EventActionHandlers {
  events: AdminEvent[];
}

export function EventsTable({
  events,
  onUpdate,
  onDelete,
  onApprovals,
  onShare,
  onPublish,
  onUnpublish,
  onCancel,
  onArchive,
}: EventsTableProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/50",
        "bg-gradient-to-br from-card via-card to-card/80"
      )}
    >
      {/* Background pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Header */}
      <div className="relative border-b border-border/50 px-6 py-4">
        <h2 className="font-display text-lg font-semibold text-foreground">
          Your Events
        </h2>
        <p className="text-sm text-muted-foreground">
          Manage and track all your created events
        </p>
      </div>

      {/* Table */}
      <div className="relative overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Event
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Type
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Schedule
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Location
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Status
              </TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <EventTableRow
                key={event.id}
                event={event}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onApprovals={onApprovals}
                onShare={onShare}
                onPublish={onPublish}
                onUnpublish={onUnpublish}
                onCancel={onCancel}
                onArchive={onArchive}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="relative border-t border-border/50 px-6 py-3">
        <p className="text-xs text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-foreground">{events.length}</span>{" "}
          event{events.length !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}
