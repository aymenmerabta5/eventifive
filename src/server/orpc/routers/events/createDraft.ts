import { protectedProcedure } from "../../index";
import { createDraftEventSchema } from "@/lib/schemas/schemas";
import { db } from "@/server/db";
import { event } from "@/server/db/schema";
import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { randomUUID } from "crypto";

const outputSchema = z.object({
  status: z.enum(["success", "error"]),
  message: z.string(),
  eventId: z.string().optional(),
});

export const createDraftEventRouter = protectedProcedure
  .route({ method: "POST", path: "/event/create-draft" })
  .input(createDraftEventSchema)
  .output(outputSchema)
  .handler(async ({ context, input }) => {
    const { session } = context;

    if (!session?.user) {
      throw new ORPCError("UNAUTHORIZED");
    }

    try {
      const eventId = randomUUID();
      const now = new Date();

      await db.insert(event).values({
        id: eventId,
        title: input.title,
        smallDescription: input.description,
        bigDescription: input.bigDescription ?? null,
        type: input.type,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        location: input.location || null,
        organizerId: session.user.id,
        priceAmount: input.priceAmount ?? 0,
        priceCurrency: input.priceCurrency ?? "DZD",
        createdAt: now,
        updatedAt: now,
      });

      return {
        status: "success" as const,
        message: "Draft event created",
        eventId,
      };
    } catch (error) {
      console.error("Failed to create draft event:", error);
      const safeMessage =
        error instanceof Error ? error.message : "Failed to create draft event";
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: safeMessage,
      });
    }
  });
