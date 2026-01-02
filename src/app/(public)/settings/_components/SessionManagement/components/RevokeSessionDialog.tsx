"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  MapPin,
  Clock,
  LogOut,
} from "lucide-react";
import { formatSessionDate, type DeviceType } from "@/lib/session-parser";
import type { ParsedSession, DialogVariant } from "../types";

interface RevokeSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: ParsedSession | null;
  variant: DialogVariant;
  isRevoking: boolean;
  onConfirm: () => Promise<void>;
  otherSessionsCount: number;
}

function getDeviceIcon(deviceType: DeviceType) {
  switch (deviceType) {
    case "mobile":
      return Smartphone;
    case "tablet":
      return Tablet;
    case "desktop":
      return Monitor;
    default:
      return Globe;
  }
}

export function RevokeSessionDialog({
  open,
  onOpenChange,
  session,
  variant,
  isRevoking,
  onConfirm,
  otherSessionsCount,
}: RevokeSessionDialogProps) {
  const isSingle = variant === "single" && session;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader className="text-center sm:text-left">
          <div className="bg-destructive/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full sm:mx-0">
            <AlertTriangle className="text-destructive h-6 w-6" />
          </div>
          <DialogTitle>
            {isSingle ? "Revoke this session?" : "Sign out everywhere else?"}
          </DialogTitle>
          <DialogDescription>
            {isSingle
              ? "This device will be signed out immediately and will need to sign in again."
              : `This will sign out ${otherSessionsCount} other ${otherSessionsCount === 1 ? "session" : "sessions"}. Those devices will need to sign in again.`}
          </DialogDescription>
        </DialogHeader>

        {/* Session Details for Single Revoke */}
        {isSingle && (
          <div className="py-2">
            <div className="border-border/50 bg-muted/30 flex items-center gap-4 rounded-xl border p-4">
              {(() => {
                const DeviceIcon = getDeviceIcon(session.deviceType);
                return (
                  <div className="bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                    <DeviceIcon className="text-muted-foreground h-5 w-5" />
                  </div>
                );
              })()}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{session.deviceLabel}</p>
                <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                  {session.ipAddress && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {session.ipAddress}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatSessionDate(session.updatedAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex-row gap-3 sm:justify-end">
          <DialogClose asChild>
            <Button variant="outline" className="flex-1" disabled={isRevoking}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={onConfirm}
            disabled={isRevoking}
          >
            {isRevoking ? (
              "Signing out..."
            ) : (
              <>
                <LogOut className="mr-2 h-4 w-4" />
                {isSingle ? "Revoke" : "Sign out all"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
