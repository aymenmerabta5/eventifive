import { z } from "zod";
import { rateLimitedRegistrationProcedure } from "../../index";
import { ORPCError } from "@orpc/server";
import { db } from "@/server/db";
import {
  workshop,
  workshopRegistration,
  eventRegistration,
} from "@/server/db/schema";
import { eq, and, count } from "drizzle-orm";

const inputSchema = z.object({
  workshopId: z.string().min(1),
});

const outputSchema = z.object({
  success: z.boolean(),
  registrationId: z.number(),
  message: z.string(),
});

/**
 * Register for a workshop.
 * Requirements:
 * - User must be registered for the parent event
 * - Workshop must be accepted
 * - Workshop capacity must not be exceeded
 */
export const registerForWorkshopRouter = rateLimitedRegistrationProcedure
  .route({ method: "POST", path: "/workshop/register" })
  .input(inputSchema)
  .output(outputSchema)
  .handler(async ({ context, input }) => {
    const { session } = context;
    const userId = session.user.id;

    // 1. Get workshop and verify it's accepted
    const [workshopData] = await db
      .select({
        id: workshop.id,
        eventId: workshop.eventId,
        proposalStatus: workshop.proposalStatus,
        capacity: workshop.capacity,
      })
      .from(workshop)
      .where(eq(workshop.id, input.workshopId));

    if (!workshopData) {
      throw new ORPCError("NOT_FOUND", { message: "Workshop not found" });
    }

    if (workshopData.proposalStatus !== "accepted") {
      throw new ORPCError("BAD_REQUEST", {
        message: "This workshop is not open for registration",
      });
    }

    // 2. Check if user is registered for the parent event
    const [eventReg] = await db
      .select()
      .from(eventRegistration)
      .where(
        and(
          eq(eventRegistration.eventId, workshopData.eventId),
          eq(eventRegistration.userId, userId),
          eq(eventRegistration.paymentStatus, "paid"),
        ),
      );

    if (!eventReg) {
      throw new ORPCError("FORBIDDEN", {
        message:
          "You must be registered for the event before joining a workshop",
      });
    }

    // 3. Check if already registered for this workshop
    const [existing] = await db
      .select()
      .from(workshopRegistration)
      .where(
        and(
          eq(workshopRegistration.workshopId, input.workshopId),
          eq(workshopRegistration.userId, userId),
        ),
      );

    if (existing) {
      return {
        success: true,
        registrationId: existing.id,
        message: "You are already registered for this workshop.",
      };
    }

    // 4. Check capacity
    if (workshopData.capacity && workshopData.capacity > 0) {
      const [regCount] = await db
        .select({ count: count() })
        .from(workshopRegistration)
        .where(eq(workshopRegistration.workshopId, input.workshopId));

      if (regCount && regCount.count >= workshopData.capacity) {
        throw new ORPCError("BAD_REQUEST", {
          message: "This workshop has reached its capacity limit",
        });
      }
    }

    // 5. Create registration
    const [newReg] = await db
      .insert(workshopRegistration)
      .values({
        workshopId: input.workshopId,
        userId,
        registeredAt: new Date(),
        status: "registered",
      })
      .returning({ id: workshopRegistration.id });

    if (!newReg) {
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to create workshop registration",
      });
    }

    return {
      success: true,
      registrationId: newReg.id,
      message: "Successfully registered for the workshop!",
    };
  });
