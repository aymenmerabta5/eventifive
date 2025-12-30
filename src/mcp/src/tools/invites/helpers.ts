import { db } from "../../db.js";
import { user, event } from "../../schema.js";
import { eq } from "drizzle-orm";

/**
 * Find a user by ID or email
 */
export async function findUser(userId?: string, email?: string) {
  if (userId) {
    const [foundUser] = await db
      .select({ id: user.id, name: user.name, email: user.email })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);
    return foundUser;
  }
  if (email) {
    const [foundUser] = await db
      .select({ id: user.id, name: user.name, email: user.email })
      .from(user)
      .where(eq(user.email, email))
      .limit(1);
    return foundUser;
  }
  return null;
}

/**
 * Find an event by ID
 */
export async function findEvent(eventId: string) {
  const [foundEvent] = await db
    .select({ id: event.id, title: event.title })
    .from(event)
    .where(eq(event.id, eventId))
    .limit(1);
  return foundEvent;
}

/**
 * Create a standard MCP success response
 */
export function successResponse(data: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

/**
 * Create a standard MCP error response
 */
export function errorResponse(message: string) {
  return {
    content: [
      {
        type: "text" as const,
        text: message,
      },
    ],
    isError: true,
  };
}
