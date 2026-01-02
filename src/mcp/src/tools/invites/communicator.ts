import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { db } from "../../db.js";
import { user, eventCommunicator } from "../../schema.js";
import { eq, and } from "drizzle-orm";
import {
  findUser,
  findEvent,
  successResponse,
  errorResponse,
} from "./helpers.js";

export function registerCommunicatorTools(server: McpServer) {
  // =============================================
  // ADD COMMUNICATOR
  // =============================================
  server.registerTool(
    "eventifive_add_communicator",
    {
      description:
        "Add a user as a communicator for an event. This is a direct assignment (no invitation flow).",
      inputSchema: z.object({
        eventId: z.string().describe("ID of the event"),
        userId: z
          .string()
          .optional()
          .describe("User ID to add as communicator"),
        email: z
          .email()
          .optional()
          .describe("User email to add (alternative to userId)"),
      }),
    },
    async (input) => {
      try {
        if (!input.userId && !input.email) {
          return errorResponse(
            "Error: Either userId or email must be provided",
          );
        }

        const targetEvent = await findEvent(input.eventId);
        if (!targetEvent) {
          return errorResponse(
            `Error: Event not found with ID: ${input.eventId}`,
          );
        }

        const targetUser = await findUser(input.userId, input.email);
        if (!targetUser) {
          return errorResponse(
            `Error: User not found with ${input.userId ? `ID: ${input.userId}` : `email: ${input.email}`}`,
          );
        }

        const [existingMember] = await db
          .select()
          .from(eventCommunicator)
          .where(
            and(
              eq(eventCommunicator.eventId, input.eventId),
              eq(eventCommunicator.userId, targetUser.id),
            ),
          )
          .limit(1);

        if (existingMember) {
          return errorResponse(
            JSON.stringify(
              {
                success: false,
                message: "User is already a communicator for this event",
                communicator: {
                  id: existingMember.id,
                  assignedAt: existingMember.assignedAt,
                },
              },
              null,
              2,
            ),
          );
        }

        const insertResult = await db
          .insert(eventCommunicator)
          .values({
            eventId: input.eventId,
            userId: targetUser.id,
            assignedAt: new Date(),
          })
          .returning();
        const newCommunicator = insertResult[0]!;

        return successResponse({
          success: true,
          message: "Communicator added successfully",
          communicator: {
            id: newCommunicator.id,
            eventId: newCommunicator.eventId,
            eventTitle: targetEvent.title,
            userId: newCommunicator.userId,
            userName: targetUser.name,
            userEmail: targetUser.email,
            assignedAt: newCommunicator.assignedAt,
          },
        });
      } catch (error) {
        return errorResponse(
          `Error adding communicator: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    },
  );

  // =============================================
  // REMOVE COMMUNICATOR
  // =============================================
  server.registerTool(
    "eventifive_remove_communicator",
    {
      description: "Remove a user from being a communicator for an event",
      inputSchema: z.object({
        eventId: z.string().describe("ID of the event"),
        userId: z
          .string()
          .optional()
          .describe("User ID to remove as communicator"),
        email: z
          .email()
          .optional()
          .describe("User email to remove (alternative to userId)"),
      }),
    },
    async (input) => {
      try {
        if (!input.userId && !input.email) {
          return errorResponse(
            "Error: Either userId or email must be provided",
          );
        }

        const targetUser = await findUser(input.userId, input.email);
        if (!targetUser) {
          return errorResponse(
            `Error: User not found with ${input.userId ? `ID: ${input.userId}` : `email: ${input.email}`}`,
          );
        }

        const [existingMember] = await db
          .select()
          .from(eventCommunicator)
          .where(
            and(
              eq(eventCommunicator.eventId, input.eventId),
              eq(eventCommunicator.userId, targetUser.id),
            ),
          )
          .limit(1);

        if (!existingMember) {
          return errorResponse(
            `Error: User is not a communicator for this event`,
          );
        }

        await db
          .delete(eventCommunicator)
          .where(eq(eventCommunicator.id, existingMember.id));

        return successResponse({
          success: true,
          message: "Communicator removed successfully",
          removedCommunicator: {
            id: existingMember.id,
            eventId: existingMember.eventId,
            userId: existingMember.userId,
            userName: targetUser.name,
          },
        });
      } catch (error) {
        return errorResponse(
          `Error removing communicator: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    },
  );

  // =============================================
  // LIST EVENT COMMUNICATORS
  // =============================================
  server.registerTool(
    "eventifive_list_event_communicators",
    {
      description: "List all communicators for an event",
      inputSchema: z.object({
        eventId: z.string().describe("ID of the event"),
      }),
    },
    async (input) => {
      try {
        const targetEvent = await findEvent(input.eventId);
        if (!targetEvent) {
          return errorResponse(
            `Error: Event not found with ID: ${input.eventId}`,
          );
        }

        const communicators = await db
          .select({
            id: eventCommunicator.id,
            eventId: eventCommunicator.eventId,
            userId: eventCommunicator.userId,
            userName: user.name,
            userEmail: user.email,
            assignedAt: eventCommunicator.assignedAt,
          })
          .from(eventCommunicator)
          .innerJoin(user, eq(eventCommunicator.userId, user.id))
          .where(eq(eventCommunicator.eventId, input.eventId));

        return successResponse({
          success: true,
          eventId: input.eventId,
          eventTitle: targetEvent.title,
          count: communicators.length,
          communicators: communicators,
        });
      } catch (error) {
        return errorResponse(
          `Error listing communicators: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    },
  );
}
