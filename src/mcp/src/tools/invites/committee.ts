import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { db } from "../../db.js";
import { user, eventCommittee } from "../../schema.js";
import { eq, and } from "drizzle-orm";
import { findUser, findEvent, successResponse, errorResponse } from "./helpers.js";

export function registerCommitteeTools(server: McpServer) {
  // =============================================
  // ADD COMMITTEE MEMBER
  // =============================================
  server.registerTool(
    "eventifive_add_committee_member",
    {
      description:
        "Add a user to the event committee. This is a direct assignment (no invitation flow).",
      inputSchema: z.object({
        eventId: z.string().describe("ID of the event"),
        userId: z
          .string()
          .optional()
          .describe("User ID to add to committee"),
        email: z
          .email()
          .optional()
          .describe("User email to add (alternative to userId)"),
      }),
    },
    async (input) => {
      try {
        if (!input.userId && !input.email) {
          return errorResponse("Error: Either userId or email must be provided");
        }

        const targetEvent = await findEvent(input.eventId);
        if (!targetEvent) {
          return errorResponse(`Error: Event not found with ID: ${input.eventId}`);
        }

        const targetUser = await findUser(input.userId, input.email);
        if (!targetUser) {
          return errorResponse(
            `Error: User not found with ${input.userId ? `ID: ${input.userId}` : `email: ${input.email}`}`
          );
        }

        const [existingMember] = await db
          .select()
          .from(eventCommittee)
          .where(
            and(
              eq(eventCommittee.eventId, input.eventId),
              eq(eventCommittee.userId, targetUser.id)
            )
          )
          .limit(1);

        if (existingMember) {
          return errorResponse(
            JSON.stringify(
              {
                success: false,
                message: "User is already a committee member for this event",
                member: {
                  id: existingMember.id,
                  assignedAt: existingMember.assignedAt,
                },
              },
              null,
              2
            )
          );
        }

        const insertResult = await db
          .insert(eventCommittee)
          .values({
            eventId: input.eventId,
            userId: targetUser.id,
            assignedAt: new Date(),
          })
          .returning();
        const newMember = insertResult[0]!;

        return successResponse({
          success: true,
          message: "Committee member added successfully",
          member: {
            id: newMember.id,
            eventId: newMember.eventId,
            eventTitle: targetEvent.title,
            userId: newMember.userId,
            userName: targetUser.name,
            userEmail: targetUser.email,
            assignedAt: newMember.assignedAt,
          },
        });
      } catch (error) {
        return errorResponse(
          `Error adding committee member: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
  );

  // =============================================
  // REMOVE COMMITTEE MEMBER
  // =============================================
  server.registerTool(
    "eventifive_remove_committee_member",
    {
      description: "Remove a user from the event committee",
      inputSchema: z.object({
        eventId: z.string().describe("ID of the event"),
        userId: z
          .string()
          .optional()
          .describe("User ID to remove from committee"),
        email: z
          .email()
          .optional()
          .describe("User email to remove (alternative to userId)"),
      }),
    },
    async (input) => {
      try {
        if (!input.userId && !input.email) {
          return errorResponse("Error: Either userId or email must be provided");
        }

        const targetUser = await findUser(input.userId, input.email);
        if (!targetUser) {
          return errorResponse(
            `Error: User not found with ${input.userId ? `ID: ${input.userId}` : `email: ${input.email}`}`
          );
        }

        const [existingMember] = await db
          .select()
          .from(eventCommittee)
          .where(
            and(
              eq(eventCommittee.eventId, input.eventId),
              eq(eventCommittee.userId, targetUser.id)
            )
          )
          .limit(1);

        if (!existingMember) {
          return errorResponse(
            `Error: User is not a committee member for this event`
          );
        }

        await db
          .delete(eventCommittee)
          .where(eq(eventCommittee.id, existingMember.id));

        return successResponse({
          success: true,
          message: "Committee member removed successfully",
          removedMember: {
            id: existingMember.id,
            eventId: existingMember.eventId,
            userId: existingMember.userId,
            userName: targetUser.name,
          },
        });
      } catch (error) {
        return errorResponse(
          `Error removing committee member: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
  );

  // =============================================
  // LIST EVENT COMMITTEE
  // =============================================
  server.registerTool(
    "eventifive_list_event_committee",
    {
      description: "List all committee members for an event",
      inputSchema: z.object({
        eventId: z.string().describe("ID of the event"),
      }),
    },
    async (input) => {
      try {
        const targetEvent = await findEvent(input.eventId);
        if (!targetEvent) {
          return errorResponse(`Error: Event not found with ID: ${input.eventId}`);
        }

        const members = await db
          .select({
            id: eventCommittee.id,
            eventId: eventCommittee.eventId,
            userId: eventCommittee.userId,
            userName: user.name,
            userEmail: user.email,
            assignedAt: eventCommittee.assignedAt,
          })
          .from(eventCommittee)
          .innerJoin(user, eq(eventCommittee.userId, user.id))
          .where(eq(eventCommittee.eventId, input.eventId));

        return successResponse({
          success: true,
          eventId: input.eventId,
          eventTitle: targetEvent.title,
          count: members.length,
          members: members,
        });
      } catch (error) {
        return errorResponse(
          `Error listing committee: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
  );
}
