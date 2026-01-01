import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IconAlertTriangle, IconTrash } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { AdminEvent } from "../types";

export default function DeleteEventDialog({ event, onClose, onConfirm }: { event: AdminEvent | null; onClose: () => void; onConfirm: () => void }) {
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