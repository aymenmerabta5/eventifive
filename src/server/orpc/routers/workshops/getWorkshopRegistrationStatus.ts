import { z } from "zod";
import { protectedProcedure } from "../../index";
import { db } from "@/server/db";
import { workshopRegistration } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";

const inputSchema = z.object({
  workshopId: z.string().min(1),
});

const outputSchema = z.object({
  isRegistered: z.boolean(),
  registrationId: z.number().nullable(),
  registeredAt: z.date().nullable(),
  status: z.string().nullable(),
});

/**
 * Check if the current user is registered for a specific workshop.
 */
export const getWorkshopRegistrationStatusRouter = protectedProcedure
  .route({ method: "GET", path: "/workshop/registration-status" })
  .input(inputSchema)
  .output(outputSchema)
  .handler(async ({ input, context }) => {
    const userId = context.session.user.id;

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
      return {
        isRegistered: false,
        registrationId: null,
        registeredAt: null,
        status: null,
      };
    }

    return {
      isRegistered: true,
      registrationId: registration.id,
      registeredAt: registration.registeredAt,
      status: registration.status,
    };
  });
