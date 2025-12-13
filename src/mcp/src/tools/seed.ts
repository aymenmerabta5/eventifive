import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { faker } from "@faker-js/faker";
import { db } from "../db.js";
import {
  user,
  account,
  event,
  submission,
  review,
  reviewAssignment,
  eventRegistration,
  eventTypeValues,
  submissionTypeValues,
  submissionStatusValues,
} from "../schema.js";
import { hashPassword } from "../utils/password.js";

export function registerSeedTools(server: McpServer) {
  // Seed a complete event scenario
  server.registerTool(
    "eventifive_seed_complete_event",
    {
      description: "Create a complete test scenario with users, an event, submissions, and reviews",
      inputSchema: z.object({
        eventTitle: z.string().optional().describe("Event title (auto-generated if not provided)"),
        eventType: z.enum(eventTypeValues).optional().default("conference").describe("Event type"),
        userCount: z.number().min(2).max(50).optional().default(10).describe("Number of users to create (2-50)"),
        submissionsPerUser: z.number().min(0).max(5).optional().default(2).describe("Submissions per user (0-5)"),
        reviewsPerSubmission: z.number().min(0).max(3).optional().default(2).describe("Reviews per submission (0-3)"),
        password: z.string().optional().default("password123").describe("Password for all users"),
      }),
    },
    async (input) => {
      try {
        const now = new Date();
        const hashedPassword = await hashPassword(input.password || "password123");

        // 1. Create users
        const createdUsers: Array<{ id: string; name: string; email: string }> = [];

        for (let i = 0; i < (input.userCount || 10); i++) {
          const userId = uuidv4();
          const userName = faker.person.fullName();
          const userEmail = faker.internet.email().toLowerCase();

          await db.insert(user).values({
            id: userId,
            name: userName,
            email: userEmail,
            emailVerified: true,
            institution: faker.company.name(),
            researchDomain: faker.science.chemicalElement().name,
            createdAt: now,
            updatedAt: now,
          });

          await db.insert(account).values({
            id: uuidv4(),
            accountId: userId,
            providerId: "credential",
            userId,
            password: hashedPassword,
            createdAt: now,
            updatedAt: now,
          });

          createdUsers.push({ id: userId, name: userName, email: userEmail });
        }

        // 2. Create event (first user is organizer)
        const organizer = createdUsers[0];
        if (!organizer) {
          throw new Error("No users were created. Cannot create an event.");
        }
        const organizerId = organizer.id;
        const eventId = uuidv4();
        const startDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const endDate = new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000);

        const eventTitle =
          input.eventTitle ||
          `${faker.company.buzzAdjective()} ${faker.company.buzzNoun()} ${input.eventType || "Conference"} ${now.getFullYear()}`;

        await db.insert(event).values({
          id: eventId,
          title: eventTitle,
          smallDescription: faker.lorem.sentence(),
          type: input.eventType || "conference",
          startDate,
          endDate,
          location: `${faker.location.city()}, ${faker.location.country()}`,
          theme: faker.company.catchPhrase(),
          organizerId,
          priceAmount: 0,
          priceCurrency: "DZD",
          createdAt: now,
          updatedAt: now,
        });

        // 3. Register all users for the event
        for (const u of createdUsers) {
          await db.insert(eventRegistration).values({
            eventId,
            userId: u.id,
            roleAtEvent: u.id === organizerId ? "organizer" : "participant",
            registeredAt: now,
          });
        }

        // 4. Create submissions
        const createdSubmissions: Array<{
          id: string;
          title: string;
          submitterId: string;
        }> = [];

        const submissionsPerUser = input.submissionsPerUser ?? 2;
        const types = submissionTypeValues;

        for (const u of createdUsers) {
          for (let i = 0; i < submissionsPerUser; i++) {
            const submissionId = uuidv4();
            const submissionType = types[Math.floor(Math.random() * types.length)];
            const title = `${faker.science.chemicalElement().name} ${faker.company.buzzNoun()}: A ${faker.company.buzzAdjective()} Approach`;

            await db.insert(submission).values({
              id: submissionId,
              eventId,
              title,
              abstract: faker.lorem.paragraphs(3),
              keywords: [
                faker.science.chemicalElement().name,
                faker.company.buzzNoun(),
                faker.hacker.noun(),
              ].join(", "),
              type: submissionType,
              status: "draft",
              submitterId: u.id,
              submittedAt: now,
              updatedAt: now,
            });

            createdSubmissions.push({
              id: submissionId,
              title,
              submitterId: u.id,
            });
          }
        }

        // 5. Create reviews
        const reviewsPerSubmission = input.reviewsPerSubmission ?? 2;
        let totalReviews = 0;

        for (const sub of createdSubmissions) {
          const availableReviewers = createdUsers.filter((u) => u.id !== sub.submitterId);
          const reviewerCount = Math.min(reviewsPerSubmission, availableReviewers.length);

          for (let i = 0; i < reviewerCount; i++) {
            const reviewer = availableReviewers[i];
            if (!reviewer) {
              throw new Error("No reviewers available for this submission.");
            }
            const reviewerId = reviewer.id;
            const score = Math.floor(Math.random() * 5) + 5;
            const recommendation = score >= 6 ? "accept" : "reject";

            await db.insert(review).values({
              id: uuidv4(),
              submissionId: sub.id,
              reviewerId,
              score,
              recommendation,
              comment: generateReviewComments(recommendation),
              createdAt: now,
              updatedAt: now,
            });

            await db.insert(reviewAssignment).values({
              submissionId: sub.id,
              reviewerId,
              assignedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
              dueAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
              status: "completed",
            });

            totalReviews++;
          }
        }

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: true,
                  summary: {
                    usersCreated: createdUsers.length,
                    eventCreated: eventTitle,
                    eventId,
                    submissionsCreated: createdSubmissions.length,
                    reviewsCreated: totalReviews,
                  },
                  event: {
                    id: eventId,
                    title: eventTitle,
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                  },
                  users: createdUsers.map((u) => ({
                    ...u,
                    password: input.password || "password123",
                  })),
                  sampleSubmissions: createdSubmissions.slice(0, 5),
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
              text: `Error seeding data: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Quick seed for testing
  server.registerTool(
    "eventifive_quick_seed",
    {
      description: "Create minimal test data: 1 user, 1 event, 1 submission",
      inputSchema: z.object({
        email: z.email().optional().describe("Email for the test user"),
        password: z.string().optional().default("password123").describe("Password"),
      }),
    },
    async (input) => {
      try {
        const now = new Date();
        const hashedPassword = await hashPassword(input.password || "password123");

        // Create user
        const userId = uuidv4();
        const userName = faker.person.fullName();
        const userEmail = input.email || faker.internet.email().toLowerCase();

        await db.insert(user).values({
          id: userId,
          name: userName,
          email: userEmail,
          emailVerified: true,
          institution: faker.company.name(),
          researchDomain: faker.science.chemicalElement().name,
          createdAt: now,
          updatedAt: now,
        });

        await db.insert(account).values({
          id: uuidv4(),
          accountId: userId,
          providerId: "credential",
          userId,
          password: hashedPassword,
          createdAt: now,
          updatedAt: now,
        });

        // Create event
        const eventId = uuidv4();
        const startDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const endDate = new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000);
        const eventTitle = `Test Conference ${now.getFullYear()}`;

        await db.insert(event).values({
          id: eventId,
          title: eventTitle,
          smallDescription: "A test conference for development",
          type: "conference",
          startDate,
          endDate,
          location: "Test City, Test Country",
          theme: "Testing and Development",
          organizerId: userId,
          priceAmount: 0,
          priceCurrency: "DZD",
          createdAt: now,
          updatedAt: now,
        });

        // Create submission
        const submissionId = uuidv4();
        const submissionTitle = "Test Submission: An Example Paper";

        await db.insert(submission).values({
          id: submissionId,
          eventId,
          title: submissionTitle,
          abstract: "This is a test submission for development purposes.",
          keywords: "test, development, example",
          type: "oral",
          status: "draft",
          submitterId: userId,
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
                  user: {
                    id: userId,
                    name: userName,
                    email: userEmail,
                    password: input.password || "password123",
                  },
                  event: {
                    id: eventId,
                    title: eventTitle,
                  },
                  submission: {
                    id: submissionId,
                    title: submissionTitle,
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
              text: `Error creating quick seed: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}

function generateReviewComments(recommendation: string): string {
  const positiveComments = [
    "The paper presents a well-structured approach with clear methodology.",
    "The research contributes significantly to the field.",
    "The experimental results are convincing and well-documented.",
  ];

  const negativeComments = [
    "The methodology could be explained in more detail.",
    "Some claims require additional supporting evidence.",
    "The related work section could be expanded.",
  ];

  switch (recommendation) {
    case "accept":
      return `${faker.helpers.arrayElement(positiveComments)} I recommend acceptance.`;
    case "reject":
      return `${faker.helpers.arrayElement(negativeComments)} The paper is not suitable in its current form.`;
    default:
      return faker.lorem.paragraph();
  }
}
