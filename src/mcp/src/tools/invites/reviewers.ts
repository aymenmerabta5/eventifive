import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { db } from "../../db.js";
import {
  user,
  eventReviewers,
  submission,
  reviewAssignment,
} from "../../schema.js";
import { eq, and } from "drizzle-orm";
import {
  findUser,
  findEvent,
  successResponse,
  errorResponse,
} from "./helpers.js";

export function registerReviewerTools(server: McpServer) {
  // =============================================
  // INVITE REVIEWER
  // =============================================
  server.registerTool(
    "eventifive_invite_reviewer",
    {
      description:
        "Invite a user to be a reviewer for an event. Creates a pending invitation.",
      inputSchema: z.object({
        eventId: z.string().describe("ID of the event"),
        userId: z.string().optional().describe("User ID to invite as reviewer"),
        email: z
          .email()
          .optional()
          .describe("User email to invite (alternative to userId)"),
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
          .from(eventReviewers)
          .where(
            and(
              eq(eventReviewers.eventId, input.eventId),
              eq(eventReviewers.userId, targetUser.id),
            ),
          )
          .limit(1);

        if (existingInvite) {
          return errorResponse(
            JSON.stringify(
              {
                success: false,
                message: "User is already invited as reviewer for this event",
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
          .insert(eventReviewers)
          .values({
            eventId: input.eventId,
            userId: targetUser.id,
            status: "pending",
            invitedAt: new Date(),
          })
          .returning();
        const newInvite = result[0]!;

        return successResponse({
          success: true,
          message: "Reviewer invitation created successfully",
          invite: {
            id: newInvite.id,
            eventId: newInvite.eventId,
            eventTitle: targetEvent.title,
            userId: newInvite.userId,
            userName: targetUser.name,
            userEmail: targetUser.email,
            status: newInvite.status,
            invitedAt: newInvite.invitedAt,
          },
        });
      } catch (error) {
        return errorResponse(
          `Error inviting reviewer: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    },
  );

  // =============================================
  // RESPOND TO REVIEWER INVITE
  // =============================================
  server.registerTool(
    "eventifive_respond_reviewer_invite",
    {
      description:
        "Accept or reject a reviewer invitation. When accepting, automatically assigns the reviewer to all existing submissions for the event.",
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
          .from(eventReviewers)
          .where(
            and(
              eq(eventReviewers.eventId, input.eventId),
              eq(eventReviewers.userId, targetUser.id),
            ),
          )
          .limit(1);

        if (!existingInvite) {
          return errorResponse(
            `Error: No reviewer invitation found for this user and event`,
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

        if (input.response === "accept") {
          await db.transaction(async (tx) => {
            await tx
              .update(eventReviewers)
              .set({
                status: "accepted",
                respondedAt: new Date(),
              })
              .where(eq(eventReviewers.id, existingInvite.id));

            const eventSubmissions = await tx
              .select({ id: submission.id })
              .from(submission)
              .where(eq(submission.eventId, input.eventId));

            if (eventSubmissions.length > 0) {
              await tx
                .insert(reviewAssignment)
                .values(
                  eventSubmissions.map((sub) => ({
                    submissionId: sub.id,
                    reviewerId: targetUser.id,
                    assignedAt: new Date(),
                  })),
                )
                .onConflictDoNothing();
            }
          });

          const selectResult = await db
            .select()
            .from(eventReviewers)
            .where(eq(eventReviewers.id, existingInvite.id))
            .limit(1);
          const updatedInvite = selectResult[0]!;

          const assignmentsCount = await db
            .select({ id: reviewAssignment.id })
            .from(reviewAssignment)
            .where(eq(reviewAssignment.reviewerId, targetUser.id));

          return successResponse({
            success: true,
            message: `Reviewer invitation accepted`,
            invite: {
              id: updatedInvite.id,
              eventId: updatedInvite.eventId,
              userId: updatedInvite.userId,
              userName: targetUser.name,
              status: updatedInvite.status,
              invitedAt: updatedInvite.invitedAt,
              respondedAt: updatedInvite.respondedAt,
            },
            reviewAssignmentsCreated: assignmentsCount.length,
          });
        } else {
          const rejectResult = await db
            .update(eventReviewers)
            .set({
              status: "rejected",
              respondedAt: new Date(),
            })
            .where(eq(eventReviewers.id, existingInvite.id))
            .returning();
          const updatedInvite = rejectResult[0]!;

          return successResponse({
            success: true,
            message: `Reviewer invitation rejected`,
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
        }
      } catch (error) {
        return errorResponse(
          `Error responding to reviewer invite: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    },
  );

  // =============================================
  // LIST EVENT REVIEWERS
  // =============================================
  server.registerTool(
    "eventifive_list_event_reviewers",
    {
      description:
        "List all reviewers (invited, accepted, rejected) for an event",
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

        const reviewers = await db
          .select({
            id: eventReviewers.id,
            eventId: eventReviewers.eventId,
            userId: eventReviewers.userId,
            userName: user.name,
            userEmail: user.email,
            status: eventReviewers.status,
            invitedAt: eventReviewers.invitedAt,
            respondedAt: eventReviewers.respondedAt,
          })
          .from(eventReviewers)
          .innerJoin(user, eq(eventReviewers.userId, user.id))
          .where(eq(eventReviewers.eventId, input.eventId));

        const filteredReviewers = input.status
          ? reviewers.filter((r) => r.status === input.status)
          : reviewers;

        return successResponse({
          success: true,
          eventId: input.eventId,
          eventTitle: targetEvent.title,
          count: filteredReviewers.length,
          reviewers: filteredReviewers,
        });
      } catch (error) {
        return errorResponse(
          `Error listing reviewers: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    },
  );

  // =============================================
  // BULK INVITE REVIEWERS
  // =============================================
  server.registerTool(
    "eventifive_bulk_invite_reviewers",
    {
      description:
        "Invite multiple users to be reviewers at an event. Events can have a maximum of 3 reviewers total. Returns detailed results for each invite.",
      inputSchema: z.object({
        eventId: z.string().describe("ID of the event"),
        invites: z
          .array(
            z.object({
              email: z.email().optional().describe("User email to invite"),
              userId: z.string().optional().describe("User ID to invite"),
            }),
          )
          .min(1)
          .max(3)
          .describe("List of users to invite (max 3 due to reviewer limit)"),
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

        // Check current reviewer count
        const currentReviewers = await db
          .select({ id: eventReviewers.id })
          .from(eventReviewers)
          .where(eq(eventReviewers.eventId, input.eventId));

        const currentCount = currentReviewers.length;
        const maxReviewers = 3;
        const availableSlots = maxReviewers - currentCount;

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

        let successfulInvites = 0;

        for (const inviteInput of input.invites) {
          // Check if we've reached the limit
          if (successfulInvites >= availableSlots) {
            results.push({
              input: inviteInput,
              status: "skipped",
              message: `Reviewer limit reached (max ${maxReviewers} per event)`,
            });
            continue;
          }

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
            .from(eventReviewers)
            .where(
              and(
                eq(eventReviewers.eventId, input.eventId),
                eq(eventReviewers.userId, targetUser.id),
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
            .insert(eventReviewers)
            .values({
              eventId: input.eventId,
              userId: targetUser.id,
              status: "pending",
              invitedAt: new Date(),
            })
            .returning();
          const newInvite = insertResult[0]!;

          successfulInvites++;

          results.push({
            input: inviteInput,
            status: "success",
            message: "Reviewer invitation created",
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
          capacity: {
            maxReviewers,
            currentReviewers: currentCount,
            availableSlots,
            afterOperation: currentCount + successfulInvites,
          },
          summary,
          results,
        });
      } catch (error) {
        return errorResponse(
          `Error bulk inviting reviewers: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    },
  );
}
