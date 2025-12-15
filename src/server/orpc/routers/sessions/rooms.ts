import { protectedProcedure, publicProcedure } from "../../index";
import {
  createRoomSchema,
  updateRoomSchema,
  deleteRoomSchema,
  listRoomsSchema,
} from "@/lib/schemas/sessions";
import { db } from "@/server/db";
import { room, event } from "@/server/db/schema";
import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { eq, and } from "drizzle-orm";

// =====================
// CREATE ROOM
// =====================
const createRoomOutputSchema = z.object({
  status: z.enum(["success", "error"]),
  message: z.string(),
  room: z
    .object({
      id: z.number(),
      eventId: z.string(),
      name: z.string(),
      capacity: z.number().nullable(),
      location: z.string().nullable(),
    })
    .optional(),
});

export const createRoomRouter = protectedProcedure
  .route({ method: "POST", path: "/sessions/rooms/create" })
  .input(createRoomSchema)
  .output(createRoomOutputSchema)
  .handler(async ({ context, input }) => {
    const { session } = context;

    if (!session?.user) {
      throw new ORPCError("UNAUTHORIZED");
    }

    // Verify user is the event organizer
    const eventData = await db
      .select({ organizerId: event.organizerId })
      .from(event)
      .where(eq(event.id, input.eventId))
      .limit(1);

    if (eventData.length === 0) {
      throw new ORPCError("NOT_FOUND", { message: "Event not found" });
    }

    if (eventData[0]!.organizerId !== session.user.id) {
      throw new ORPCError("FORBIDDEN", {
        message: "Only the event organizer can create rooms",
      });
    }

    try {
      const [newRoom] = await db
        .insert(room)
        .values({
          eventId: input.eventId,
          name: input.name,
          capacity: input.capacity ?? null,
          location: input.location ?? null,
        })
        .returning();

      return {
        status: "success" as const,
        message: "Room created successfully",
        room: newRoom,
      };
    } catch (error) {
      console.error("Failed to create room:", error);
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to create room",
      });
    }
  });

// =====================
// UPDATE ROOM
// =====================
const updateRoomOutputSchema = z.object({
  status: z.enum(["success", "error"]),
  message: z.string(),
  room: z
    .object({
      id: z.number(),
      eventId: z.string(),
      name: z.string(),
      capacity: z.number().nullable(),
      location: z.string().nullable(),
    })
    .optional(),
});

export const updateRoomRouter = protectedProcedure
  .route({ method: "POST", path: "/sessions/rooms/update" })
  .input(updateRoomSchema)
  .output(updateRoomOutputSchema)
  .handler(async ({ context, input }) => {
    const { session } = context;

    if (!session?.user) {
      throw new ORPCError("UNAUTHORIZED");
    }

    // Get room and verify ownership
    const roomData = await db
      .select({
        room: room,
        organizerId: event.organizerId,
      })
      .from(room)
      .innerJoin(event, eq(room.eventId, event.id))
      .where(eq(room.id, input.roomId))
      .limit(1);

    if (roomData.length === 0) {
      throw new ORPCError("NOT_FOUND", { message: "Room not found" });
    }

    if (roomData[0]!.organizerId !== session.user.id) {
      throw new ORPCError("FORBIDDEN", {
        message: "Only the event organizer can update rooms",
      });
    }

    try {
      const updateData: Partial<typeof room.$inferInsert> = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.capacity !== undefined) updateData.capacity = input.capacity;
      if (input.location !== undefined) updateData.location = input.location;

      const [updatedRoom] = await db
        .update(room)
        .set(updateData)
        .where(eq(room.id, input.roomId))
        .returning();

      return {
        status: "success" as const,
        message: "Room updated successfully",
        room: updatedRoom,
      };
    } catch (error) {
      console.error("Failed to update room:", error);
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to update room",
      });
    }
  });

// =====================
// DELETE ROOM
// =====================
const deleteRoomOutputSchema = z.object({
  status: z.enum(["success", "error"]),
  message: z.string(),
});

export const deleteRoomRouter = protectedProcedure
  .route({ method: "POST", path: "/sessions/rooms/delete" })
  .input(deleteRoomSchema)
  .output(deleteRoomOutputSchema)
  .handler(async ({ context, input }) => {
    const { session } = context;

    if (!session?.user) {
      throw new ORPCError("UNAUTHORIZED");
    }

    // Get room and verify ownership
    const roomData = await db
      .select({
        room: room,
        organizerId: event.organizerId,
      })
      .from(room)
      .innerJoin(event, eq(room.eventId, event.id))
      .where(eq(room.id, input.roomId))
      .limit(1);

    if (roomData.length === 0) {
      throw new ORPCError("NOT_FOUND", { message: "Room not found" });
    }

    if (roomData[0]!.organizerId !== session.user.id) {
      throw new ORPCError("FORBIDDEN", {
        message: "Only the event organizer can delete rooms",
      });
    }

    try {
      await db.delete(room).where(eq(room.id, input.roomId));

      return {
        status: "success" as const,
        message: "Room deleted successfully",
      };
    } catch (error) {
      console.error("Failed to delete room:", error);
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to delete room",
      });
    }
  });

// =====================
// LIST ROOMS
// =====================
const listRoomsOutputSchema = z.object({
  rooms: z.array(
    z.object({
      id: z.number(),
      eventId: z.string(),
      name: z.string(),
      capacity: z.number().nullable(),
      location: z.string().nullable(),
    })
  ),
});

export const listRoomsRouter = publicProcedure
  .route({ method: "GET", path: "/sessions/rooms/list" })
  .input(listRoomsSchema)
  .output(listRoomsOutputSchema)
  .handler(async ({ input }) => {
    try {
      const rooms = await db
        .select()
        .from(room)
        .where(eq(room.eventId, input.eventId));

      return { rooms };
    } catch (error) {
      console.error("Failed to list rooms:", error);
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to list rooms",
      });
    }
  });
