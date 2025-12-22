import { z } from "zod";
import { protectedProcedure } from "../../../index";
import { getPresenceState } from "@/server/realtime/presence";

const inputGetPresenceSchema = z.object({
  userIds: z.array(z.string()).min(1).max(100),
});

const presenceStateSchema = z.record(
  z.string(),
  z.object({
    isOnline: z.boolean(),
    lastSeenAt: z.date().nullable(),
  }),
);

export const getPresenceRouter = protectedProcedure
  .route({ method: "GET", path: "/presence" })
  .input(inputGetPresenceSchema)
  .output(presenceStateSchema)
  .handler(async ({ input }) => {
    const { userIds } = input;

    const presenceState = await getPresenceState(userIds);

    // Convert Map to object for serialization
    const result: Record<
      string,
      { isOnline: boolean; lastSeenAt: Date | null }
    > = {};
    for (const [userId, state] of presenceState) {
      result[userId] = state;
    }

    return result;
  });
