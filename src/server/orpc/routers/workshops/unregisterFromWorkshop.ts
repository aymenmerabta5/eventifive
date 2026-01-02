import { z } from "zod";
import { protectedProcedure } from "../../index";
import { ORPCError } from "@orpc/server";
import { db } from "@/server/db";
import { workshop, workshopRegistration } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";

const inputSchema = z.object({
  workshopId: z.string().min(1),
});

const outputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

/**
 * Unregister from a workshop.
 * Users can only unregister if the workshop hasn't started yet.
 */
export const unregisterFromWorkshopRouter = protectedProcedure
  .route({ method: "POST", path: "/workshop/unregister" })
  .input(inputSchema)
  .output(outputSchema)
  .handler(async ({ context, input }) => {
    const userId = context.session.user.id;

    // 1. Check if registration exists
    const [registration] = await db
      .select()
      .from(workshopRegistration)
      .where(
        and(
          eq(workshopRegistration.workshopId, input.workshopId),
          eq(workshopRegistration.userId, userId),
        ),
      );

    if (!registration) {
      throw new ORPCError("NOT_FOUND", {
        message: "You are not registered for this workshop",
      });
    }

    // 2. Get workshop to check if it has started
    const [workshopData] = await db
      .select({
        startAt: workshop.startAt,
      })
      .from(workshop)
      .where(eq(workshop.id, input.workshopId));

    if (workshopData?.startAt && new Date(workshopData.startAt) <= new Date()) {
      throw new ORPCError("BAD_REQUEST", {
        message: "Cannot unregister from a workshop that has already started",
      });
    }

    // 3. Delete registration
    await db
      .delete(workshopRegistration)
      .where(eq(workshopRegistration.id, registration.id));

    return {
      success: true,
      message: "Successfully unregistered from the workshop",
    };
  });
