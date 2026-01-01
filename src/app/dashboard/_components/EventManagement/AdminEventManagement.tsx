"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient, useQueries } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { toast } from "sonner";
import { EventsTable } from "./components/EventsTable";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  IconRefresh,
  IconLoader2,
  IconCalendarEvent,
  IconLayoutGrid,
  IconHistory,
  IconAlertTriangle,
  IconTrash,
  IconCircleX,
  IconAlertCircle,
} from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";


// Inline types for this admin page
import type { AdminEvent, EventStats } from "./types";

// Inlined components
interface EventsHeaderProps {
  onRefresh: () => void;
  isRefetching: boolean;
}
function EventsHeader({ onRefresh, isRefetching }: EventsHeaderProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/50",
        "bg-gradient-to-br from-card via-card to-card/80",
        "p-6"
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }}
      />

      <div className="pointer-events-none absolute -right-12 -top-12 size-48 rounded-full bg-gradient-to-br from-primary/10 via-chart-2/10 to-transparent blur-3xl" />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-xl",
              "bg-gradient-to-br from-primary/10 to-chart-2/10",
              "text-primary"
            )}
          >
            <IconCalendarEvent className="size-6" />
          </div>
          <div className="space-y-1">
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">Platform Events</h1>
            <p className="text-sm text-muted-foreground">Review and manage all events on the platform</p>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={onRefresh}
          disabled={isRefetching}
          className={cn(
            "gap-2 border-border/50 bg-card/50 backdrop-blur-sm",
            "transition-all duration-300",
            "hover:border-primary/30 hover:bg-secondary"
          )}
        >
          {isRefetching ? <IconLoader2 className="size-4 animate-spin" /> : <IconRefresh className="size-4" />}
          Refresh
        </Button>
      </div>
    </div>
  );
}

function StatCard({ title, value, description, icon, accentColor }: { title: string; value: number; description: string; icon: React.ReactNode; accentColor: "primary" | "chart-2" | "chart-3"; }) {
  const colorClasses = {
    primary: {
      icon: "bg-primary/10 text-primary",
      strip: "from-primary via-chart-1 to-chart-5",
      glow: "bg-primary/15",
    },
    "chart-2": {
      icon: "bg-chart-2/10 text-chart-2",
      strip: "from-chart-2 via-chart-3 to-chart-4",
      glow: "bg-chart-2/15",
    },
    "chart-3": {
      icon: "bg-chart-3/10 text-chart-3",
      strip: "from-chart-3 via-chart-4 to-chart-5",
      glow: "bg-chart-3/15",
    },
  } as const;

  const colors = colorClasses[accentColor];

  return (
    <div className={cn(
      "group relative overflow-hidden rounded-2xl border border-border/50",
      "bg-gradient-to-br from-card via-card to-card/80",
      "shadow-sm transition-all duration-500 ease-out",
      "hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
    )}>
      <div className={cn("absolute left-0 top-0 h-full w-1 rounded-l-2xl", "bg-gradient-to-b", colors.strip, "opacity-80 transition-opacity group-hover:opacity-100")} />

      <div className="pointer-events-none absolute inset-0 opacity-[0.015] dark:opacity-[0.03]" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`, backgroundSize: "24px 24px" }} />

      <div className="relative p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-3">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground/80">{title}</span>
            <div className="font-display text-3xl font-bold tabular-nums text-foreground">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>

          <div className={cn("flex size-10 items-center justify-center rounded-xl", "transition-transform duration-300 group-hover:scale-110", colors.icon)}>{icon}</div>
        </div>
      </div>

      <div className={cn("pointer-events-none absolute -bottom-8 -right-8 size-32 rounded-full blur-3xl", "opacity-0 transition-opacity duration-500 group-hover:opacity-100", colors.glow)} />
    </div>
  );
}

function EventStatsCards({ stats }: { stats: EventStats }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard title="Total Events" value={stats.total} description="All events you have created" icon={<IconLayoutGrid className="size-5" />} accentColor="primary" />
      <StatCard title="Upcoming" value={stats.upcoming} description="Events that are still active" icon={<IconCalendarEvent className="size-5" />} accentColor="chart-2" />
      <StatCard title="Completed" value={stats.past} description="Finished events" icon={<IconHistory className="size-5" />} accentColor="chart-3" />
    </div>
  );
}

function DeleteEventDialog({ event, onClose, onConfirm }: { event: AdminEvent | null; onClose: () => void; onConfirm: () => void }) {
  return (
    <Dialog open={!!event} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-destructive/10">
          <IconAlertTriangle className="size-7 text-destructive" />
        </div>

        <DialogHeader className="text-center">
          <DialogTitle className="font-display text-xl">Delete event</DialogTitle>
          <DialogDescription className="text-center">
            Are you sure you want to delete <span className="font-medium text-foreground">{event?.title}</span>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className={cn("rounded-xl border border-destructive/20", "bg-destructive/5 p-4")}>
          <p className="text-center text-sm text-muted-foreground">All event data including registrations, submissions, and certificates will be permanently removed.</p>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={onClose} className="w-full border-border/50 sm:w-auto">Cancel</Button>
          <Button variant="destructive" onClick={onConfirm} className="w-full gap-2 sm:w-auto">
            <IconTrash className="size-4" />
            Delete Event
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CancelEventDialog({ event, onClose, onConfirm, isLoading }: { event: AdminEvent | null; onClose: () => void; onConfirm: (reason?: string) => void; isLoading?: boolean }) {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    onConfirm(reason.trim() || undefined);
    setReason("");
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  return (
    <Dialog open={!!event} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-chart-4/10">
          <IconAlertCircle className="size-7 text-chart-4" />
        </div>

        <DialogHeader className="text-center">
          <DialogTitle className="font-display text-xl">Cancel Event</DialogTitle>
          <DialogDescription className="text-center">Are you sure you want to cancel <span className="font-medium text-foreground">{event?.title}</span>?</DialogDescription>
        </DialogHeader>

        <div className={cn("rounded-xl border border-chart-4/20", "bg-chart-4/5 p-4")}>
          <p className="text-center text-sm text-muted-foreground">This will prevent new registrations. Existing registrants should be notified separately.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cancel-reason" className="text-sm font-medium text-foreground">Cancellation reason <span className="font-normal text-muted-foreground">(optional, visible to public)</span></Label>
          <Textarea id="cancel-reason" placeholder="e.g., Due to unforeseen circumstances..." value={reason} onChange={(e) => setReason((e.target as HTMLTextAreaElement).value)} rows={3} className={cn("resize-none border-border/50", "focus:border-primary/50 focus:ring-primary/20")} />
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={handleClose} disabled={isLoading} className="w-full border-border/50 sm:w-auto">Keep Event</Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={isLoading} className="w-full gap-2 sm:w-auto">
            {isLoading ? <IconLoader2 className="size-4 animate-spin" /> : <IconCircleX className="size-4" />}
            {isLoading ? "Cancelling..." : "Cancel Event"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminEventManagement() {
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching } = useQuery(
    orpc.events.adminList.queryOptions({ input: {} }),
  );

  const { mutate: deleteEvent, isPending: isDeleting } = useMutation(
    orpc.events.adminDelete.mutationOptions({
      onSuccess: () => {
        toast.success("Event deleted");
        void queryClient.invalidateQueries({ queryKey: ["/admin/events"] });
        void queryClient.invalidateQueries({ queryKey: orpc.events.adminList.queryOptions({ input: {} }).queryKey });
      },
      onError: (err) => {
        toast.error(err.message || "Failed to delete event");
      },
    }),
  );

  const events = data?.events ?? [];

  // Fetch organizer profiles for all unique organizer IDs in the events list
  const organizerIds = Array.from(new Set(events.map((e) => e.organizerId)));

  const organizerQueries = useQueries({
    queries: organizerIds.map((id) =>
      orpc.profile.get.queryOptions({ input: { userId: id } }),
    ),
  });

  const organizerMap = Object.fromEntries(
    organizerQueries.map((q, i) => {
      const id = organizerIds[i];
      const name = q.data?.name as string | undefined;
      return [id, name];
    }),
  );

  // Enrich events with organizerName for display
  const enrichedEvents = events.map((e) => ({
    ...e,
    organizerName: organizerMap[e.organizerId] ?? undefined,
  }));

  // Dialog state
  const [eventToDelete, setEventToDelete] = useState<AdminEvent | null>(null);
  const [eventToCancel, setEventToCancel] = useState<AdminEvent | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleRefresh = () => {
    void queryClient.invalidateQueries({ queryKey: orpc.events.adminList.queryOptions({ input: {} }).queryKey });
  };

  // Only delete handler is needed
  const onDelete = (e: AdminEvent) => setEventToDelete(e);

  const handleConfirmDelete = () => {
    if (!eventToDelete) return;
    deleteEvent({ eventId: eventToDelete.id });
    setEventToDelete(null);
  };

  const handleCancelDelete = () => setEventToDelete(null);

  const handleConfirmCancel = async () => {
    if (!eventToCancel) return;
    setIsCancelling(true);
    // Placeholder: call cancel endpoint if exists
    try {
      // Example: await orpc.events.adminCancel.mutateAsync({ eventId: eventToCancel.id })
      toast.success("Event cancelled (placeholder)");
    } catch (err: any) {
      toast.error(err?.message || "Failed to cancel event");
    } finally {
      setIsCancelling(false);
      setEventToCancel(null);
    }
  };

  const handleCancelCancelDialog = () => setEventToCancel(null);

  const now = Date.now();
  const stats: EventStats = {
    total: events.length,
    upcoming: events.filter((e) => new Date(e.startDate).getTime() > now).length,
    past: events.filter((e) => new Date(e.endDate).getTime() < now).length,
    draft: events.filter((e) => e.status === "draft").length,
    published: events.filter((e) => e.status === "published").length,
    cancelled: events.filter((e) => e.status === "cancelled").length,
  };

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <EventsHeader onRefresh={handleRefresh} isRefetching={isFetching} />

      <EventStatsCards stats={stats} />

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <EventsTable
          events={enrichedEvents as unknown as AdminEvent[]}
          showOrganizer
          deleteOnly
          onDelete={onDelete}
          onApprovals={() => {}}
          onShare={() => {}}
        />
      )}

      <DeleteEventDialog
        event={eventToDelete}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />

      <CancelEventDialog
        event={eventToCancel}
        onClose={handleCancelCancelDialog}
        onConfirm={handleConfirmCancel}
        isLoading={isCancelling}
      />
    </div>
  );
}
