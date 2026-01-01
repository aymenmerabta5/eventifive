import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { db } from "../../db.js";
import { event, eventSpeakers, eventReviewers, eventCommunicator } from "../../schema.js";
import { eq } from "drizzle-orm";
import { findUser, successResponse, errorResponse } from "./helpers.js";

export function registerUserViewTools(server: McpServer) {
  // =============================================
  // LIST USER INVITATIONS
  // =============================================
  server.registerTool(
    "eventifive_list_user_invitations",
    {
      description:
        "List all speaker invitations, reviewer invitations, and communicator assignments for a specific user",
      inputSchema: z.object({
        userId: z.string().optional().describe("User ID to get invitations for"),
        email: z
          .email()
          .optional()
          .describe("User email to get invitations for (alternative to userId)"),
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

        // Get speaker invites
        const speakerInvites = await db
          .select({
            id: eventSpeakers.id,
            eventId: eventSpeakers.eventId,
            eventTitle: event.title,
            affiliation: eventSpeakers.affiliation,
            status: eventSpeakers.status,
            invitedAt: eventSpeakers.invitedAt,
            respondedAt: eventSpeakers.respondedAt,
          })
          .from(eventSpeakers)
          .innerJoin(event, eq(eventSpeakers.eventId, event.id))
          .where(eq(eventSpeakers.userId, targetUser.id));

        // Get reviewer invites
        const reviewerInvites = await db
          .select({
            id: eventReviewers.id,
            eventId: eventReviewers.eventId,
            eventTitle: event.title,
            status: eventReviewers.status,
            invitedAt: eventReviewers.invitedAt,
            respondedAt: eventReviewers.respondedAt,
          })
          .from(eventReviewers)
          .innerJoin(event, eq(eventReviewers.eventId, event.id))
          .where(eq(eventReviewers.userId, targetUser.id));

        // Get communicator assignments
        const communicatorAssignments = await db
          .select({
            id: eventCommunicator.id,
            eventId: eventCommunicator.eventId,
            eventTitle: event.title,
            assignedAt: eventCommunicator.assignedAt,
          })
          .from(eventCommunicator)
          .innerJoin(event, eq(eventCommunicator.eventId, event.id))
          .where(eq(eventCommunicator.userId, targetUser.id));

        return successResponse({
          success: true,
          user: {
            id: targetUser.id,
            name: targetUser.name,
            email: targetUser.email,
          },
          speakerInvites: {
            count: speakerInvites.length,
            pending: speakerInvites.filter((i) => i.status === "pending").length,
            accepted: speakerInvites.filter((i) => i.status === "accepted").length,
            rejected: speakerInvites.filter((i) => i.status === "rejected").length,
            items: speakerInvites,
          },
          reviewerInvites: {
            count: reviewerInvites.length,
            pending: reviewerInvites.filter((i) => i.status === "pending").length,
            accepted: reviewerInvites.filter((i) => i.status === "accepted").length,
            rejected: reviewerInvites.filter((i) => i.status === "rejected").length,
            items: reviewerInvites,
          },
          communicatorAssignments: {
            count: communicatorAssignments.length,
            items: communicatorAssignments,
          },
        });
      } catch (error) {
        return errorResponse(
          `Error listing user invitations: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
  );
}
