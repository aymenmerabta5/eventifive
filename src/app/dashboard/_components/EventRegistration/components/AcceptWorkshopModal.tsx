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
import { Input } from "@/components/ui/input";
import { IconLoader2, IconCheck, IconCalendar } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface AcceptWorkshopModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workshopTitle: string;
  onConfirm: (startAt?: string, endAt?: string) => void;
  isLoading: boolean;
}

export function AcceptWorkshopModal({
  open,
  onOpenChange,
  workshopTitle,
  onConfirm,
  isLoading,
}: AcceptWorkshopModalProps) {
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");

  const handleConfirm = () => {
    onConfirm(
      startAt ? new Date(startAt).toISOString() : undefined,
      endAt ? new Date(endAt).toISOString() : undefined,
    );
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form on close
      setStartAt("");
      setEndAt("");
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div
              className={cn(
                "flex size-8 items-center justify-center rounded-lg",
                "bg-primary/10",
              )}
            >
              <IconCheck className="text-primary size-4" />
            </div>
            Accept Workshop Proposal
          </DialogTitle>
          <DialogDescription>
            Accept &quot;{workshopTitle}&quot; as a workshop. Optionally set the
            schedule for when this workshop will take place.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label
              htmlFor="startAt"
              className="flex items-center gap-2 text-sm font-medium"
            >
              <IconCalendar className="text-muted-foreground size-4" />
              Start Date & Time (optional)
            </Label>
            <Input
              id="startAt"
              type="datetime-local"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              className="h-10"
            />
          </div>
          <div className="grid gap-2">
            <Label
              htmlFor="endAt"
              className="flex items-center gap-2 text-sm font-medium"
            >
              <IconCalendar className="text-muted-foreground size-4" />
              End Date & Time (optional)
            </Label>
            <Input
              id="endAt"
              type="datetime-local"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
              className="h-10"
            />
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
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? (
              <IconLoader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <IconCheck className="mr-2 size-4" />
            )}
            Accept Workshop
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
