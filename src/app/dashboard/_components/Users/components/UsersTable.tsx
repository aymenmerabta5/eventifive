"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserTableRow } from "./UserTableRow";
import type { UserWithRole, UserActionHandlers } from "../types";

interface UsersTableProps extends UserActionHandlers {
  users: UserWithRole[];
}

/**
 * Table component for displaying users list
 * 
 * This component follows the same design pattern as EventsTable:
 * - Rounded container with gradient background
 * - Subtle background pattern for texture
 * - Table header with title and description
 * - Table body with user rows
 * - Footer showing user count
 * 
 * The table is responsive and uses overflow-x-auto for horizontal scrolling
 * on smaller screens, ensuring the design remains usable on all devices
 */
export function UsersTable({
  users,
  onViewProfile,
  onDelete,
  onChangeRole,
}: UsersTableProps) {
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // Filter users based on selected role
  const filteredUsers = useMemo(() => {
    if (roleFilter === "all") {
      return users;
    }
    return users.filter((user) => user.role === roleFilter);
  }, [users, roleFilter]);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/50",
        "bg-gradient-to-br from-card via-card to-card/80"
      )}
    >
      {/* Background pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Header */}
      <div className="relative border-b border-border/50 px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">
              Registered Users
            </h2>
            <p className="text-sm text-muted-foreground">
              All users registered on the platform
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="role-filter" className="text-sm text-muted-foreground">
              Filter by role:
            </label>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger id="role-filter" className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="organizer">Organizer</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="relative overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                User
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Email
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Role
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Institution
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Registered
              </TableHead>
              <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Last Seen
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <UserTableRow
                key={user.id}
                user={user}
                onViewProfile={onViewProfile}
                onDelete={onDelete}
                onChangeRole={onChangeRole}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="relative border-t border-border/50 px-6 py-3">
        <p className="text-xs text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-foreground">{filteredUsers.length}</span>{" "}
          {roleFilter !== "all" && (
            <>
              of{" "}
              <span className="font-medium text-foreground">{users.length}</span>{" "}
            </>
          )}
          user{filteredUsers.length !== 1 ? "s" : ""}
          {roleFilter !== "all" && (
            <span className="ml-1">
              ({roleFilter === "super_admin" ? "Super Admin" : roleFilter === "organizer" ? "Organizer" : "User"})
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

