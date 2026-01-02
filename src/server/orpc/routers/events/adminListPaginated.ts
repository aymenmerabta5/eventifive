import { adminProcedure } from "../../index";
import { db } from "@/server/db";
import { event } from "@/server/db/schema";
import { z } from "zod";
import { desc, sql, count, and } from "drizzle-orm";
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

const inputSchema = z.object({
  page: z.number().int().min(0).default(0),
  limit: z.number().int().positive().max(50).default(10),
  search: z.string().optional(),
});

const outputSchema = z.object({
  data: z.array(outputEventSchema),
  currentPage: z.number(),
  nextPage: z.number().nullable(),
  total: z.number(),
});

export const adminListEventsPaginatedRouter = adminProcedure
  .route({ method: "POST", path: "/admin/events/paginated" })
  .input(inputSchema)
  .output(outputSchema)
  .handler(async ({ input }) => {
    try {
      const { page, limit, search } = input;
      const offset = page * limit;

      // Build where conditions
      const conditions = [];

      if (search && search.trim()) {
        const searchTerm = `%${search.trim()}%`;
        conditions.push(
          sql`(${event.title} ILIKE ${searchTerm} OR COALESCE(${event.smallDescription}, '') ILIKE ${searchTerm} OR COALESCE(${event.location}, '') ILIKE ${searchTerm})`,
        );
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      // Get total count (always for stats)
      const [totalResult] = await db
        .select({ total: count() })
        .from(event)
        .where(whereClause);

      // Fetch paginated events
      const events = await db
        .select()
        .from(event)
        .where(whereClause)
        .orderBy(desc(event.createdAt))
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
        total: totalResult?.total ?? 0,
      };
    } catch (error) {
      console.error("Failed to list events for admin:", error);
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to list events",
      });
    }
  });
