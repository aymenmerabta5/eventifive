"use client";

import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  return (
    <div
      className={cn(
        "border-border/50 relative overflow-hidden rounded-2xl border",
        "from-card via-card to-card/80 bg-gradient-to-br",
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
      <div className="border-border/50 relative border-b px-6 py-4">
        <div>
          <h2 className="font-display text-foreground text-lg font-semibold">
            Registered Users
          </h2>
          <p className="text-muted-foreground text-sm">
            All users registered on the platform
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="relative overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                User
              </TableHead>
              <TableHead className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                Email
              </TableHead>
              <TableHead className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                Role
              </TableHead>
              <TableHead className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                Institution
              </TableHead>
              <TableHead className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                Registered
              </TableHead>
              <TableHead className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                Last Seen
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
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
      <div className="border-border/50 relative border-t px-6 py-3">
        <p className="text-muted-foreground text-xs">
          Showing{" "}
          <span className="text-foreground font-medium">{users.length}</span>{" "}
          user{users.length !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}
