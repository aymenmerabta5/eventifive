"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  MapPin,
  ChevronDown,
  ChevronUp,
  Calendar as CalendarIcon,
  Users,
  DoorOpen,
  Hash,
  Building,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { CalendarView } from "@/components/calendar";
import { FormSection } from "./FormSection";
import type {
  CreateSessionData,
  UpdateSessionData,
  ChairOption,
} from "@/components/calendar";
import type { Room } from "@/server/db/schema";

interface SessionsStepProps {
  eventId: string;
  eventStartDate: Date;
  eventEndDate: Date;
  // Room management
  rooms: Room[];
  isLoadingRooms: boolean;
  onCreateRoom: (data: {
    name: string;
    capacity?: number;
    location?: string;
  }) => Promise<unknown>;
  onDeleteRoom: (roomId: number) => Promise<unknown>;
  isCreatingRoom: boolean;
  isDeletingRoom: boolean;
  // Session management
  sessions: import("@/components/calendar").SessionWithRelations[];
  isLoadingSessions: boolean;
  onCreateSession: (data: CreateSessionData) => Promise<unknown>;
  onUpdateSession: (data: UpdateSessionData) => Promise<unknown>;
  onDeleteSession: (sessionId: string) => Promise<unknown>;
  // Chair options (accepted speakers + committee)
  chairOptions: ChairOption[];
}

interface RoomCardProps {
  room: Room;
  onDelete: () => void;
  isDeleting: boolean;
}

function RoomCard({ room, onDelete, isDeleting }: RoomCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3 transition-all hover:border-border hover:shadow-sm"
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <DoorOpen className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate font-medium text-foreground">{room.name}</div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {room.location && (
            <span className="flex items-center gap-1">
              <MapPin className="size-3" />
              {room.location}
            </span>
          )}
          {room.location && room.capacity && <span>•</span>}
          {room.capacity && (
            <span className="flex items-center gap-1">
              <Users className="size-3" />
              {room.capacity}
            </span>
          )}
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
        disabled={isDeleting}
        className="size-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
      >
        <Trash2 className="size-4 text-destructive" />
      </Button>
    </motion.div>
  );
}

export function SessionsStep({
  eventId,
  eventStartDate,
  eventEndDate,
  rooms,
  isLoadingRooms,
  onCreateRoom,
  onDeleteRoom,
  isCreatingRoom,
  isDeletingRoom,
  sessions,
  isLoadingSessions,
  onCreateSession,
  onUpdateSession,
  onDeleteSession,
  chairOptions,
}: SessionsStepProps) {
  const [roomsOpen, setRoomsOpen] = useState(true);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomCapacity, setNewRoomCapacity] = useState("");
  const [newRoomLocation, setNewRoomLocation] = useState("");

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) {
      toast.error("Room name is required");
      return;
    }
    try {
      await onCreateRoom({
        name: newRoomName.trim(),
        capacity: newRoomCapacity ? parseInt(newRoomCapacity, 10) : undefined,
        location: newRoomLocation.trim() || undefined,
      });
      setNewRoomName("");
      setNewRoomCapacity("");
      setNewRoomLocation("");
    } catch {
      // Error is handled by the hook
    }
  };

  const handleDeleteRoom = async (roomId: number) => {
    try {
      await onDeleteRoom(roomId);
    } catch {
      // Error is handled by the hook
    }
  };

  const handleCreateSession = async (data: CreateSessionData) => {
    try {
      await onCreateSession(data);
    } catch {
      // Error is handled by the hook
    }
  };

  const handleUpdateSession = async (data: UpdateSessionData) => {
    try {
      await onUpdateSession(data);
    } catch {
      // Error is handled by the hook
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await onDeleteSession(sessionId);
    } catch {
      // Error is handled by the hook
    }
  };

  return (
    <div className="space-y-6">
      {/* Rooms Section - Collapsible */}
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-shadow hover:shadow-md">
        <Collapsible open={roomsOpen} onOpenChange={setRoomsOpen}>
          <CollapsibleTrigger asChild>
            <button className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                  <Building className="size-5" />
                </div>
                <div>
                  <span className="font-display text-lg font-semibold text-foreground">
                    Rooms
                  </span>
                  <span className="ml-2 inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {rooms.length}
                  </span>
                  <p className="text-sm text-muted-foreground">
                    Create rooms to assign sessions to specific locations
                  </p>
                </div>
              </div>
              <div className="flex size-8 items-center justify-center rounded-lg bg-muted/50 transition-colors group-hover:bg-muted">
                {roomsOpen ? (
                  <ChevronUp className="size-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="size-4 text-muted-foreground" />
                )}
              </div>
            </button>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="space-y-4 border-t border-border/40 p-5">
              {/* Room List */}
              {isLoadingRooms ? (
                <div className="flex items-center justify-center py-6">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span>Loading rooms...</span>
                  </div>
                </div>
              ) : rooms.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <AnimatePresence mode="popLayout">
                    {rooms.map((room) => (
                      <RoomCard
                        key={room.id}
                        room={room}
                        onDelete={() => handleDeleteRoom(room.id)}
                        isDeleting={isDeletingRoom}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 py-8 text-center">
                  <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                    <DoorOpen className="size-6 text-muted-foreground" />
                  </div>
                  <p className="mt-3 text-sm font-medium text-foreground">
                    No rooms created yet
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Add rooms to organize your sessions
                  </p>
                </div>
              )}

              {/* Add Room Form */}
              <div className="space-y-3 rounded-xl bg-muted/30 p-4 ring-1 ring-border/50">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Plus className="size-4 text-primary" />
                  Add New Room
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="relative">
                    <DoorOpen className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Room Name *"
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                      disabled={isCreatingRoom}
                      className="h-10 pl-10"
                    />
                  </div>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="Capacity"
                      value={newRoomCapacity}
                      onChange={(e) => setNewRoomCapacity(e.target.value)}
                      disabled={isCreatingRoom}
                      className="h-10 pl-10"
                    />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Location"
                      value={newRoomLocation}
                      onChange={(e) => setNewRoomLocation(e.target.value)}
                      disabled={isCreatingRoom}
                      className="h-10 pl-10"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleCreateRoom}
                  disabled={isCreatingRoom || !newRoomName.trim()}
                  className="w-full sm:w-auto"
                >
                  <Plus className="mr-2 size-4" />
                  {isCreatingRoom ? "Creating..." : "Add Room"}
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Chair Options Info */}
      {chairOptions.length === 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-amber-500/30 bg-amber-500/5 p-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Users className="size-5" />
          </div>
          <div className="text-sm">
            <p className="font-medium text-amber-700 dark:text-amber-400">
              No chairs available
            </p>
            <p className="text-amber-600/80 dark:text-amber-400/70">
              Invite speakers or committee members in the previous step, and have
              them accept first.
            </p>
          </div>
        </div>
      )}

      {/* Calendar Section */}
      <FormSection
        icon={<CalendarIcon className="size-5" />}
        title="Session Schedule"
        description={`${sessions.length} session${sessions.length !== 1 ? "s" : ""} scheduled`}
        variant="highlight"
      >
        <div className="h-[500px] overflow-hidden rounded-xl border border-border/40 bg-background">
          <CalendarView
            eventId={eventId}
            sessions={sessions}
            rooms={rooms}
            eventStartDate={eventStartDate}
            eventEndDate={eventEndDate}
            chairOptions={chairOptions}
            onCreateSession={handleCreateSession}
            onUpdateSession={handleUpdateSession}
            onDeleteSession={handleDeleteSession}
            isEditable={true}
            isLoading={isLoadingSessions}
          />
        </div>
      </FormSection>
    </div>
  );
}
