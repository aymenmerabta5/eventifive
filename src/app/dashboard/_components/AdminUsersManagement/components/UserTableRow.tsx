import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  IconDotsVertical,
  IconUser,
  IconMail,
  IconBuilding,
  IconTrash,
  IconShield,
} from "@tabler/icons-react";
import { ROLE_LABELS } from "../constants";
import { formatDate, getRoleBadgeVariant, getUserInitial } from "../utils";
import type { UserWithRole, UserActionHandlers } from "../types";

interface UserTableRowProps extends UserActionHandlers {
  user: UserWithRole;
}

/**
 * Maps badge variant strings to custom color classes
 *
 * This ensures consistent styling across the application.
 * The variant prop from Badge component is a string, so we map it
 * to our design system colors for role badges
 */
function getRoleStyles(variant: string): string {
  switch (variant) {
    case "default":
      return "bg-primary/10 text-primary border-primary/30";
    case "secondary":
      return "bg-secondary text-secondary-foreground border-secondary";
    case "outline":
      return "bg-muted text-muted-foreground border-border";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

/**
 * Table row component for displaying a single user
 *
 * This component displays:
 * - User avatar (initial letter in a circle)
 * - User name and email
 * - Role badge with appropriate styling
 * - Institution (if available)
 * - Registration date (relative time)
 * - Last seen time (relative time)
 * - Actions dropdown menu
 *
 * The row uses hover effects to reveal the actions menu,
 * and the role badge color is determined by the user's role
 */
export function UserTableRow({
  user,
  onViewProfile,
  onDelete,
  onChangeRole,
}: UserTableRowProps) {
  const badgeVariant = getRoleBadgeVariant(user.role);
  const roleStyles = getRoleStyles(badgeVariant);

  return (
    <TableRow
      className={cn(
        "group border-border/50",
        "transition-colors duration-200",
        "hover:bg-secondary/30",
      )}
    >
      <TableCell>
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg",
              "from-primary/10 to-chart-2/10 bg-gradient-to-br",
              "text-primary text-xs font-bold",
            )}
          >
            {getUserInitial(user.name)}
          </div>
          <div className="text-foreground font-medium">{user.name}</div>
        </div>
      </TableCell>

      <TableCell>
        <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
          <IconMail className="size-3.5" />
          <span>{user.email}</span>
        </div>
      </TableCell>

      <TableCell>
        <Badge variant="outline" className={cn("font-medium", roleStyles)}>
          {ROLE_LABELS[user.role]}
        </Badge>
      </TableCell>

      <TableCell>
        {user.institution ? (
          <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
            <IconBuilding className="size-3.5" />
            <span>{user.institution}</span>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        )}
      </TableCell>

      <TableCell>
        <div className="text-muted-foreground text-sm">
          {formatDate(user.createdAt)}
        </div>
      </TableCell>

      <TableCell>
        <div className="text-muted-foreground text-sm">
          {formatDate(user.lastSeenAt)}
        </div>
      </TableCell>

      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "size-8 opacity-0 transition-opacity group-hover:opacity-100",
                "hover:bg-secondary",
              )}
            >
              <IconDotsVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Actions
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {onViewProfile && (
              <DropdownMenuItem
                onClick={() => onViewProfile(user)}
                className="gap-2"
              >
                <IconUser className="size-4" />
                <span>View Profile</span>
              </DropdownMenuItem>
            )}
            {onChangeRole && (
              <DropdownMenuItem
                onClick={() => onChangeRole(user)}
                className="gap-2"
              >
                <IconShield className="size-4" />
                <span>Change Role</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {onDelete && (
              <DropdownMenuItem
                onClick={() => onDelete(user)}
                className="text-destructive focus:text-destructive gap-2"
              >
                <IconTrash className="text-destructive size-4" />
                <span>Delete User</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
