import { adminProcedure } from "../../index";
import { db } from "@/server/db";
import { event } from "@/server/db/schema";
import { z } from "zod";
import { desc } from "drizzle-orm";
import { ORPCError } from "@orpc/server";

const outputEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  smallDescription: z.string().nullable(),
  type: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  location: z.string().nullable(),
  organizerId: z.string(),
  status: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const outputSchema = z.object({
  events: z.array(outputEventSchema),
});

export const adminListEventsRouter = adminProcedure
  .route({ method: "GET", path: "/admin/events" })
  .output(outputSchema)
  .handler(async () => {
    try {
      const events = await db
        .select()
        .from(event)
        .orderBy(desc(event.createdAt));
      return { events };
    } catch (error) {
      console.error("Failed to list events for admin:", error);
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to list events",
      });
    }
  });
