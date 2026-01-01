import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
// Make sure the file exists as EventTableRow.tsx in the same folder, or update the import path/extension accordingly.
import { EventTableRow } from "./EventTableRow";
import type { AdminEvent, EventActionHandlers } from "../../MyEvents/types";

interface EventsTableProps extends Omit<EventActionHandlers, "onUpdate"> {
  events: AdminEvent[];
  showOrganizer?: boolean;
  deleteOnly?: boolean;
  onCancel?: (event: AdminEvent) => void; // <-- Add this
}

export function EventsTable({
  events,
  showOrganizer = false,
  deleteOnly = false,
  onDelete,
}: EventsTableProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/50",
        " from-card via-card to-card/80"
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
          All the Events
        </h2>
        <p className="text-sm text-muted-foreground">
          Manage and track all events
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
              {showOrganizer && (
                <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Organizer
                </TableHead>
              )}
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
                showOrganizer={showOrganizer}
                deleteOnly={deleteOnly}
                onDelete={onDelete}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="relative border-t border-border/50 px-6 py-3">
        <p className="text-xs text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-foreground">{events.length}</span> event
          {events.length !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}
