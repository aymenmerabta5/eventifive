"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IconLoader2, IconX } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface RejectWorkshopModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workshopTitle: string;
  onConfirm: (reason: string) => void;
  isLoading: boolean;
}

export function RejectWorkshopModal({
  open,
  onOpenChange,
  workshopTitle,
  onConfirm,
  isLoading,
}: RejectWorkshopModalProps) {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(reason.trim());
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form on close
      setReason("");
    }
    onOpenChange(newOpen);
  };

  const isValid = reason.trim().length >= 1 && reason.trim().length <= 1000;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div
              className={cn(
                "flex size-8 items-center justify-center rounded-lg",
                "bg-destructive/10",
              )}
            >
              <IconX className="text-destructive size-4" />
            </div>
            Reject Workshop Proposal
          </DialogTitle>
          <DialogDescription>
            Reject &quot;{workshopTitle}&quot;. Please provide a reason for the
            rejection so the facilitator understands why their proposal was not
            accepted.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="reason" className="text-sm font-medium">
              Rejection Reason <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="Explain why this proposal is being rejected..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              maxLength={1000}
              className="resize-none"
            />
            <p className="text-muted-foreground text-xs">
              {reason.length}/1000 characters
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading || !isValid}
          >
            {isLoading ? (
              <IconLoader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <IconX className="mr-2 size-4" />
            )}
            Reject Workshop
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
