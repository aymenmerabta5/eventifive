import { protectedProcedure, publicProcedure } from "../../index";
import {
  createSessionSchema,
  updateSessionSchema,
  deleteSessionSchema,
  listSessionsSchema,
  getSessionSchema,
} from "@/lib/schemas/sessions";
import { db } from "@/server/db";
import { programSession, event, room, user } from "@/server/db/schema";
import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

// =====================
// SESSION OUTPUT SCHEMA (shared)
// =====================
const sessionSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  startAt: z.date(),
  endAt: z.date(),
  roomId: z.number().nullable(),
  chairId: z.string().nullable(),
  meetingLink: z.string().nullable(),
});

const sessionWithRelationsSchema = sessionSchema.extend({
  room: z
    .object({
      id: z.number(),
      name: z.string(),
      capacity: z.number().nullable(),
      location: z.string().nullable(),
    })
    .nullable(),
  chair: z
    .object({
      id: z.string(),
      name: z.string(),
      email: z.string(),
      image: z.string().nullable(),
    })
    .nullable(),
});

// =====================
// CREATE SESSION
// =====================
const createSessionOutputSchema = z.object({
  status: z.enum(["success", "error"]),
  message: z.string(),
  session: sessionSchema.optional(),
});

export const createSessionRouter = protectedProcedure
  .route({ method: "POST", path: "/sessions/create" })
  .input(createSessionSchema)
  .output(createSessionOutputSchema)
  .handler(async ({ context, input }) => {
    const { session } = context;

    if (!session?.user) {
      throw new ORPCError("UNAUTHORIZED");
    }

    // Get event and verify ownership
    const eventData = await db
      .select({
        organizerId: event.organizerId,
        startDate: event.startDate,
        endDate: event.endDate,
      })
      .from(event)
      .where(eq(event.id, input.eventId))
      .limit(1);

    if (eventData.length === 0) {
      throw new ORPCError("NOT_FOUND", { message: "Event not found" });
    }

    const eventRow = eventData[0]!;
    if (eventRow.organizerId !== session.user.id) {
      throw new ORPCError("FORBIDDEN", {
        message: "Only the event organizer can create sessions",
      });
    }

    // Validate session is within event date range
    const sessionStart = new Date(input.startAt);
    const sessionEnd = new Date(input.endAt);
    const eventStart = new Date(eventRow.startDate);
    const eventEnd = new Date(eventRow.endDate);

    // Set event end to end of day for comparison
    eventEnd.setHours(23, 59, 59, 999);

    if (sessionStart < eventStart || sessionEnd > eventEnd) {
      throw new ORPCError("BAD_REQUEST", {
        message: "Session must be within the event date range",
      });
    }

    try {
      const sessionId = randomUUID();

      const [newSession] = await db
        .insert(programSession)
        .values({
          id: sessionId,
          eventId: input.eventId,
          title: input.title,
          description: input.description ?? null,
          startAt: sessionStart,
          endAt: sessionEnd,
          roomId: input.roomId ?? null,
          chairId: input.chairId ?? null,
          meetingLink: input.meetingLink ?? null,
        })
        .returning();

      return {
        status: "success" as const,
        message: "Session created successfully",
        session: newSession,
      };
    } catch (error) {
      console.error("Failed to create session:", error);
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to create session",
      });
    }
  });

// =====================
// UPDATE SESSION
// =====================
const updateSessionOutputSchema = z.object({
  status: z.enum(["success", "error"]),
  message: z.string(),
  session: sessionSchema.optional(),
});

export const updateSessionRouter = protectedProcedure
  .route({ method: "POST", path: "/sessions/update" })
  .input(updateSessionSchema)
  .output(updateSessionOutputSchema)
  .handler(async ({ context, input }) => {
    const { session } = context;

    if (!session?.user) {
      throw new ORPCError("UNAUTHORIZED");
    }

    // Get session and verify ownership
    const sessionData = await db
      .select({
        session: programSession,
        organizerId: event.organizerId,
        eventStartDate: event.startDate,
        eventEndDate: event.endDate,
      })
      .from(programSession)
      .innerJoin(event, eq(programSession.eventId, event.id))
      .where(eq(programSession.id, input.sessionId))
      .limit(1);

    if (sessionData.length === 0) {
      throw new ORPCError("NOT_FOUND", { message: "Session not found" });
    }

    const sessionRow = sessionData[0]!;
    if (sessionRow.organizerId !== session.user.id) {
      throw new ORPCError("FORBIDDEN", {
        message: "Only the event organizer can update sessions",
      });
    }

    // Validate new times are within event range if provided
    const newStartAt = input.startAt ? new Date(input.startAt) : sessionRow.session.startAt;
    const newEndAt = input.endAt ? new Date(input.endAt) : sessionRow.session.endAt;
    const eventStart = new Date(sessionRow.eventStartDate);
    const eventEnd = new Date(sessionRow.eventEndDate);
    eventEnd.setHours(23, 59, 59, 999);

    if (newStartAt < eventStart || newEndAt > eventEnd) {
      throw new ORPCError("BAD_REQUEST", {
        message: "Session must be within the event date range",
      });
    }

    try {
      const updateData: Partial<typeof programSession.$inferInsert> = {};
      if (input.title !== undefined) updateData.title = input.title;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.startAt !== undefined) updateData.startAt = new Date(input.startAt);
      if (input.endAt !== undefined) updateData.endAt = new Date(input.endAt);
      if (input.roomId !== undefined) updateData.roomId = input.roomId;
      if (input.chairId !== undefined) updateData.chairId = input.chairId;
      if (input.meetingLink !== undefined) updateData.meetingLink = input.meetingLink;

      const [updatedSession] = await db
        .update(programSession)
        .set(updateData)
        .where(eq(programSession.id, input.sessionId))
        .returning();

      return {
        status: "success" as const,
        message: "Session updated successfully",
        session: updatedSession,
      };
    } catch (error) {
      console.error("Failed to update session:", error);
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to update session",
      });
    }
  });

// =====================
// DELETE SESSION
// =====================
const deleteSessionOutputSchema = z.object({
  status: z.enum(["success", "error"]),
  message: z.string(),
});

export const deleteSessionRouter = protectedProcedure
  .route({ method: "POST", path: "/sessions/delete" })
  .input(deleteSessionSchema)
  .output(deleteSessionOutputSchema)
  .handler(async ({ context, input }) => {
    const { session } = context;

    if (!session?.user) {
      throw new ORPCError("UNAUTHORIZED");
    }

    // Get session and verify ownership
    const sessionData = await db
      .select({
        session: programSession,
        organizerId: event.organizerId,
      })
      .from(programSession)
      .innerJoin(event, eq(programSession.eventId, event.id))
      .where(eq(programSession.id, input.sessionId))
      .limit(1);

    if (sessionData.length === 0) {
      throw new ORPCError("NOT_FOUND", { message: "Session not found" });
    }

    const sessionRow = sessionData[0]!;
    if (sessionRow.organizerId !== session.user.id) {
      throw new ORPCError("FORBIDDEN", {
        message: "Only the event organizer can delete sessions",
      });
    }

    try {
      await db.delete(programSession).where(eq(programSession.id, input.sessionId));

      return {
        status: "success" as const,
        message: "Session deleted successfully",
      };
    } catch (error) {
      console.error("Failed to delete session:", error);
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to delete session",
      });
    }
  });

// =====================
// LIST SESSIONS
// =====================
const listSessionsOutputSchema = z.object({
  sessions: z.array(sessionWithRelationsSchema),
});

export const listSessionsRouter = publicProcedure
  .route({ method: "GET", path: "/sessions/list" })
  .input(listSessionsSchema)
  .output(listSessionsOutputSchema)
  .handler(async ({ input }) => {
    try {
      const sessions = await db
        .select({
          id: programSession.id,
          eventId: programSession.eventId,
          title: programSession.title,
          description: programSession.description,
          startAt: programSession.startAt,
          endAt: programSession.endAt,
          roomId: programSession.roomId,
          chairId: programSession.chairId,
          meetingLink: programSession.meetingLink,
          room: {
            id: room.id,
            name: room.name,
            capacity: room.capacity,
            location: room.location,
          },
          chair: {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          },
        })
        .from(programSession)
        .leftJoin(room, eq(programSession.roomId, room.id))
        .leftJoin(user, eq(programSession.chairId, user.id))
        .where(eq(programSession.eventId, input.eventId))
        .orderBy(programSession.startAt);

      // Transform nulls for room/chair when joins don't match
      const transformedSessions = sessions.map((s) => ({
        ...s,
        room: s.room?.id ? s.room : null,
        chair: s.chair?.id ? s.chair : null,
      }));

      return { sessions: transformedSessions };
    } catch (error) {
      console.error("Failed to list sessions:", error);
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to list sessions",
      });
    }
  });

// =====================
// GET SESSION
// =====================
const getSessionOutputSchema = z.object({
  session: sessionWithRelationsSchema.nullable(),
});

export const getSessionRouter = publicProcedure
  .route({ method: "GET", path: "/sessions/get" })
  .input(getSessionSchema)
  .output(getSessionOutputSchema)
  .handler(async ({ input }) => {
    try {
      const sessions = await db
        .select({
          id: programSession.id,
          eventId: programSession.eventId,
          title: programSession.title,
          description: programSession.description,
          startAt: programSession.startAt,
          endAt: programSession.endAt,
          roomId: programSession.roomId,
          chairId: programSession.chairId,
          meetingLink: programSession.meetingLink,
          room: {
            id: room.id,
            name: room.name,
            capacity: room.capacity,
            location: room.location,
          },
          chair: {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          },
        })
        .from(programSession)
        .leftJoin(room, eq(programSession.roomId, room.id))
        .leftJoin(user, eq(programSession.chairId, user.id))
        .where(eq(programSession.id, input.sessionId))
        .limit(1);

      if (sessions.length === 0) {
        return { session: null };
      }

      const s = sessions[0]!;
      return {
        session: {
          id: s.id,
          eventId: s.eventId,
          title: s.title,
          description: s.description,
          startAt: s.startAt,
          endAt: s.endAt,
          roomId: s.roomId,
          chairId: s.chairId,
          meetingLink: s.meetingLink,
          room: s.room?.id ? s.room : null,
          chair: s.chair?.id ? s.chair : null,
        },
      };
    } catch (error) {
      console.error("Failed to get session:", error);
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to get session",
      });
    }
  });
