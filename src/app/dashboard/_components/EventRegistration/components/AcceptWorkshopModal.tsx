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
import { cn } from "@/lib/utils";

export interface AcceptWorkshopModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workshopTitle: string;
  onConfirm: (startAt?: string, endAt?: string) => void;
  isLoading: boolean;
  eventStartDate?: Date;
  eventEndDate?: Date;
}

export function AcceptWorkshopModal({
  open,
  onOpenChange,
  workshopTitle,
  onConfirm,
  isLoading,
  eventStartDate,
  eventEndDate,
}: AcceptWorkshopModalProps) {
  // Convert event dates to ISO strings for input min/max
  const minDate = eventStartDate ? eventStartDate.toISOString().slice(0, 16) : "";
  const maxDate = eventEndDate ? eventEndDate.toISOString().slice(0, 16) : "";

  const [startAt, setStartAt] = useState<string>("");
  const [endAt, setEndAt] = useState<string>("");

  const isStartValid =
    !startAt ||
    (!minDate || startAt >= minDate) &&
    (!maxDate || startAt <= maxDate);

  const isEndValid =
    !endAt ||
    (!minDate || endAt >= minDate) &&
    (!maxDate || endAt <= maxDate);

  const isRangeValid =
    (!startAt || !endAt || startAt <= endAt) && isStartValid && isEndValid;

  const handleConfirm = () => {
    if (!isRangeValid) return;
    onConfirm(startAt, endAt);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div
              className={cn(
                "flex size-8 items-center justify-center rounded-lg",
                "bg-primary/10"
              )}
            >
              {/* <IconCheck className="text-primary size-4" /> */}
            </div>
            Accept Workshop Proposal
          </DialogTitle>
          <DialogDescription>
            Accept &quot;{workshopTitle}&quot; as a workshop. You can set the
            schedule for this workshop, but it must be within the event dates.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              Start Date & Time
            </label>
            <input
              type="datetime-local"
              className="h-10 rounded border px-2"
              min={minDate}
              max={maxDate}
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
            />
            {!isStartValid && (
              <span className="text-destructive text-xs">
                Start date must be within event dates.
              </span>
            )}
          </div>
          <div className="grid gap-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              End Date & Time
            </label>
            <input
              type="datetime-local"
              className="h-10 rounded border px-2"
              min={minDate}
              max={maxDate}
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
            />
            {!isEndValid && (
              <span className="text-destructive text-xs">
                End date must be within event dates.
              </span>
            )}
            {startAt && endAt && startAt > endAt && (
              <span className="text-destructive text-xs">
                End date must be after start date.
              </span>
            )}
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || !isRangeValid}
          >
            Accept Workshop
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
