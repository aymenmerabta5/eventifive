import { adminProcedure } from "../../../index";
import { db } from "@/server/db";
import { user, userRoles, roles } from "@/server/db/schema";
import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { eq, and } from "drizzle-orm";

const inputSchema = z.object({
  userId: z.string(),
  role: z.enum(["super_admin", "organizer", "user"]),
});

const outputSchema = z.object({
  success: z.boolean(),
});

/**
 * Admin endpoint to update a user's role
 *
 * This endpoint:
 * 1. Requires super_admin authentication (via adminProcedure)
 * 2. Verifies the user exists
 * 3. Gets the role ID for the new role
 * 4. Deletes existing user role assignment
 * 5. Inserts new role assignment
 *
 * The userRoles table has a unique constraint on (userId, roleId),
 * so we need to delete the old assignment before inserting the new one.
 * This ensures a user only has one role at a time.
 */
export const updateUserRoleRouter = adminProcedure
  .route({ method: "PATCH", path: "/admin/users/update-role" })
  .input(inputSchema)
  .output(outputSchema)
  .handler(async ({ input }) => {
    try {
      const { userId, role } = input;

      // Verify user exists
      const [userRecord] = await db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.id, userId))
        .limit(1);

      if (!userRecord) {
        throw new ORPCError("NOT_FOUND", {
          message: "User not found",
        });
      }

      // Get the role ID for the new role
      const [roleRecord] = await db
        .select({ id: roles.id })
        .from(roles)
        .where(eq(roles.name, role))
        .limit(1);

      if (!roleRecord) {
        throw new ORPCError("INTERNAL_SERVER_ERROR", {
          message: `Role '${role}' not found in database`,
        });
      }

      // Delete existing user role assignment
      await db.delete(userRoles).where(eq(userRoles.userId, userId));

      // Insert new role assignment
      await db.insert(userRoles).values({
        userId,
        roleId: roleRecord.id,
      });

      return {
        success: true,
      };
    } catch (error) {
      if (error instanceof ORPCError) {
        throw error;
      }

      console.error("Failed to update user role:", error);
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to update user role",
      });
    }
  });
