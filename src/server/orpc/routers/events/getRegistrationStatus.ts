import { z } from "zod";
import { publicProcedure } from "../../index";
import { db } from "@/server/db";
import { eventRegistration } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";

const inputSchema = z.object({
  eventId: z.string().min(1),
  userId: z.string().min(1).optional(),
});

const outputSchema = z.object({
  isRegistered: z.boolean(),
  registrationId: z.number().nullable(),
  paymentStatus: z.enum(["unpaid", "pending", "paid", "refunded"]).nullable(),
  roleAtEvent: z.string().nullable(),
  registeredAt: z.date().nullable(),
});

export const getRegistrationStatusRouter = publicProcedure
  .route({ method: "GET", path: "/event/registration-status" })
  .input(inputSchema)
  .output(outputSchema)
  .handler(async ({ input }) => {
    // If no userId provided, return not registered
    if (!input.userId) {
      return {
        isRegistered: false,
        registrationId: null,
        paymentStatus: null,
        roleAtEvent: null,
        registeredAt: null,
      };
    }

    // Check registration
    const [registration] = await db
      .select()
      .from(eventRegistration)
      .where(
        and(
          eq(eventRegistration.eventId, input.eventId),
          eq(eventRegistration.userId, input.userId),
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
