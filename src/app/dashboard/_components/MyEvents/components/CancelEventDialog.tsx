"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { IconCircleX, IconLoader2, IconAlertCircle } from "@tabler/icons-react";
import type { AdminEvent } from "../types";

interface CancelEventDialogProps {
  event: AdminEvent | null;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  isLoading?: boolean;
}

export function CancelEventDialog({
  event,
  onClose,
  onConfirm,
  isLoading,
}: CancelEventDialogProps) {
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
        {/* Warning icon */}
        <div className="bg-chart-4/10 mx-auto mb-4 flex size-14 items-center justify-center rounded-full">
          <IconAlertCircle className="text-chart-4 size-7" />
        </div>

        <DialogHeader className="text-center">
          <DialogTitle className="font-display text-xl">
            Cancel Event
          </DialogTitle>
          <DialogDescription className="text-center">
            Are you sure you want to cancel{" "}
            <span className="text-foreground font-medium">{event?.title}</span>?
          </DialogDescription>
        </DialogHeader>

        {/* Info box */}
        <div
          className={cn(
            "border-chart-4/20 rounded-xl border",
            "bg-chart-4/5 p-4",
          )}
        >
          <p className="text-muted-foreground text-center text-sm">
            This will prevent new registrations. Existing registrants should be
            notified separately.
          </p>
        </div>

        {/* Reason input */}
        <div className="space-y-2">
          <Label
            htmlFor="cancel-reason"
            className="text-foreground text-sm font-medium"
          >
            Cancellation reason{" "}
            <span className="text-muted-foreground font-normal">
              (optional, visible to public)
            </span>
          </Label>
          <Textarea
            id="cancel-reason"
            placeholder="e.g., Due to unforeseen circumstances..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className={cn(
              "border-border/50 resize-none",
              "focus:border-primary/50 focus:ring-primary/20",
            )}
          />
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="border-border/50 w-full sm:w-auto"
          >
            Keep Event
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
            className="w-full gap-2 sm:w-auto"
          >
            {isLoading ? (
              <IconLoader2 className="size-4 animate-spin" />
            ) : (
              <IconCircleX className="size-4" />
            )}
            {isLoading ? "Cancelling..." : "Cancel Event"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
