import { protectedProcedure } from "../../index";
import { mySessionsOutputSchema } from "@/lib/schemas/sessions";
import { db } from "@/server/db";
import {
  programSession,
  event,
  room,
  sessionAssignment,
  submission,
  eventCommittee,
} from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { env } from "@/env";
import type { MySession, MySessionRole } from "@/lib/schemas/sessions";

/**
 * Get all sessions where the authenticated user has a role:
 * - Session chair (chairId)
 * - Speaker (via submission → sessionAssignment)
 * - Committee member (via eventCommittee)
 */
export const mySessionsRouter = protectedProcedure
  .route({ method: "GET", path: "/sessions/my" })
  .output(mySessionsOutputSchema)
  .handler(async ({ context }) => {
    const userId = context.session.user.id;
    const baseUrl = env.BETTER_AUTH_URL;

    // Map to store sessions with their highest priority role
    const sessionMap = new Map<
      string,
      MySession & { rolePriority: number }
    >();

    const rolePriorities: Record<MySessionRole, number> = {
      chair: 3,
      speaker: 2,
      committee: 1,
    };

    const addSession = (
      sessionData: {
        id: string;
        title: string;
        description: string | null;
        startAt: Date;
        endAt: Date;
        qaEnabled: boolean;
        qaModerated: boolean;
        eventId: string;
        eventTitle: string;
        room: { id: number; name: string; location: string | null } | null;
      },
      role: MySessionRole,
    ) => {
      const existing = sessionMap.get(sessionData.id);
      const newPriority = rolePriorities[role];

      if (!existing || newPriority > existing.rolePriority) {
        sessionMap.set(sessionData.id, {
          ...sessionData,
          role,
          qaUrl: `${baseUrl}/events/${sessionData.eventId}/sessions/${sessionData.id}/qa`,
          rolePriority: newPriority,
        });
      }
    };

    // 1. Sessions where user is chair
    const chairSessions = await db
      .select({
        id: programSession.id,
        title: programSession.title,
        description: programSession.description,
        startAt: programSession.startAt,
        endAt: programSession.endAt,
        qaEnabled: programSession.qaEnabled,
        qaModerated: programSession.qaModerated,
        eventId: programSession.eventId,
        eventTitle: event.title,
        room: {
          id: room.id,
          name: room.name,
          location: room.location,
        },
      })
      .from(programSession)
      .innerJoin(event, eq(programSession.eventId, event.id))
      .leftJoin(room, eq(programSession.roomId, room.id))
      .where(eq(programSession.chairId, userId));

    for (const session of chairSessions) {
      addSession(
        {
          ...session,
          room: session.room?.id ? session.room : null,
        },
        "chair",
      );
    }

    // 2. Sessions where user is speaker (via accepted submissions)
    const speakerSessions = await db
      .select({
        id: programSession.id,
        title: programSession.title,
        description: programSession.description,
        startAt: programSession.startAt,
        endAt: programSession.endAt,
        qaEnabled: programSession.qaEnabled,
        qaModerated: programSession.qaModerated,
        eventId: programSession.eventId,
        eventTitle: event.title,
        room: {
          id: room.id,
          name: room.name,
          location: room.location,
        },
      })
      .from(programSession)
      .innerJoin(
        sessionAssignment,
        eq(sessionAssignment.sessionId, programSession.id),
      )
      .innerJoin(submission, eq(sessionAssignment.submissionId, submission.id))
      .innerJoin(event, eq(programSession.eventId, event.id))
      .leftJoin(room, eq(programSession.roomId, room.id))
      .where(
        and(
          eq(submission.submitterId, userId),
          eq(submission.status, "accepted"),
        ),
      );

    for (const session of speakerSessions) {
      addSession(
        {
          ...session,
          room: session.room?.id ? session.room : null,
        },
        "speaker",
      );
    }

    // 3. Sessions in events where user is committee member
    const committeeSessions = await db
      .select({
        id: programSession.id,
        title: programSession.title,
        description: programSession.description,
        startAt: programSession.startAt,
        endAt: programSession.endAt,
        qaEnabled: programSession.qaEnabled,
        qaModerated: programSession.qaModerated,
        eventId: programSession.eventId,
        eventTitle: event.title,
        room: {
          id: room.id,
          name: room.name,
          location: room.location,
        },
      })
      .from(programSession)
      .innerJoin(event, eq(programSession.eventId, event.id))
      .innerJoin(eventCommittee, eq(eventCommittee.eventId, event.id))
      .leftJoin(room, eq(programSession.roomId, room.id))
      .where(eq(eventCommittee.userId, userId));

    for (const session of committeeSessions) {
      addSession(
        {
          ...session,
          room: session.room?.id ? session.room : null,
        },
        "committee",
      );
    }

    // Convert map to array, remove internal priority field, and sort by startAt
    const sessions = Array.from(sessionMap.values())
      .map(({ rolePriority: _, ...session }) => session)
      .sort((a, b) => a.startAt.getTime() - b.startAt.getTime());

    return { sessions };
  });
