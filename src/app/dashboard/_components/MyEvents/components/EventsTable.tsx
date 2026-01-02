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
        "border-border/50 relative overflow-hidden rounded-2xl border",
        "from-card via-card to-card/80",
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
      <div className="border-border/50 relative border-b px-6 py-4">
        <h2 className="font-display text-foreground text-lg font-semibold">
          Your Events
        </h2>
        <p className="text-muted-foreground text-sm">
          Manage and track all your created events
        </p>
      </div>

      {/* Table */}
      <div className="relative overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                Event
              </TableHead>
              <TableHead className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                Type
              </TableHead>
              <TableHead className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                Schedule
              </TableHead>
              <TableHead className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                Location
              </TableHead>
              <TableHead className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
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
      <div className="border-border/50 relative border-t px-6 py-3">
        <p className="text-muted-foreground text-xs">
          Showing{" "}
          <span className="text-foreground font-medium">{events.length}</span>{" "}
          event{events.length !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}
