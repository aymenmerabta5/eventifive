import { z } from "zod";
import { protectedProcedure } from "../../index";
import { eventIterator } from "@orpc/server";
import { subscribeToPresence } from "@/server/realtime/presence";

const inputSubscribePresenceSchema = z.object({
  userIds: z.array(z.string()).min(1).max(100),
});

const presenceEventSchema = z.object({
  userId: z.string(),
  status: z.enum(["online", "offline"]),
  lastSeenAt: z.date().optional(),
});

export const subscribePresenceRouter = protectedProcedure
  .route({ method: "GET", path: "/presence/subscribe" })
  .input(inputSubscribePresenceSchema)
  .output(eventIterator(presenceEventSchema))
  .handler(async function* ({ input, signal }) {
    const { userIds } = input;

    for await (const event of subscribeToPresence(userIds, signal)) {
      yield event;
    }
  });
