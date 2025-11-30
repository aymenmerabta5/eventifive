import { publicProcedure } from "../index";
import { db } from "@/server/db";
import { event } from "@/server/db/schema";
import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { eq, desc } from "drizzle-orm";

const eventSchema = z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().nullable(),
    type: z.enum(["congress", "seminar", "workshop", "scientific_meeting", "conference", "symposium"]),
    startDate: z.date(),
    endDate: z.date(),
    location: z.string().nullable(),
    organizerId: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

const inputSchema = z.object({
    eventType: z.enum(["congress", "seminar", "workshop", "scientific_meeting", "conference", "symposium"]),
    page: z.number().int().min(0).default(0),
    limit: z.number().int().positive().max(50).default(10),
});

const outputSchema = z.object({
    data: z.array(eventSchema),
    currentPage: z.number(),
    nextPage: z.number().nullable(),
});

export const listEventsByTypeRouter = publicProcedure
    .route({ method: "POST", path: "/events/by-type" })
    .input(inputSchema)
    .output(outputSchema)
    .handler(async ({ input }) => {
        try {
            const { eventType, page, limit } = input;
            const offset = page * limit;

            const events = await db
                .select()
                .from(event)
                .where(eq(event.type, eventType))
                .orderBy(desc(event.startDate))
                .limit(limit)
                .offset(offset);

            // Check if there are more pages
            const nextPageEvents = await db
                .select()
                .from(event)
                .where(eq(event.type, eventType))
                .limit(1)
                .offset(offset + limit);

            return {
                data: events,
                currentPage: page,
                nextPage: nextPageEvents.length > 0 ? page + 1 : null,
            };
        } catch (error) {
            console.error("Failed to fetch events by type:", error);
            throw new ORPCError("INTERNAL_SERVER_ERROR", {
                message: "Failed to fetch events by type",
            });
        }
    });

