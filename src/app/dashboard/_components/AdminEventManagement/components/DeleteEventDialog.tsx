import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IconAlertTriangle, IconTrash } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { AdminEvent } from "../types";

export default function DeleteEventDialog({
  event,
  onClose,
  onConfirm,
}: {
  event: AdminEvent | null;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={!!event} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <div className="bg-destructive/10 mx-auto mb-4 flex size-14 items-center justify-center rounded-full">
          <IconAlertTriangle className="text-destructive size-7" />
        </div>

        <DialogHeader className="text-center">
          <DialogTitle className="font-display text-xl">
            Delete event
          </DialogTitle>
          <DialogDescription className="text-center">
            Are you sure you want to delete{" "}
            <span className="text-foreground font-medium">{event?.title}</span>?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div
          className={cn(
            "border-destructive/20 rounded-xl border",
            "bg-destructive/5 p-4",
          )}
        >
          <p className="text-muted-foreground text-center text-sm">
            All event data including registrations, submissions, and
            certificates will be permanently removed.
          </p>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-border/50 w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            className="w-full gap-2 sm:w-auto"
          >
            <IconTrash className="size-4" />
            Delete Event
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
