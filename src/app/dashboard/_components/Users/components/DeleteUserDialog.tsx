"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { IconAlertTriangle, IconTrash } from "@tabler/icons-react";
import type { UserWithRole } from "../types";

interface DeleteUserDialogProps {
  user: UserWithRole | null;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

/**
 * Delete user confirmation dialog
 * 
 * This component follows the same pattern as DeleteEventDialog:
 * - Warning icon and message
 * - User name display
 * - Destructive action button
 * - Loading state handling
 * 
 * The dialog prevents accidental deletions by requiring explicit confirmation.
 * It displays the user's name and email to make sure the admin is deleting
 * the correct user.
 */
export function DeleteUserDialog({
  user,
  onClose,
  onConfirm,
  isLoading = false,
}: DeleteUserDialogProps) {
  return (
    <Dialog open={!!user} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        {/* Warning icon */}
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-destructive/10">
          <IconAlertTriangle className="size-7 text-destructive" />
        </div>

        <DialogHeader className="text-center">
          <DialogTitle className="font-display text-xl">
            Delete user
          </DialogTitle>
          <DialogDescription className="text-center">
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">
              {user?.name} ({user?.email})
            </span>
            ? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {/* Warning box */}
        <div
          className={cn(
            "rounded-xl border border-destructive/20",
            "bg-destructive/5 p-4"
          )}
        >
          <p className="text-center text-sm text-muted-foreground">
            All user data including sessions, accounts, and role assignments
            will be permanently removed.
          </p>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="w-full border-border/50 sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full gap-2 sm:w-auto"
          >
            <IconTrash className="size-4" />
            {isLoading ? "Deleting..." : "Delete User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

