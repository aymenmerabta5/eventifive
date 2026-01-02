import { protectedProcedure } from "../../index";
import { db } from "@/server/db";
import {
  eventSpeakers,
  submission,
  workshop,
  user,
  event,
} from "@/server/db/schema";
import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { eq, and } from "drizzle-orm";

// Input schema
const getChairOptionsInputSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
});

// Chair option with role
const chairOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  image: z.string().nullable(),
  role: z.enum(["speaker", "communicator", "facilitator"]),
});

// Output schema
const getChairOptionsOutputSchema = z.object({
  chairOptions: z.array(chairOptionSchema),
});

export const getChairOptionsRouter = protectedProcedure
  .route({ method: "GET", path: "/sessions/chair-options" })
  .input(getChairOptionsInputSchema)
  .output(getChairOptionsOutputSchema)
  .handler(async ({ context, input }) => {
    const { session } = context;

    if (!session?.user) {
      throw new ORPCError("UNAUTHORIZED");
    }

    // Verify event exists and user is the organizer
    const eventData = await db
      .select({ organizerId: event.organizerId })
      .from(event)
      .where(eq(event.id, input.eventId))
      .limit(1);

    if (eventData.length === 0) {
      throw new ORPCError("NOT_FOUND", { message: "Event not found" });
    }

    const eventRow = eventData[0]!;
    if (eventRow.organizerId !== session.user.id) {
      throw new ORPCError("FORBIDDEN", {
        message: "Only the event organizer can view chair options",
      });
    }

    try {
      // Map to track unique users and their roles
      const usersMap = new Map<
        string,
        {
          id: string;
          name: string;
          email: string;
          image: string | null;
          role: "speaker" | "communicator" | "facilitator";
        }
      >();

      // 1. Get accepted speakers
      const speakers = await db
        .select({
          userId: eventSpeakers.userId,
          userName: user.name,
          userEmail: user.email,
          userImage: user.image,
        })
        .from(eventSpeakers)
        .innerJoin(user, eq(eventSpeakers.userId, user.id))
        .where(
          and(
            eq(eventSpeakers.eventId, input.eventId),
            eq(eventSpeakers.status, "accepted"),
          ),
        );

      for (const speaker of speakers) {
        if (!usersMap.has(speaker.userId)) {
          usersMap.set(speaker.userId, {
            id: speaker.userId,
            name: speaker.userName,
            email: speaker.userEmail,
            image: speaker.userImage,
            role: "speaker",
          });
        }
      }

      // 2. Get approved communicators (users with accepted submissions)
      const communicators = await db
        .select({
          userId: submission.submitterId,
          userName: user.name,
          userEmail: user.email,
          userImage: user.image,
        })
        .from(submission)
        .innerJoin(user, eq(submission.submitterId, user.id))
        .where(
          and(
            eq(submission.eventId, input.eventId),
            eq(submission.status, "accepted"),
          ),
        );

      for (const communicator of communicators) {
        if (!usersMap.has(communicator.userId)) {
          usersMap.set(communicator.userId, {
            id: communicator.userId,
            name: communicator.userName,
            email: communicator.userEmail,
            image: communicator.userImage,
            role: "communicator",
          });
        }
      }

      // 3. Get approved workshop facilitators
      const facilitators = await db
        .select({
          userId: workshop.facilitatorId,
          userName: user.name,
          userEmail: user.email,
          userImage: user.image,
        })
        .from(workshop)
        .innerJoin(user, eq(workshop.facilitatorId, user.id))
        .where(
          and(
            eq(workshop.eventId, input.eventId),
            eq(workshop.proposalStatus, "accepted"),
          ),
        );

      for (const facilitator of facilitators) {
        if (!usersMap.has(facilitator.userId)) {
          usersMap.set(facilitator.userId, {
            id: facilitator.userId,
            name: facilitator.userName,
            email: facilitator.userEmail,
            image: facilitator.userImage,
            role: "facilitator",
          });
        }
      }

      // Convert map to array and sort by name
      const chairOptions = Array.from(usersMap.values()).sort((a, b) =>
        a.name.localeCompare(b.name),
      );

      return { chairOptions };
    } catch (error) {
      console.error("Failed to get chair options:", error);
      throw new ORPCError("INTERNAL_SERVER_ERROR", {
        message: "Failed to get chair options",
      });
    }
  });
