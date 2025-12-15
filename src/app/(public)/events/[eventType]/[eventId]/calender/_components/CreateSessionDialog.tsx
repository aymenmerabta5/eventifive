"use client";

import { useState } from "react";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface CreateSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateSessionDialog({
  open,
  onOpenChange,
}: CreateSessionDialogProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [timezone, setTimezone] = useState("");
  const [speakers, setSpeakers] = useState("");
  const [location, setLocation] = useState("");
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !date || !startTime || !endTime) {
      return;
    }

    // For now just log the session - in a real app this would save to database
    const speakersList = speakers
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    console.log("Creating session:", {
      title,
      date: format(date, "yyyy-MM-dd"),
      startTime,
      endTime,
      speakers: speakersList,
      meetingLink: meetingLink || undefined,
      timezone: timezone || undefined,
      location: location || undefined,
    });

    // Reset form
    setTitle("");
    setDate(new Date());
    setStartTime("");
    setEndTime("");
    setMeetingLink("");
    setTimezone("");
    setSpeakers("");
    setLocation("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Session</DialogTitle>
          <DialogDescription>
            Add a new session to the calendar. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Session title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>Date</Label>
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
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
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startTime">Start Time</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="endTime">End Time</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="endTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="speakers">Speakers (comma-separated)</Label>
              <Input
                id="speakers"
                placeholder="Dr. Jane Doe, Prof. John Smith"
                value={speakers}
                onChange={(e) => setSpeakers(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location">Location (optional)</Label>
              <Input
                id="location"
                placeholder="Main Hall, Room 101"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="meetingLink">Meeting Link (optional)</Label>
              <Input
                id="meetingLink"
                type="url"
                placeholder="https://meet.google.com/..."
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="timezone">Timezone (optional)</Label>
              <Input
                id="timezone"
                placeholder="GMT+1"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Session</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
