import { adminProcedure } from "../../index";
import { db } from "@/server/db";
import { event } from "@/server/db/schema";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { invalidateDashboardCache } from "@/server/cache";

const inputDeleteEventSchema = z.object({
  eventId: z.string(),
});

const outputDeleteEventSchema = z.object({
  success: z.boolean(),
});

export const adminDeleteEventRouter = adminProcedure
  .route({ method: "DELETE", path: "/admin/event/delete" })
  .input(inputDeleteEventSchema)
  .output(outputDeleteEventSchema)
  .handler(async ({ input }) => {
    const { eventId } = input;
    try {
      const [ev] = await db.select().from(event).where(eq(event.id, eventId));
      if (!ev) {
        throw new ORPCError("NOT_FOUND", { message: "Event not found" });
      }

      await db.delete(event).where(eq(event.id, eventId));

      // invalidate organizer dashboard cache
      try {
        await invalidateDashboardCache(ev.organizerId);
      } catch (err) {
        console.warn(
          "Failed to invalidate dashboard cache after admin delete:",
          err,
        );
      }

      return { success: true };
    } catch (error) {
      if (error instanceof ORPCError) throw error;
      console.error("Error admin deleting event:", error);
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to delete event",
      });
    }
  });
