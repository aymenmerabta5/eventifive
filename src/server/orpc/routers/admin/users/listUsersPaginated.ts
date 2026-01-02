import { adminProcedure } from "../../../index";
import { db } from "@/server/db";
import { user, userRoles, roles } from "@/server/db/schema";
import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { eq, count, sql, and } from "drizzle-orm";

const userWithRoleSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  image: z.string().nullable(),
  institution: z.string().nullable(),
  researchDomain: z.string().nullable(),
  biography: z.unknown().nullable(),
  lastSeenAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  role: z.enum(["super_admin", "organizer", "user"]),
});

const inputSchema = z.object({
  page: z.number().int().min(0).default(0),
  limit: z.number().int().positive().max(50).default(10),
  search: z.string().optional(),
  roleFilter: z.enum(["super_admin", "organizer", "user"]).optional(),
});

const outputSchema = z.object({
  users: z.array(userWithRoleSchema),
  currentPage: z.number(),
  nextPage: z.number().nullable(),
  total: z.number(),
});

export const listUsersPaginatedRouter = adminProcedure
  .route({ method: "POST", path: "/admin/users/list-paginated" })
  .input(inputSchema)
  .output(outputSchema)
  .handler(async ({ input }) => {
    try {
      const { page, limit, search, roleFilter } = input;
      const offset = page * limit;

      // Build where conditions for search
      const conditions = [];

      if (search && search.trim()) {
        const searchTerm = `%${search.trim()}%`;
        conditions.push(
          sql`(${user.name} ILIKE ${searchTerm} OR ${user.email} ILIKE ${searchTerm})`,
        );
      }

      // Role filter will be applied after join
      const searchWhereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      // Get total count (always unfiltered for stats)
      const [totalResult] = await db.select({ total: count() }).from(user);

      // Fetch all users with roles (we'll filter in memory for role filter)
      // This is necessary because role is in a joined table
      const usersWithRoles = await db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          image: user.image,
          institution: user.institution,
          researchDomain: user.researchDomain,
          biography: user.biography,
          lastSeenAt: user.lastSeenAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          roleName: roles.name,
        })
        .from(user)
        .leftJoin(userRoles, eq(user.id, userRoles.userId))
        .leftJoin(roles, eq(userRoles.roleId, roles.id))
        .where(searchWhereClause)
        .orderBy(user.createdAt);

      // Transform and apply role filter
      let users = usersWithRoles.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        emailVerified: u.emailVerified,
        image: u.image,
        institution: u.institution,
        researchDomain: u.researchDomain,
        biography: u.biography,
        lastSeenAt: u.lastSeenAt,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
        role: (u.roleName ?? "user") as "super_admin" | "organizer" | "user",
      }));

      // Apply role filter if specified
      if (roleFilter) {
        users = users.filter((u) => u.role === roleFilter);
      }

      // Get total after filtering (for pagination calculation)
      const filteredTotal = users.length;

      // Apply pagination
      const paginatedUsers = users.slice(offset, offset + limit);

      // Check if there are more pages
      const hasNextPage = offset + limit < filteredTotal;

      return {
        users: paginatedUsers,
        currentPage: page,
        nextPage: hasNextPage ? page + 1 : null,
        total: totalResult?.total ?? 0,
      };
    } catch (error) {
      if (error instanceof ORPCError) {
        throw error;
      }

      console.error("Failed to list users:", error);
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to fetch users",
      });
    }
  });
