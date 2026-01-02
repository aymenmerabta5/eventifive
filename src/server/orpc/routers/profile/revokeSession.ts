import { z } from "zod";
import { protectedProcedure } from "../../index";
import { db } from "@/server/db";
import { session as sessionTable } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";
import { ORPCError } from "@orpc/server";

export const revokeSessionRouter = protectedProcedure
  .input(
    z.object({
      sessionId: z.string().min(1, "Session ID is required"),
    }),
  )
  .handler(async ({ input, context }) => {
    const { sessionId } = input;
    const { session } = context;
    const userId = session.user.id;
    const currentSessionId = session.session.id;

    // Prevent revoking current session
    if (sessionId === currentSessionId) {
      throw new ORPCError("FORBIDDEN");
    }

    // Find and delete the session (only if it belongs to the current user)
    const [deletedSession] = await db
      .delete(sessionTable)
      .where(
        and(eq(sessionTable.id, sessionId), eq(sessionTable.userId, userId)),
      )
      .returning({ id: sessionTable.id });

    if (!deletedSession) {
      throw new ORPCError("NOT_FOUND");
    }

    return { success: true, revokedSessionId: deletedSession.id };
  });
