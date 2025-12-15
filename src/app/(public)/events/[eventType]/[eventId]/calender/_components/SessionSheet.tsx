"use client";

import { ExternalLink, MapPin, Clock, Users } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { Session } from "@/mock-data/sessions";

interface SessionSheetProps {
  session: Session | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SessionSheet({ session, open, onOpenChange }: SessionSheetProps) {
  if (!session) return null;

  const timeStr = `${session.startTime} - ${session.endTime}${
    session.timezone ? ` (${session.timezone})` : ""
  }`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{session.title}</SheetTitle>
          <SheetDescription>{session.description}</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4 p-6">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Clock className="size-4" />
            <span>{timeStr}</span>
          </div>

          {session.location && (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <MapPin className="size-4" />
              <span>{session.location}</span>
            </div>
          )}

          {session.speakers.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Users className="size-4" />
                <span>Speakers</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {session.speakers.map((speaker, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-muted px-2 py-1 rounded-md"
                  >
                    <Avatar className="size-5">
                      <AvatarImage
                        src={`https://api.dicebear.com/9.x/glass/svg?seed=${speaker}`}
                      />
                    </Avatar>
                    <span className="text-xs">{speaker}</span>
                  </div>
                ))}
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
        </div>
      </SheetContent>
    </Sheet>
  );
}
