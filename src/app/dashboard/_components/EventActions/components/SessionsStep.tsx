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
  // Chair options (accepted speakers + communicators)
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
      className="group border-border/60 bg-card hover:border-border flex items-center gap-3 rounded-xl border p-3 transition-all hover:shadow-sm"
    >
      <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
        <DoorOpen className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-foreground truncate font-medium">{room.name}</div>
        <div className="text-muted-foreground flex items-center gap-2 text-xs">
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
        <Trash2 className="text-destructive size-4" />
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
      <div className="border-border/60 bg-card overflow-hidden rounded-2xl border shadow-sm transition-shadow hover:shadow-md">
        <Collapsible open={roomsOpen} onOpenChange={setRoomsOpen}>
          <CollapsibleTrigger asChild>
            <button className="hover:bg-muted/30 flex w-full items-center justify-between p-5 text-left transition-colors">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary ring-primary/20 flex size-10 items-center justify-center rounded-xl ring-1">
                  <Building className="size-5" />
                </div>
                <div>
                  <span className="font-display text-foreground text-lg font-semibold">
                    Rooms
                  </span>
                  <span className="bg-muted text-muted-foreground ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium">
                    {rooms.length}
                  </span>
                  <p className="text-muted-foreground text-sm">
                    Create rooms to assign sessions to specific locations
                  </p>
                </div>
              </div>
              <div className="bg-muted/50 group-hover:bg-muted flex size-8 items-center justify-center rounded-lg transition-colors">
                {roomsOpen ? (
                  <ChevronUp className="text-muted-foreground size-4" />
                ) : (
                  <ChevronDown className="text-muted-foreground size-4" />
                )}
              </div>
            </button>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="border-border/40 space-y-4 border-t p-5">
              {/* Room List */}
              {isLoadingRooms ? (
                <div className="flex items-center justify-center py-6">
                  <div className="text-muted-foreground flex items-center gap-2">
                    <div className="border-primary size-4 animate-spin rounded-full border-2 border-t-transparent" />
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
                <div className="border-border/60 flex flex-col items-center justify-center rounded-xl border border-dashed py-8 text-center">
                  <div className="bg-muted flex size-12 items-center justify-center rounded-full">
                    <DoorOpen className="text-muted-foreground size-6" />
                  </div>
                  <p className="text-foreground mt-3 text-sm font-medium">
                    No rooms created yet
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Add rooms to organize your sessions
                  </p>
                </div>
              )}

              {/* Add Room Form */}
              <div className="bg-muted/30 ring-border/50 space-y-3 rounded-xl p-4 ring-1">
                <div className="text-foreground flex items-center gap-2 text-sm font-medium">
                  <Plus className="text-primary size-4" />
                  Add New Room
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="relative">
                    <DoorOpen className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                    <Input
                      placeholder="Room Name *"
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                      disabled={isCreatingRoom}
                      className="h-10 pl-10"
                    />
                  </div>
                  <div className="relative">
                    <Hash className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
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
                    <MapPin className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
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
              Invite speakers or communicators in the previous step, and have
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
        <div className="border-border/40 bg-background h-[500px] overflow-hidden rounded-xl border">
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
