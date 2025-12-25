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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Event</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel <strong>{event?.title}</strong>?
            This will prevent new registrations. Existing registrants should be
            notified.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="cancel-reason">
            Cancellation reason (optional, visible to public)
          </Label>
          <Textarea
            id="cancel-reason"
            placeholder="e.g., Due to unforeseen circumstances..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Keep Event
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Cancelling..." : "Cancel Event"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
