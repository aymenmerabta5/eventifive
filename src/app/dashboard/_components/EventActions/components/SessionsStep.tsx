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
  Pencil,
  ChevronDown,
  ChevronUp,
  Calendar as CalendarIcon,
  Users,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { CalendarView } from "@/components/calendar";
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
      <Collapsible open={roomsOpen} onOpenChange={setRoomsOpen}>
        <div className="rounded-lg border">
          <CollapsibleTrigger asChild>
            <button className="hover:bg-muted/50 flex w-full items-center justify-between p-4 text-left transition-colors">
              <div className="flex items-center gap-2">
                <MapPin className="size-4" />
                <span className="text-sm font-medium">
                  Rooms ({rooms.length})
                </span>
              </div>
              {roomsOpen ? (
                <ChevronUp className="size-4" />
              ) : (
                <ChevronDown className="size-4" />
              )}
            </button>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="space-y-4 border-t p-4">
              <p className="text-muted-foreground text-xs">
                Create rooms to assign sessions to specific locations.
              </p>

              {/* Room List */}
              {isLoadingRooms ? (
                <div className="text-muted-foreground text-sm">
                  Loading rooms...
                </div>
              ) : rooms.length > 0 ? (
                <div className="space-y-2">
                  {rooms.map((room) => (
                    <div
                      key={room.id}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div>
                        <div className="text-sm font-medium">{room.name}</div>
                        <div className="text-muted-foreground text-xs">
                          {room.location && <span>{room.location}</span>}
                          {room.location && room.capacity && <span> • </span>}
                          {room.capacity && (
                            <span>Capacity: {room.capacity}</span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteRoom(room.id)}
                        disabled={isDeletingRoom}
                      >
                        <Trash2 className="text-destructive size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground py-2 text-sm">
                  No rooms created yet.
                </div>
              )}

              {/* Add Room Form */}
              <div className="space-y-3 border-t pt-2">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Room Name *</Label>
                    <Input
                      placeholder="Main Hall"
                      value={newRoomName}
                      onChange={(e) => setNewRoomName(e.target.value)}
                      disabled={isCreatingRoom}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Capacity</Label>
                    <Input
                      type="number"
                      placeholder="100"
                      value={newRoomCapacity}
                      onChange={(e) => setNewRoomCapacity(e.target.value)}
                      disabled={isCreatingRoom}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Location</Label>
                    <Input
                      placeholder="Building A, Floor 2"
                      value={newRoomLocation}
                      onChange={(e) => setNewRoomLocation(e.target.value)}
                      disabled={isCreatingRoom}
                    />
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={handleCreateRoom}
                  disabled={isCreatingRoom || !newRoomName.trim()}
                >
                  <Plus className="mr-2 size-4" />
                  Add Room
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Chair Options Info */}
      {chairOptions.length === 0 && (
        <div className="rounded-lg border border-dashed p-4">
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Users className="size-4" />
            <span>
              No speakers or committee members available to assign as session
              chair. Invite and have them accept first on the previous step.
            </span>
          </div>
        </div>
      )}

      {/* Calendar Section */}
      <div className="rounded-lg border">
        <div className="flex items-center gap-2 border-b p-4">
          <CalendarIcon className="size-4" />
          <span className="text-sm font-medium">
            Session Schedule ({sessions.length} sessions)
          </span>
        </div>
        <div className="h-[500px]">
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
      </div>
    </div>
  );
}
