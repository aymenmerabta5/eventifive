"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type {
  SessionDialogProps,
  CreateSessionData,
  UpdateSessionData,
} from "./types";
import { formatTimeString } from "./CalendarUtils";

export function SessionDialog({
  open,
  onOpenChange,
  eventId,
  eventStartDate,
  eventEndDate,
  rooms,
  chairOptions,
  session,
  onSubmit,
  isSubmitting = false,
}: SessionDialogProps) {
  const isEditMode = !!session;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [roomId, setRoomId] = useState<string>("");
  const [chairId, setChairId] = useState<string>("");
  const [meetingLink, setMeetingLink] = useState("");
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [timeError, setTimeError] = useState<string | null>(null);

  // Validate time whenever start or end time changes
  useEffect(() => {
    if (startTime && endTime) {
      if (endTime <= startTime) {
        setTimeError("End time must be after start time");
      } else {
        setTimeError(null);
      }
    } else {
      setTimeError(null);
    }
  }, [startTime, endTime]);

  // Reset form when dialog opens/closes or session changes
  useEffect(() => {
    if (open) {
      if (session) {
        // Edit mode - populate with existing data
        setTitle(session.title);
        setDescription(session.description || "");
        setDate(new Date(session.startAt));
        setStartTime(formatTimeString(new Date(session.startAt)));
        setEndTime(formatTimeString(new Date(session.endAt)));
        setRoomId(session.roomId?.toString() || "");
        setChairId(session.chairId || "");
        setMeetingLink(session.meetingLink || "");
      } else {
        // Create mode - reset to defaults
        setTitle("");
        setDescription("");
        setDate(eventStartDate);
        setStartTime("09:00");
        setEndTime("10:00");
        setRoomId("");
        setChairId("");
        setMeetingLink("");
      }
    }
  }, [open, session, eventStartDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !date || !startTime || !endTime || timeError) {
      return;
    }

    // Construct full datetime strings
    const dateStr = format(date, "yyyy-MM-dd");
    const startAt = `${dateStr}T${startTime}:00`;
    const endAt = `${dateStr}T${endTime}:00`;

    if (isEditMode && session) {
      const updateData: UpdateSessionData = {
        sessionId: session.id,
        title,
        description: description || null,
        startAt,
        endAt,
        roomId: roomId ? parseInt(roomId, 10) : null,
        chairId: chairId || null,
        meetingLink: meetingLink || null,
      };
      onSubmit(updateData);
    } else {
      const createData: CreateSessionData = {
        eventId,
        title,
        description: description || undefined,
        startAt,
        endAt,
        roomId: roomId ? parseInt(roomId, 10) : null,
        chairId: chairId || null,
        meetingLink: meetingLink || null,
      };
      onSubmit(createData);
    }
  };

  // Disable dates outside event range
  const isDateDisabled = (date: Date) => {
    const dateOnly = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );
    const startOnly = new Date(
      eventStartDate.getFullYear(),
      eventStartDate.getMonth(),
      eventStartDate.getDate(),
    );
    const endOnly = new Date(
      eventEndDate.getFullYear(),
      eventEndDate.getMonth(),
      eventEndDate.getDate(),
    );
    return dateOnly < startOnly || dateOnly > endOnly;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Session" : "Create Session"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the session details below."
              : "Add a new session to the event schedule."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Session title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Session description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label>Date *</Label>
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 size-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(selectedDate: Date | undefined) => {
                      setDate(selectedDate);
                      setDatePickerOpen(false);
                    }}
                    disabled={isDateDisabled}
                    defaultMonth={eventStartDate}
                  />
                </PopoverContent>
              </Popover>
              <p className="text-muted-foreground text-xs">
                Event runs from {format(eventStartDate, "MMM d")} to{" "}
                {format(eventEndDate, "MMM d, yyyy")}
              </p>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="startTime">Start Time *</Label>
                  <div className="relative">
                    <Clock className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                    <Input
                      id="startTime"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className={cn("pl-9", timeError && "border-destructive")}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="endTime">End Time *</Label>
                  <div className="relative">
                    <Clock className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                    <Input
                      id="endTime"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className={cn("pl-9", timeError && "border-destructive")}
                      required
                    />
                  </div>
                </div>
              </div>
              {timeError && (
                <p className="text-destructive text-xs">{timeError}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="room">Room</Label>
              <Select
                value={roomId || "none"}
                onValueChange={(value) =>
                  setRoomId(value === "none" ? "" : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a room (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No room</SelectItem>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={room.id.toString()}>
                      {room.name}
                      {room.location && ` (${room.location})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="chair">Session Chair</Label>
              <Select
                value={chairId || "none"}
                onValueChange={(value) =>
                  setChairId(value === "none" ? "" : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a chair (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No chair</SelectItem>
                  {chairOptions.map((chair) => (
                    <SelectItem key={chair.id} value={chair.id}>
                      {chair.name} ({chair.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {chairOptions.length === 0 && (
                <p className="text-muted-foreground text-xs">
                  Invite speakers or committee members first to assign them as
                  chair.
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="meetingLink">Meeting Link</Label>
              <Input
                id="meetingLink"
                type="url"
                placeholder="https://meet.google.com/... (optional)"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !!timeError}>
              {isSubmitting
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                  ? "Update Session"
                  : "Create Session"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
