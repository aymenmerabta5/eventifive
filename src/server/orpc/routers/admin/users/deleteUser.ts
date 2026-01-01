import { adminProcedure } from "../../../index";
import { db } from "@/server/db";
import { user } from "@/server/db/schema";
import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { eq } from "drizzle-orm";

const inputSchema = z.object({
  userId: z.string(),
});

const outputSchema = z.object({
  success: z.boolean(),
});

/**
 * Admin endpoint to delete a user
 * 
 * This endpoint:
 * 1. Requires super_admin authentication (via adminProcedure)
 * 2. Verifies the user exists
 * 3. Deletes the user (cascade deletes handle userRoles, sessions, accounts)
 * 
 * Cascade deletes in the database schema ensure that related records
 * (userRoles, sessions, accounts) are automatically removed when a user is deleted.
 * This prevents orphaned records and maintains data integrity.
 */
export const deleteUserRouter = adminProcedure
  .route({ method: "DELETE", path: "/admin/users/delete" })
  .input(inputSchema)
  .output(outputSchema)
  .handler(async ({ input }) => {
    try {
      const { userId } = input;

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

      // Delete user (cascade will handle userRoles, sessions, accounts)
      await db.delete(user).where(eq(user.id, userId));

      return {
        success: true,
      };
    } catch (error) {
      if (error instanceof ORPCError) {
        throw error;
      }

      console.error("Failed to delete user:", error);
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to delete user",
      });
    }
  });

