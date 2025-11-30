import { publicProcedure } from "../index";
import { db } from "@/server/db";
import { event } from "@/server/db/schema";
import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { eq, desc, asc, and, or, ilike, sql } from "drizzle-orm";

const eventSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  type: z.enum([
    "congress",
    "seminar",
    "workshop",
    "scientific_meeting",
    "conference",
    "symposium",
  ]),
  startDate: z.date(),
  endDate: z.date(),
  location: z.string().nullable(),
  organizerId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const inputSchema = z.object({
  eventType: z.enum([
    "congress",
    "seminar",
    "workshop",
    "scientific_meeting",
    "conference",
    "symposium",
  ]),
  page: z.number().int().min(0).default(0),
  limit: z.number().int().positive().max(50).default(9),
  search: z.string().optional(),
  sortBy: z.enum(["newest", "oldest", "title_asc", "title_desc"]).optional().default("newest"),
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
      const { eventType, page, limit, search, sortBy } = input;
      const offset = page * limit;

      // Build where conditions
      const conditions = [eq(event.type, eventType)];
      
      if (search && search.trim()) {
        const searchTerm = `%${search.trim()}%`;
        // Use SQL template for proper null handling with ILIKE
        conditions.push(
          sql`(${event.title} ILIKE ${searchTerm} OR COALESCE(${event.description}, '') ILIKE ${searchTerm} OR COALESCE(${event.location}, '') ILIKE ${searchTerm})`
        );
      }

      // Build order by clause
      let orderByClause;
      switch (sortBy) {
        case "oldest":
          orderByClause = asc(event.startDate);
          break;
        case "title_asc":
          orderByClause = asc(event.title);
          break;
        case "title_desc":
          orderByClause = desc(event.title);
          break;
        case "newest":
        default:
          orderByClause = desc(event.startDate);
          break;
      }

      const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0]!;

      const events = await db
        .select()
        .from(event)
        .where(whereClause)
        .orderBy(orderByClause)
        .limit(limit)
        .offset(offset);

      // Check if there are more pages
      const nextPageEvents = await db
        .select()
        .from(event)
        .where(whereClause)
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
