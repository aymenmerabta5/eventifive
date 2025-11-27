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

const outputListEventsSchema = z.object({
    congress: z.array(eventSchema).max(3),
    seminar: z.array(eventSchema).max(3),
    workshop: z.array(eventSchema).max(3),
    scientific_meeting: z.array(eventSchema).max(3),
    conference: z.array(eventSchema).max(3),
    symposium: z.array(eventSchema).max(3),
});

type EventType = "congress" | "seminar" | "workshop" | "scientific_meeting" | "conference" | "symposium";

type GroupedEvents = {
    [K in EventType]: typeof event.$inferSelect[];
};

export const listEventsRouter = publicProcedure
    .route({ method: "GET", path: "/events" })
    .output(outputListEventsSchema)
    .handler(async () => {
        try {
            const eventTypes = ["congress", "seminar", "workshop", "scientific_meeting", "conference", "symposium"] as const;
            
            const grouped: GroupedEvents = {
                congress: [],
                seminar: [],
                workshop: [],
                scientific_meeting: [],
                conference: [],
                symposium: [],
            };

            // Fetch 3 events for each type
            await Promise.all(
                eventTypes.map(async (type) => {
                    const events = await db
                        .select()
                        .from(event)
                        .where(eq(event.type, type))
                        .orderBy(desc(event.startDate))
                        .limit(3);
                    
                    grouped[type] = events;
                })
            );

            return grouped;
        } catch (error) {
            console.error("Failed to fetch events:", error);
            throw new ORPCError("INTERNAL_SERVER_ERROR", {
                message: "Failed to fetch events",
            });
        }
    });