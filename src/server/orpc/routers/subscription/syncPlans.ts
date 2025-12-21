import { z } from "zod";
import { protectedProcedure } from "../../index";
import { ORPCError } from "@orpc/server";
import { db } from "@/server/db";
import { userRoles, roles } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import {
  syncPlansToChargily,
  syncSinglePlan,
} from "@/server/gateway/chargilySync";
import { isChargilyConfigured } from "@/server/gateway/chargily";
import { syncResultSchema } from "@/lib/schemas/payment";

const inputSchema = z.object({
  planId: z.string().optional(), // If provided, sync only this plan
});

export const syncPlansRouter = protectedProcedure
  .route({ method: "POST", path: "/subscription/sync" })
  .input(inputSchema)
  .output(syncResultSchema)
  .handler(async ({ context, input }) => {
    const { session } = context;
    const userId = session.user.id;

    // Check if user is admin
    const [userRole] = await db
      .select({ roleName: roles.name })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, userId));

    if (!userRole || !["admin", "super_admin"].includes(userRole.roleName)) {
      throw new ORPCError("FORBIDDEN", {
        message: "Only administrators can sync subscription plans",
      });
    }

    // Check if Chargily is configured
    if (!isChargilyConfigured()) {
      throw new ORPCError("BAD_REQUEST", {
        message:
          "Chargily is not configured. Please set CHARGILY_SK environment variable.",
      });
    }

    // Sync plans
    if (input.planId) {
      return await syncSinglePlan(input.planId);
    } else {
      return await syncPlansToChargily();
    }
  });
