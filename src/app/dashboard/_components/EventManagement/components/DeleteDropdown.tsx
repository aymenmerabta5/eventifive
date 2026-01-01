import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { IconDotsVertical, IconTrash } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { AdminEvent, EventActionHandlers } from "../../MyEvents/types";

interface DeleteDropdownProps {
  event: AdminEvent;
  onDelete?: (event: AdminEvent) => void;
}

export function DeleteDropdown({ event, onDelete }: DeleteDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "size-8 opacity-0 transition-opacity group-hover:opacity-100",
            "hover:bg-secondary"
          )}
        >
          <IconDotsVertical className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={() => onDelete && onDelete(event)}
          className="gap-2 text-destructive focus:text-destructive"
        >
          <IconTrash className="size-4" />
          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
