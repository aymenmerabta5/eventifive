import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
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
}: EventsTableProps) {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-lg font-semibold">
          Administrator events
        </CardTitle>
        <CardDescription>
          These are all events that you have created.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
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
              />
            ))}
          </TableBody>
          <TableCaption>
            You have created {events.length} event(s).
          </TableCaption>
        </Table>
      </CardContent>
    </Card>
  );
}
