import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { db } from "../db.js";
import {
  user,
  event,
  eventSpeakers,
  eventReviewers,
  eventCommittee,
  submission,
  reviewAssignment,
} from "../schema.js";
import { eq, and } from "drizzle-orm";

// Helper to find user by ID or email
async function findUser(userId?: string, email?: string) {
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

// Helper to verify event exists
async function findEvent(eventId: string) {
  const [foundEvent] = await db
    .select({ id: event.id, title: event.title })
    .from(event)
    .where(eq(event.id, eventId))
    .limit(1);
  return foundEvent;
}

export function registerInviteTools(server: McpServer) {
  // =============================================
  // SPEAKER INVITATION TOOLS
  // =============================================

  // Invite speaker
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
          return {
            content: [
              {
                type: "text" as const,
                text: "Error: Either userId or email must be provided",
              },
            ],
            isError: true,
          };
        }

        // Find the event
        const targetEvent = await findEvent(input.eventId);
        if (!targetEvent) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Error: Event not found with ID: ${input.eventId}`,
              },
            ],
            isError: true,
          };
        }

        // Find the user
        const targetUser = await findUser(input.userId, input.email);
        if (!targetUser) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Error: User not found with ${input.userId ? `ID: ${input.userId}` : `email: ${input.email}`}`,
              },
            ],
            isError: true,
          };
        }

        // Check if already invited
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
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(
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
              },
            ],
            isError: true,
          };
        }

        // Create the invitation
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

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
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
                },
                null,
                2,
              ),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error inviting speaker: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // Respond to speaker invite (accept/reject)
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
          return {
            content: [
              {
                type: "text" as const,
                text: "Error: Either userId or email must be provided",
              },
            ],
            isError: true,
          };
        }

        // Find the user
        const targetUser = await findUser(input.userId, input.email);
        if (!targetUser) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Error: User not found with ${input.userId ? `ID: ${input.userId}` : `email: ${input.email}`}`,
              },
            ],
            isError: true,
          };
        }

        // Find the pending invite
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
          return {
            content: [
              {
                type: "text" as const,
                text: `Error: No speaker invitation found for this user and event`,
              },
            ],
            isError: true,
          };
        }

        if (existingInvite.status !== "pending") {
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(
                  {
                    success: false,
                    message: `Invitation has already been ${existingInvite.status}`,
                    invite: existingInvite,
                  },
                  null,
                  2,
                ),
              },
            ],
            isError: true,
          };
        }

        // Update the invite
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

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
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
                },
                null,
                2,
              ),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error responding to speaker invite: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // List event speakers
  server.registerTool(
    "eventifive_list_event_speakers",
    {
      description: "List all speakers (invited, accepted, rejected) for an event",
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
          return {
            content: [
              {
                type: "text" as const,
                text: `Error: Event not found with ID: ${input.eventId}`,
              },
            ],
            isError: true,
          };
        }

        let query = db
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

        const speakers = await query;

        // Filter by status if provided
        const filteredSpeakers = input.status
          ? speakers.filter((s) => s.status === input.status)
          : speakers;

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: true,
                  eventId: input.eventId,
                  eventTitle: targetEvent.title,
                  count: filteredSpeakers.length,
                  speakers: filteredSpeakers,
                },
                null,
                2,
              ),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error listing speakers: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // =============================================
  // REVIEWER INVITATION TOOLS
  // =============================================

  // Invite reviewer
  server.registerTool(
    "eventifive_invite_reviewer",
    {
      description:
        "Invite a user to be a reviewer for an event. Creates a pending invitation.",
      inputSchema: z.object({
        eventId: z.string().describe("ID of the event"),
        userId: z
          .string()
          .optional()
          .describe("User ID to invite as reviewer"),
        email: z
          .email()
          .optional()
          .describe("User email to invite (alternative to userId)"),
      }),
    },
    async (input) => {
      try {
        if (!input.userId && !input.email) {
          return {
            content: [
              {
                type: "text" as const,
                text: "Error: Either userId or email must be provided",
              },
            ],
            isError: true,
          };
        }

        // Find the event
        const targetEvent = await findEvent(input.eventId);
        if (!targetEvent) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Error: Event not found with ID: ${input.eventId}`,
              },
            ],
            isError: true,
          };
        }

        // Find the user
        const targetUser = await findUser(input.userId, input.email);
        if (!targetUser) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Error: User not found with ${input.userId ? `ID: ${input.userId}` : `email: ${input.email}`}`,
              },
            ],
            isError: true,
          };
        }

        // Check if already invited
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
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(
                  {
                    success: false,
                    message:
                      "User is already invited as reviewer for this event",
                    existingInvite: {
                      id: existingInvite.id,
                      status: existingInvite.status,
                      invitedAt: existingInvite.invitedAt,
                    },
                  },
                  null,
                  2,
                ),
              },
            ],
            isError: true,
          };
        }

        // Create the invitation
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

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
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
                },
                null,
                2,
              ),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error inviting reviewer: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // Respond to reviewer invite (accept/reject)
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
          return {
            content: [
              {
                type: "text" as const,
                text: "Error: Either userId or email must be provided",
              },
            ],
            isError: true,
          };
        }

        // Find the user
        const targetUser = await findUser(input.userId, input.email);
        if (!targetUser) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Error: User not found with ${input.userId ? `ID: ${input.userId}` : `email: ${input.email}`}`,
              },
            ],
            isError: true,
          };
        }

        // Find the pending invite
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
          return {
            content: [
              {
                type: "text" as const,
                text: `Error: No reviewer invitation found for this user and event`,
              },
            ],
            isError: true,
          };
        }

        if (existingInvite.status !== "pending") {
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(
                  {
                    success: false,
                    message: `Invitation has already been ${existingInvite.status}`,
                    invite: existingInvite,
                  },
                  null,
                  2,
                ),
              },
            ],
            isError: true,
          };
        }

        // Update the invite
        const newStatus = input.response === "accept" ? "accepted" : "rejected";

        // Use transaction for accept to also create review assignments
        if (input.response === "accept") {
          await db.transaction(async (tx) => {
            // Update reviewer status
            await tx
              .update(eventReviewers)
              .set({
                status: "accepted",
                respondedAt: new Date(),
              })
              .where(eq(eventReviewers.id, existingInvite.id));

            // Get all submissions for the event
            const eventSubmissions = await tx
              .select({ id: submission.id })
              .from(submission)
              .where(eq(submission.eventId, input.eventId));

            // Create review assignments for each submission
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

          // Get updated invite
          const selectResult = await db
            .select()
            .from(eventReviewers)
            .where(eq(eventReviewers.id, existingInvite.id))
            .limit(1);
          const updatedInvite = selectResult[0]!;

          // Count assignments
          const assignmentsCount = await db
            .select({ id: reviewAssignment.id })
            .from(reviewAssignment)
            .where(eq(reviewAssignment.reviewerId, targetUser.id));

          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(
                  {
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
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        } else {
          // Just reject
          const rejectResult = await db
            .update(eventReviewers)
            .set({
              status: "rejected",
              respondedAt: new Date(),
            })
            .where(eq(eventReviewers.id, existingInvite.id))
            .returning();
          const updatedInvite = rejectResult[0]!;

          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(
                  {
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
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error responding to reviewer invite: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // List event reviewers
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
          return {
            content: [
              {
                type: "text" as const,
                text: `Error: Event not found with ID: ${input.eventId}`,
              },
            ],
            isError: true,
          };
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

        // Filter by status if provided
        const filteredReviewers = input.status
          ? reviewers.filter((r) => r.status === input.status)
          : reviewers;

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: true,
                  eventId: input.eventId,
                  eventTitle: targetEvent.title,
                  count: filteredReviewers.length,
                  reviewers: filteredReviewers,
                },
                null,
                2,
              ),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error listing reviewers: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // =============================================
  // COMMITTEE MEMBER TOOLS
  // =============================================

  // Add committee member
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
          return {
            content: [
              {
                type: "text" as const,
                text: "Error: Either userId or email must be provided",
              },
            ],
            isError: true,
          };
        }

        // Find the event
        const targetEvent = await findEvent(input.eventId);
        if (!targetEvent) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Error: Event not found with ID: ${input.eventId}`,
              },
            ],
            isError: true,
          };
        }

        // Find the user
        const targetUser = await findUser(input.userId, input.email);
        if (!targetUser) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Error: User not found with ${input.userId ? `ID: ${input.userId}` : `email: ${input.email}`}`,
              },
            ],
            isError: true,
          };
        }

        // Check if already a member
        const [existingMember] = await db
          .select()
          .from(eventCommittee)
          .where(
            and(
              eq(eventCommittee.eventId, input.eventId),
              eq(eventCommittee.userId, targetUser.id),
            ),
          )
          .limit(1);

        if (existingMember) {
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(
                  {
                    success: false,
                    message: "User is already a committee member for this event",
                    member: {
                      id: existingMember.id,
                      assignedAt: existingMember.assignedAt,
                    },
                  },
                  null,
                  2,
                ),
              },
            ],
            isError: true,
          };
        }

        // Add to committee
        const insertResult = await db
          .insert(eventCommittee)
          .values({
            eventId: input.eventId,
            userId: targetUser.id,
            assignedAt: new Date(),
          })
          .returning();
        const newMember = insertResult[0]!;

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
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
                },
                null,
                2,
              ),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error adding committee member: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // Remove committee member
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
          return {
            content: [
              {
                type: "text" as const,
                text: "Error: Either userId or email must be provided",
              },
            ],
            isError: true,
          };
        }

        // Find the user
        const targetUser = await findUser(input.userId, input.email);
        if (!targetUser) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Error: User not found with ${input.userId ? `ID: ${input.userId}` : `email: ${input.email}`}`,
              },
            ],
            isError: true,
          };
        }

        // Check if member exists
        const [existingMember] = await db
          .select()
          .from(eventCommittee)
          .where(
            and(
              eq(eventCommittee.eventId, input.eventId),
              eq(eventCommittee.userId, targetUser.id),
            ),
          )
          .limit(1);

        if (!existingMember) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Error: User is not a committee member for this event`,
              },
            ],
            isError: true,
          };
        }

        // Remove from committee
        await db
          .delete(eventCommittee)
          .where(eq(eventCommittee.id, existingMember.id));

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: true,
                  message: "Committee member removed successfully",
                  removedMember: {
                    id: existingMember.id,
                    eventId: existingMember.eventId,
                    userId: existingMember.userId,
                    userName: targetUser.name,
                  },
                },
                null,
                2,
              ),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error removing committee member: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // List event committee
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
          return {
            content: [
              {
                type: "text" as const,
                text: `Error: Event not found with ID: ${input.eventId}`,
              },
            ],
            isError: true,
          };
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

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: true,
                  eventId: input.eventId,
                  eventTitle: targetEvent.title,
                  count: members.length,
                  members: members,
                },
                null,
                2,
              ),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error listing committee: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // =============================================
  // USER INVITATIONS VIEW
  // =============================================

  // List all invitations for a user
  server.registerTool(
    "eventifive_list_user_invitations",
    {
      description:
        "List all speaker invitations, reviewer invitations, and committee assignments for a specific user",
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
          return {
            content: [
              {
                type: "text" as const,
                text: "Error: Either userId or email must be provided",
              },
            ],
            isError: true,
          };
        }

        // Find the user
        const targetUser = await findUser(input.userId, input.email);
        if (!targetUser) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Error: User not found with ${input.userId ? `ID: ${input.userId}` : `email: ${input.email}`}`,
              },
            ],
            isError: true,
          };
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

        // Get committee assignments
        const committeeAssignments = await db
          .select({
            id: eventCommittee.id,
            eventId: eventCommittee.eventId,
            eventTitle: event.title,
            assignedAt: eventCommittee.assignedAt,
          })
          .from(eventCommittee)
          .innerJoin(event, eq(eventCommittee.eventId, event.id))
          .where(eq(eventCommittee.userId, targetUser.id));

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: true,
                  user: {
                    id: targetUser.id,
                    name: targetUser.name,
                    email: targetUser.email,
                  },
                  speakerInvites: {
                    count: speakerInvites.length,
                    pending: speakerInvites.filter((i) => i.status === "pending")
                      .length,
                    accepted: speakerInvites.filter(
                      (i) => i.status === "accepted",
                    ).length,
                    rejected: speakerInvites.filter(
                      (i) => i.status === "rejected",
                    ).length,
                    items: speakerInvites,
                  },
                  reviewerInvites: {
                    count: reviewerInvites.length,
                    pending: reviewerInvites.filter(
                      (i) => i.status === "pending",
                    ).length,
                    accepted: reviewerInvites.filter(
                      (i) => i.status === "accepted",
                    ).length,
                    rejected: reviewerInvites.filter(
                      (i) => i.status === "rejected",
                    ).length,
                    items: reviewerInvites,
                  },
                  committeeAssignments: {
                    count: committeeAssignments.length,
                    items: committeeAssignments,
                  },
                },
                null,
                2,
              ),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error listing user invitations: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );
}
