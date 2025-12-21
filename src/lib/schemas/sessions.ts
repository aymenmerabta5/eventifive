import { z } from "zod";

// =====================
// ROOM SCHEMAS
// =====================

export const createRoomSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  name: z
    .string()
    .min(1, "Room name is required")
    .max(255, "Room name must be less than 255 characters"),
  capacity: z.number().int().min(1, "Capacity must be at least 1").optional(),
  location: z
    .string()
    .max(255, "Location must be less than 255 characters")
    .optional(),
});

export const updateRoomSchema = z.object({
  roomId: z.number().int().min(1, "Room ID is required"),
  name: z
    .string()
    .min(1, "Room name is required")
    .max(255, "Room name must be less than 255 characters")
    .optional(),
  capacity: z
    .number()
    .int()
    .min(1, "Capacity must be at least 1")
    .nullable()
    .optional(),
  location: z
    .string()
    .max(255, "Location must be less than 255 characters")
    .nullable()
    .optional(),
});

export const deleteRoomSchema = z.object({
  roomId: z.number().int().min(1, "Room ID is required"),
});

export const listRoomsSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
});

// =====================
// SESSION SCHEMAS
// =====================

export const createSessionSchema = z
  .object({
    eventId: z.string().min(1, "Event ID is required"),
    title: z
      .string()
      .min(1, "Session title is required")
      .max(255, "Title must be less than 255 characters"),
    description: z
      .string()
      .max(5000, "Description must be less than 5000 characters")
      .optional(),
    startAt: z.string().min(1, "Start time is required"),
    endAt: z.string().min(1, "End time is required"),
    roomId: z.number().int().min(1).nullable().optional(),
    chairId: z.string().min(1).nullable().optional(),
    meetingLink: z
      .string()
      .url("Must be a valid URL")
      .max(500, "Meeting link must be less than 500 characters")
      .nullable()
      .optional(),
  })
  .refine(
    (data) => {
      const start = new Date(data.startAt);
      const end = new Date(data.endAt);
      return end > start;
    },
    {
      message: "End time must be after start time",
      path: ["endAt"],
    },
  );

export const updateSessionSchema = z
  .object({
    sessionId: z.string().min(1, "Session ID is required"),
    title: z
      .string()
      .min(1, "Session title is required")
      .max(255, "Title must be less than 255 characters")
      .optional(),
    description: z
      .string()
      .max(5000, "Description must be less than 5000 characters")
      .nullable()
      .optional(),
    startAt: z.string().min(1, "Start time is required").optional(),
    endAt: z.string().min(1, "End time is required").optional(),
    roomId: z.number().int().min(1).nullable().optional(),
    chairId: z.string().min(1).nullable().optional(),
    meetingLink: z
      .string()
      .url("Must be a valid URL")
      .max(500, "Meeting link must be less than 500 characters")
      .nullable()
      .optional(),
  })
  .refine(
    (data) => {
      // Only validate if both are provided
      if (data.startAt && data.endAt) {
        const start = new Date(data.startAt);
        const end = new Date(data.endAt);
        return end > start;
      }
      return true;
    },
    {
      message: "End time must be after start time",
      path: ["endAt"],
    },
  );

export const deleteSessionSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
});

export const listSessionsSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
});

export const getSessionSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
});

// =====================
// INFERRED TYPES
// =====================

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
export type DeleteRoomInput = z.infer<typeof deleteRoomSchema>;
export type ListRoomsInput = z.infer<typeof listRoomsSchema>;

export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;
export type DeleteSessionInput = z.infer<typeof deleteSessionSchema>;
export type ListSessionsInput = z.infer<typeof listSessionsSchema>;
export type GetSessionInput = z.infer<typeof getSessionSchema>;
