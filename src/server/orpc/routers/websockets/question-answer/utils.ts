import { db } from "@/server/db";
import {
  programSession,
  event,
  eventCommunicator,
  eventSpeakers,
} from "@/server/db/schema";
import { eq, and } from "drizzle-orm";

export type SessionManagerInfo = {
  isOrganizer: boolean;
  isChair: boolean;
  isCommunicator: boolean;
  isSpeaker: boolean;
  isSessionManager: boolean;
  eventId: string;
};

/**
 * Check if a user is a session manager for a given session.
 * Session managers include:
 * - Event organizer
 * - Session chair
 * - Event communicators
 * - Event speakers (with accepted status)
 */
export async function getSessionManagerInfo(
  sessionId: string,
  userId: string,
): Promise<SessionManagerInfo | null> {
  // Get session and event info
  const sessionData = await db
    .select({
      id: programSession.id,
      eventId: programSession.eventId,
      chairId: programSession.chairId,
    })
    .from(programSession)
    .where(eq(programSession.id, sessionId))
    .limit(1);

  if (sessionData.length === 0 || !sessionData[0]) {
    return null;
  }

  const session = sessionData[0];

  // Get event organizer
  const eventData = await db
    .select({ organizerId: event.organizerId })
    .from(event)
    .where(eq(event.id, session.eventId))
    .limit(1);

  const isOrganizer = eventData[0]?.organizerId === userId;
  const isChair = session.chairId === userId;

  // Check if user is a communicator
  const communicatorRecord = await db
    .select({ id: eventCommunicator.id })
    .from(eventCommunicator)
    .where(
      and(
        eq(eventCommunicator.eventId, session.eventId),
        eq(eventCommunicator.userId, userId),
      ),
    )
    .limit(1);

  const isCommunicator = communicatorRecord.length > 0;

  // Check if user is an accepted speaker
  const speaker = await db
    .select({ id: eventSpeakers.id })
    .from(eventSpeakers)
    .where(
      and(
        eq(eventSpeakers.eventId, session.eventId),
        eq(eventSpeakers.userId, userId),
        eq(eventSpeakers.status, "accepted"),
      ),
    )
    .limit(1);

  const isSpeaker = speaker.length > 0;

  const isSessionManager =
    isOrganizer || isChair || isCommunicator || isSpeaker;

  return {
    isOrganizer,
    isChair,
    isCommunicator,
    isSpeaker,
    isSessionManager,
    eventId: session.eventId,
  };
}
