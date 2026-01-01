import { adminProcedure } from "../../../index";
import { db } from "@/server/db";
import { user, userRoles, roles } from "@/server/db/schema";
import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { eq, count } from "drizzle-orm";

/**
 * Output schema for the listUsers endpoint
 * 
 * This defines the shape of data returned to the frontend.
 * Each user includes their basic information plus their role,
 * which is joined from the userRoles and roles tables.
 * 
 * The role field uses the same enum values as the database schema
 * to ensure type safety across the entire application.
 */
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

const outputSchema = z.object({
  users: z.array(userWithRoleSchema),
  total: z.number(),
});

/**
 * Admin endpoint to list all users with their roles
 * 
 * This endpoint:
 * 1. Requires super_admin authentication (via adminProcedure)
 * 2. Fetches all users from the database
 * 3. Joins with userRoles and roles tables to get each user's role
 * 4. Returns users array with total count
 * 
 * The query uses a LEFT JOIN on userRoles because not all users
 * may have a role assigned (though they should default to "user").
 * If no role is found, we default to "user" role.
 * 
 * This follows the same pattern as other list endpoints in the codebase,
 * ensuring consistency in API design and error handling.
 */
export const listUsersRouter = adminProcedure
  .route({ method: "GET", path: "/admin/users/list" })
  .output(outputSchema)
  .handler(async () => {
    try {
      // Get total count first (more efficient)
      const [totalResult] = await db
        .select({ total: count() })
        .from(user);

      // Fetch all users with their roles
      // We use a LEFT JOIN because some users might not have a role assigned
      // The unique constraint on user_roles ensures one role per user
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
        .orderBy(user.createdAt);

      // Transform the data to match our output schema
      // If a user has no role, default to "user" (this shouldn't happen in practice,
      // but we handle it defensively)
      const users = usersWithRoles.map((u) => ({
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

      return {
        users,
        total: totalResult?.total ?? users.length,
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

