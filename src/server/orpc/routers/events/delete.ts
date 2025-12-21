import { protectedProcedure } from "../../index";
import { db } from "@/server/db";
import { event } from "@/server/db/schema";
import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { eq, and } from "drizzle-orm";

const inputDeleteEventSchema = z.object({
  eventId: z.string(),
});

const outputDeleteEventSchema = z.object({
  success: z.boolean(),
});

export const deleteEventRouter = protectedProcedure
  .route({ method: "DELETE", path: "/event/delete" })
  .input(inputDeleteEventSchema)
  .output(outputDeleteEventSchema)
  .handler(async ({ context, input }) => {
    const { session } = context;

    const { eventId } = input;

    try {
      const [eventRecord] = await db
        .select()
        .from(event)
        .where(
          and(eq(event.id, eventId), eq(event.organizerId, session.user.id)),
        );

      if (!eventRecord) {
        throw new ORPCError("NOT_FOUND", {
          message: "Event not found",
        });
      }

      await db.delete(event).where(eq(event.id, eventId));

      return {
        success: true,
      };
    } catch (error) {
      if (error instanceof ORPCError) {
        throw error;
      }
      console.error("Error deleting event:", error);
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message:
          error instanceof Error ? error.message : "Failed to delete event",
      });
    }
  });
