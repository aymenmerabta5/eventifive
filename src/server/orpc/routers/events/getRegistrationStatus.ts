import { z } from "zod";
import { protectedProcedure } from "../../index";
import { db } from "@/server/db";
import { eventRegistration } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";

const inputSchema = z.object({
  eventId: z.string().min(1),
});

const outputSchema = z.object({
  isRegistered: z.boolean(),
  registrationId: z.number().nullable(),
  paymentStatus: z.enum(["unpaid", "pending", "paid", "refunded"]).nullable(),
  roleAtEvent: z.string().nullable(),
  registeredAt: z.date().nullable(),
});

export const getRegistrationStatusRouter = protectedProcedure
  .route({ method: "GET", path: "/event/registration-status" })
  .input(inputSchema)
  .output(outputSchema)
  .handler(async ({ input, context }) => {
    // Use authenticated user's ID - no IDOR vulnerability
    const userId = context.session.user.id;

    // Check registration for the authenticated user only
    const [registration] = await db
      .select()
      .from(eventRegistration)
      .where(
        and(
          eq(eventRegistration.eventId, input.eventId),
          eq(eventRegistration.userId, userId),
        ),
      );

    if (!registration) {
      return {
        isRegistered: false,
        registrationId: null,
        paymentStatus: null,
        roleAtEvent: null,
        registeredAt: null,
      };
    }

    return {
      isRegistered: true,
      registrationId: registration.id,
      paymentStatus: registration.paymentStatus,
      roleAtEvent: registration.roleAtEvent,
      registeredAt: registration.registeredAt,
    };
  });
