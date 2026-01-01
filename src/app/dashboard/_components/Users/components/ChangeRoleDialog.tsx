"use client";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { IconShield } from "@tabler/icons-react";
import { ROLE_LABELS } from "../constants";
import type { UserWithRole } from "../types";

interface ChangeRoleDialogProps {
  user: UserWithRole | null;
  onClose: () => void;
  onConfirm: (role: "super_admin" | "organizer" | "user") => void;
  isLoading?: boolean;
}

/**
 * Change user role dialog
 * 
 * This component allows admins to change a user's role:
 * - Displays current user info
 * - Dropdown to select new role
 * - Confirmation button
 * 
 * The role selection uses a Select component for better UX,
 * and shows the current role as the default value.
 */
export function ChangeRoleDialog({
  user,
  onClose,
  onConfirm,
  isLoading = false,
}: ChangeRoleDialogProps) {
  const [selectedRole, setSelectedRole] = React.useState<
    "super_admin" | "organizer" | "user" | ""
  >(user?.role ?? "");

  React.useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
    }
  }, [user]);

  const handleConfirm = () => {
    if (selectedRole && selectedRole !== user?.role) {
      onConfirm(selectedRole);
    }
  };

  const hasChanged = selectedRole !== user?.role;

  return (
    <Dialog open={!!user} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Change User Role
          </DialogTitle>
          <DialogDescription>
            Modify the access level for this user account.
          </DialogDescription>
        </DialogHeader>

        {/* User information */}
        <div className="space-y-4 border-y border-border py-4">
          <div className="space-y-1.5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              User
            </p>
            <p className="text-sm font-medium text-foreground">
              {user?.name}
            </p>
            <p className="text-sm text-muted-foreground">
              {user?.email}
            </p>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Current Role
            </p>
            <p className="text-sm font-medium text-foreground">
              {user && ROLE_LABELS[user.role]}
            </p>
          </div>
        </div>

        {/* Role selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            New Role
          </label>
          <Select
            value={selectedRole}
            onValueChange={(value) =>
              setSelectedRole(value as "super_admin" | "organizer" | "user")
            }
            disabled={isLoading}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">
                {ROLE_LABELS.user}
              </SelectItem>
              <SelectItem value="organizer">
                {ROLE_LABELS.organizer}
              </SelectItem>
              <SelectItem value="super_admin">
                {ROLE_LABELS.super_admin}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading || !hasChanged}
            className="gap-2 sm:w-auto"
          >
            {isLoading ? (
              "Updating..."
            ) : (
              <>
                <IconShield className="size-4" />
                Confirm Change
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

