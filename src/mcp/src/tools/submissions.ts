import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { faker } from "@faker-js/faker";
import { eq } from "drizzle-orm";
import { db } from "../db.js";
import {
  submission,
  event,
  user,
  submissionTypeValues,
  submissionStatusValues,
} from "../schema.js";

export function registerSubmissionTools(server: McpServer) {
  // Create a single submission
  server.registerTool(
    "eventifive_create_submission",
    {
      description: "Create a test submission for an event",
      inputSchema: z.object({
        eventId: z.string().describe("Event ID for the submission"),
        title: z.string().optional().describe("Submission title (auto-generated if not provided)"),
        abstract: z.string().optional().describe("Submission abstract (auto-generated if not provided)"),
        keywords: z.string().optional().describe("Comma-separated keywords"),
        type: z
          .enum(submissionTypeValues)
          .optional()
          .default("oral")
          .describe("Submission type: oral, poster, workshop, demo"),
        status: z
          .enum(submissionStatusValues)
          .optional()
          .default("draft")
          .describe("Status: draft, accepted, rejected"),
        submitterId: z.string().optional().describe("Submitter user ID (uses first user if not provided)"),
      }),
    },
    async (input) => {
      try {
        const [eventData] = await db
          .select({ id: event.id })
          .from(event)
          .where(eq(event.id, input.eventId))
          .limit(1);

        if (!eventData) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Event not found with ID: ${input.eventId}`,
              },
            ],
            isError: true,
          };
        }

        let submitterId = input.submitterId;
        if (!submitterId) {
          const [firstUser] = await db.select({ id: user.id }).from(user).limit(1);
          if (!firstUser) {
            return {
              content: [
                {
                  type: "text" as const,
                  text: "Error: No users found. Create a user first.",
                },
              ],
              isError: true,
            };
          }
          submitterId = firstUser.id;
        }

        const submissionId = uuidv4();
        const now = new Date();

        const submissionTitle =
          input.title ||
          `${faker.science.chemicalElement().name} ${faker.company.buzzNoun()}: A ${faker.company.buzzAdjective()} Approach`;

        const submissionAbstract = input.abstract || faker.lorem.paragraphs(3);

        const keywords =
          input.keywords ||
          [
            faker.science.chemicalElement().name,
            faker.company.buzzNoun(),
            faker.hacker.noun(),
          ].join(", ");

        await db.insert(submission).values({
          id: submissionId,
          eventId: input.eventId,
          title: submissionTitle,
          abstract: submissionAbstract,
          keywords,
          type: input.type || "oral",
          status: input.status || "draft",
          submitterId,
          submittedAt: now,
          updatedAt: now,
        });

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: true,
                  submission: {
                    id: submissionId,
                    eventId: input.eventId,
                    title: submissionTitle,
                    type: input.type || "oral",
                    status: input.status || "draft",
                    submitterId,
                  },
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error creating submission: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Create multiple submissions
  server.registerTool(
    "eventifive_create_submissions_bulk",
    {
      description: "Create multiple test submissions for an event",
      inputSchema: z.object({
        eventId: z.string().describe("Event ID for the submissions"),
        count: z.number().min(1).max(50).describe("Number of submissions to create (1-50)"),
        type: z.enum(submissionTypeValues).optional().describe("Submission type (random if not specified)"),
        status: z
          .enum(submissionStatusValues)
          .optional()
          .default("draft")
          .describe("Status for all submissions: draft, accepted, rejected"),
      }),
    },
    async (input) => {
      try {
        const [eventData] = await db
          .select({ id: event.id })
          .from(event)
          .where(eq(event.id, input.eventId))
          .limit(1);

        if (!eventData) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Event not found with ID: ${input.eventId}`,
              },
            ],
            isError: true,
          };
        }

        const users = await db.select({ id: user.id }).from(user);
        if (users.length === 0) {
          return {
            content: [
              {
                type: "text" as const,
                text: "Error: No users found. Create users first.",
              },
            ],
            isError: true,
          };
        }

        const submissions: Array<{
          id: string;
          title: string;
          type: string;
          submitterId: string;
        }> = [];

        const now = new Date();
        const types = submissionTypeValues;

        for (let i = 0; i < input.count; i++) {
          const submissionId = uuidv4();
          const submitter = users[i % users.length];
          if (!submitter) {
            throw new Error("No users available to assign as submitter.");
          }
          const submitterId = submitter.id;

          const randomType = types[Math.floor(Math.random() * types.length)];
          if (!randomType) {
            throw new Error("No submission types configured.");
          }
          const submissionType = input.type ?? randomType;

          const title = `${faker.science.chemicalElement().name} ${faker.company.buzzNoun()}: A ${faker.company.buzzAdjective()} Approach`;

          await db.insert(submission).values({
            id: submissionId,
            eventId: input.eventId,
            title,
            abstract: faker.lorem.paragraphs(3),
            keywords: [
              faker.science.chemicalElement().name,
              faker.company.buzzNoun(),
              faker.hacker.noun(),
            ].join(", "),
            type: submissionType,
            status: input.status || "draft",
            submitterId,
            submittedAt: now,
            updatedAt: now,
          });

          submissions.push({
            id: submissionId,
            title,
            type: submissionType,
            submitterId,
          });
        }

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: true,
                  count: submissions.length,
                  submissions,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error creating submissions: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // List submissions for an event
  server.registerTool(
    "eventifive_list_submissions",
    {
      description: "List submissions for an event",
      inputSchema: z.object({
        eventId: z.string().describe("Event ID"),
        limit: z.number().min(1).max(100).optional().default(20).describe("Number of submissions to return"),
      }),
    },
    async (input) => {
      try {
        const submissions = await db
          .select({
            id: submission.id,
            title: submission.title,
            type: submission.type,
            status: submission.status,
            submitterId: submission.submitterId,
            submittedAt: submission.submittedAt,
          })
          .from(submission)
          .where(eq(submission.eventId, input.eventId))
          .limit(input.limit || 20);

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: true,
                  eventId: input.eventId,
                  count: submissions.length,
                  submissions,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error listing submissions: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
