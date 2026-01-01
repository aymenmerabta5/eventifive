import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { IconAlertCircle, IconCircleX, IconLoader2 } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { AdminEvent } from "../types";

export default function CancelEventDialog({ event, onClose, onConfirm, isLoading }: { event: AdminEvent | null; onClose: () => void; onConfirm: (reason?: string) => void; isLoading?: boolean }) {
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