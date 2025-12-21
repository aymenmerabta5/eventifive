"use client";

import {
  ExternalLink,
  MapPin,
  Clock,
  User,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatTimeRange } from "./CalendarUtils";
import type { SessionSheetProps } from "./types";

export function SessionSheet({
  session,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  isEditable = false,
}: SessionSheetProps) {
  if (!session) return null;

  const timeStr = formatTimeRange(session.startAt, session.endAt);
  const location = session.room?.location || session.room?.name;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{session.title}</SheetTitle>
          <SheetDescription>{session.description}</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4 p-6">
          <div className="text-muted-foreground flex items-center gap-3 text-sm">
            <Clock className="size-4" />
            <span>{timeStr}</span>
          </div>

          {location && (
            <div className="text-muted-foreground flex items-center gap-3 text-sm">
              <MapPin className="size-4" />
              <span>{location}</span>
            </div>
          )}

          {session.room && (
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-muted-foreground mb-1 text-xs font-medium">
                Room
              </p>
              <p className="text-sm font-medium">{session.room.name}</p>
              {session.room.capacity && (
                <p className="text-muted-foreground text-xs">
                  Capacity: {session.room.capacity}
                </p>
              )}
            </div>
          )}

          {session.chair && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <User className="size-4" />
                <span>Chair</span>
              </div>
              <div className="bg-muted flex items-center gap-2 rounded-md px-3 py-2">
                <Avatar className="size-8">
                  {session.chair.image ? (
                    <AvatarImage
                      src={session.chair.image}
                      alt={session.chair.name}
                    />
                  ) : (
                    <AvatarFallback>
                      {session.chair.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {session.chair.name}
                  </p>
                  <p className="text-muted-foreground truncate text-xs">
                    {session.chair.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {session.meetingLink && (
            <Button className="w-full" asChild>
              <a
                href={session.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                Join Meeting
                <ExternalLink className="ml-2 size-4" />
              </a>
            </Button>
          )}

          {isEditable && (
            <div className="flex gap-2 border-t pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  onEdit?.();
                  onOpenChange(false);
                }}
              >
                <Pencil className="mr-2 size-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => {
                  onDelete?.();
                  onOpenChange(false);
                }}
              >
                <Trash2 className="mr-2 size-4" />
                Delete
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
