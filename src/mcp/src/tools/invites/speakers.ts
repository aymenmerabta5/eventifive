import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { db } from "../../db.js";
import { user, eventSpeakers } from "../../schema.js";
import { eq, and } from "drizzle-orm";
import {
  findUser,
  findEvent,
  successResponse,
  errorResponse,
} from "./helpers.js";

export function registerSpeakerTools(server: McpServer) {
  // =============================================
  // INVITE SPEAKER
  // =============================================
  server.registerTool(
    "eventifive_invite_speaker",
    {
      description:
        "Invite a user to be a speaker at an event. Creates a pending invitation that the user can accept or reject.",
      inputSchema: z.object({
        eventId: z.string().describe("ID of the event"),
        userId: z.string().optional().describe("User ID to invite as speaker"),
        email: z
          .email()
          .optional()
          .describe("User email to invite (alternative to userId)"),
        affiliation: z
          .string()
          .optional()
          .describe("Speaker's affiliation/institution"),
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

        const [existingInvite] = await db
          .select()
          .from(eventSpeakers)
          .where(
            and(
              eq(eventSpeakers.eventId, input.eventId),
              eq(eventSpeakers.userId, targetUser.id),
            ),
          )
          .limit(1);

        if (existingInvite) {
          return errorResponse(
            JSON.stringify(
              {
                success: false,
                message: "User is already invited as speaker for this event",
                existingInvite: {
                  id: existingInvite.id,
                  status: existingInvite.status,
                  invitedAt: existingInvite.invitedAt,
                },
              },
              null,
              2,
            ),
          );
        }

        const result = await db
          .insert(eventSpeakers)
          .values({
            eventId: input.eventId,
            userId: targetUser.id,
            affiliation: input.affiliation,
            status: "pending",
            invitedAt: new Date(),
          })
          .returning();
        const newInvite = result[0]!;

        return successResponse({
          success: true,
          message: "Speaker invitation created successfully",
          invite: {
            id: newInvite.id,
            eventId: newInvite.eventId,
            eventTitle: targetEvent.title,
            userId: newInvite.userId,
            userName: targetUser.name,
            userEmail: targetUser.email,
            affiliation: newInvite.affiliation,
            status: newInvite.status,
            invitedAt: newInvite.invitedAt,
          },
        });
      } catch (error) {
        return errorResponse(
          `Error inviting speaker: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    },
  );

  // =============================================
  // RESPOND TO SPEAKER INVITE
  // =============================================
  server.registerTool(
    "eventifive_respond_speaker_invite",
    {
      description:
        "Accept or reject a speaker invitation. Simulates the user responding to their invite.",
      inputSchema: z.object({
        eventId: z.string().describe("ID of the event"),
        userId: z.string().optional().describe("User ID who is responding"),
        email: z
          .email()
          .optional()
          .describe("User email who is responding (alternative to userId)"),
        response: z
          .enum(["accept", "reject"])
          .describe("Whether to accept or reject the invitation"),
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

        const [existingInvite] = await db
          .select()
          .from(eventSpeakers)
          .where(
            and(
              eq(eventSpeakers.eventId, input.eventId),
              eq(eventSpeakers.userId, targetUser.id),
            ),
          )
          .limit(1);

        if (!existingInvite) {
          return errorResponse(
            `Error: No speaker invitation found for this user and event`,
          );
        }

        if (existingInvite.status !== "pending") {
          return errorResponse(
            JSON.stringify(
              {
                success: false,
                message: `Invitation has already been ${existingInvite.status}`,
                invite: existingInvite,
              },
              null,
              2,
            ),
          );
        }

        const newStatus = input.response === "accept" ? "accepted" : "rejected";
        const updateResult = await db
          .update(eventSpeakers)
          .set({
            status: newStatus,
            respondedAt: new Date(),
          })
          .where(eq(eventSpeakers.id, existingInvite.id))
          .returning();
        const updatedInvite = updateResult[0]!;

        return successResponse({
          success: true,
          message: `Speaker invitation ${newStatus}`,
          invite: {
            id: updatedInvite.id,
            eventId: updatedInvite.eventId,
            userId: updatedInvite.userId,
            userName: targetUser.name,
            status: updatedInvite.status,
            invitedAt: updatedInvite.invitedAt,
            respondedAt: updatedInvite.respondedAt,
          },
        });
      } catch (error) {
        return errorResponse(
          `Error responding to speaker invite: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    },
  );

  // =============================================
  // LIST EVENT SPEAKERS
  // =============================================
  server.registerTool(
    "eventifive_list_event_speakers",
    {
      description:
        "List all speakers (invited, accepted, rejected) for an event",
      inputSchema: z.object({
        eventId: z.string().describe("ID of the event"),
        status: z
          .enum(["pending", "accepted", "rejected"])
          .optional()
          .describe("Filter by status (optional)"),
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

        const speakers = await db
          .select({
            id: eventSpeakers.id,
            eventId: eventSpeakers.eventId,
            userId: eventSpeakers.userId,
            userName: user.name,
            userEmail: user.email,
            affiliation: eventSpeakers.affiliation,
            status: eventSpeakers.status,
            invitedAt: eventSpeakers.invitedAt,
            respondedAt: eventSpeakers.respondedAt,
          })
          .from(eventSpeakers)
          .innerJoin(user, eq(eventSpeakers.userId, user.id))
          .where(eq(eventSpeakers.eventId, input.eventId));

        const filteredSpeakers = input.status
          ? speakers.filter((s) => s.status === input.status)
          : speakers;

        return successResponse({
          success: true,
          eventId: input.eventId,
          eventTitle: targetEvent.title,
          count: filteredSpeakers.length,
          speakers: filteredSpeakers,
        });
      } catch (error) {
        return errorResponse(
          `Error listing speakers: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    },
  );

  // =============================================
  // BULK INVITE SPEAKERS
  // =============================================
  server.registerTool(
    "eventifive_bulk_invite_speakers",
    {
      description:
        "Invite multiple users to be speakers at an event in a single operation. Returns detailed results for each invite.",
      inputSchema: z.object({
        eventId: z.string().describe("ID of the event"),
        invites: z
          .array(
            z.object({
              email: z.email().optional().describe("User email to invite"),
              userId: z.string().optional().describe("User ID to invite"),
              affiliation: z
                .string()
                .optional()
                .describe("Speaker's affiliation/institution"),
            }),
          )
          .min(1)
          .max(50)
          .describe("List of users to invite (max 50)"),
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

        const results: Array<{
          input: { email?: string; userId?: string };
          status: "success" | "skipped" | "error";
          message: string;
          invite?: {
            id: number;
            status: string;
            invitedAt: Date;
          };
        }> = [];

        for (const inviteInput of input.invites) {
          if (!inviteInput.userId && !inviteInput.email) {
            results.push({
              input: inviteInput,
              status: "error",
              message: "Either userId or email must be provided",
            });
            continue;
          }

          const targetUser = await findUser(
            inviteInput.userId,
            inviteInput.email,
          );
          if (!targetUser) {
            results.push({
              input: inviteInput,
              status: "error",
              message: `User not found with ${inviteInput.userId ? `ID: ${inviteInput.userId}` : `email: ${inviteInput.email}`}`,
            });
            continue;
          }

          const [existingInvite] = await db
            .select()
            .from(eventSpeakers)
            .where(
              and(
                eq(eventSpeakers.eventId, input.eventId),
                eq(eventSpeakers.userId, targetUser.id),
              ),
            )
            .limit(1);

          if (existingInvite) {
            results.push({
              input: inviteInput,
              status: "skipped",
              message: `Already invited (status: ${existingInvite.status})`,
              invite: {
                id: existingInvite.id,
                status: existingInvite.status,
                invitedAt: existingInvite.invitedAt,
              },
            });
            continue;
          }

          const insertResult = await db
            .insert(eventSpeakers)
            .values({
              eventId: input.eventId,
              userId: targetUser.id,
              affiliation: inviteInput.affiliation,
              status: "pending",
              invitedAt: new Date(),
            })
            .returning();
          const newInvite = insertResult[0]!;

          results.push({
            input: inviteInput,
            status: "success",
            message: "Speaker invitation created",
            invite: {
              id: newInvite.id,
              status: newInvite.status,
              invitedAt: newInvite.invitedAt,
            },
          });
        }

        const summary = {
          total: results.length,
          successful: results.filter((r) => r.status === "success").length,
          skipped: results.filter((r) => r.status === "skipped").length,
          failed: results.filter((r) => r.status === "error").length,
        };

        return successResponse({
          success: true,
          eventId: input.eventId,
          eventTitle: targetEvent.title,
          summary,
          results,
        });
      } catch (error) {
        return errorResponse(
          `Error bulk inviting speakers: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    },
  );
}
