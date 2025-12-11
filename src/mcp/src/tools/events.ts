import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { faker } from "@faker-js/faker";
import { eq } from "drizzle-orm";
import { db } from "../db.js";
import { event, user, eventTypeValues } from "../schema.js";

export function registerEventTools(server: McpServer) {
  // Create a single event
  server.registerTool(
    "create_event",
    {
      description: "Create a test event",
      inputSchema: z.object({
        title: z.string().optional().describe("Event title (auto-generated if not provided)"),
        type: z
          .enum(eventTypeValues)
          .optional()
          .default("conference")
          .describe("Event type: congress, seminar, workshop, scientific_meeting, conference, symposium"),
        startDate: z.string().optional().describe("Start date (ISO format, defaults to 30 days from now)"),
        endDate: z.string().optional().describe("End date (ISO format, defaults to 3 days after start)"),
        organizerId: z.string().optional().describe("Organizer user ID (uses first user in DB if not provided)"),
        location: z.string().optional().describe("Event location"),
        description: z.string().optional().describe("Event description"),
        theme: z.string().optional().describe("Event theme"),
        contactEmail: z.email().optional().describe("Contact email"),
      }),
    },
    async (input) => {
      try {
        let organizerId = input.organizerId;

        if (!organizerId) {
          const [firstUser] = await db.select({ id: user.id }).from(user).limit(1);
          if (!firstUser) {
            return {
              content: [
                {
                  type: "text" as const,
                  text: "Error: No users found in database. Create a user first using create_user tool.",
                },
              ],
              isError: true,
            };
          }
          organizerId = firstUser.id;
        }

        const eventId = uuidv4();
        const now = new Date();

        const startDate = input.startDate
          ? new Date(input.startDate)
          : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const endDate = input.endDate
          ? new Date(input.endDate)
          : new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000);

        const eventTitle =
          input.title ||
          `${faker.company.buzzAdjective()} ${faker.company.buzzNoun()} ${input.type || "Conference"} ${now.getFullYear()}`;

        await db.insert(event).values({
          id: eventId,
          title: eventTitle,
          description: input.description || faker.lorem.paragraphs(2),
          type: input.type || "conference",
          startDate,
          endDate,
          location: input.location || `${faker.location.city()}, ${faker.location.country()}`,
          theme: input.theme || faker.company.catchPhrase(),
          contactEmail: input.contactEmail || faker.internet.email(),
          organizerId,
          createdAt: now,
          updatedAt: now,
        });

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: true,
                  event: {
                    id: eventId,
                    title: eventTitle,
                    type: input.type || "conference",
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                    location: input.location,
                    organizerId,
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
              text: `Error creating event: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // List existing events
  server.registerTool(
    "list_events",
    {
      description: "List existing events in the database",
      inputSchema: z.object({
        limit: z.number().min(1).max(100).optional().default(10).describe("Number of events to return"),
      }),
    },
    async (input) => {
      try {
        const events = await db
          .select({
            id: event.id,
            title: event.title,
            type: event.type,
            startDate: event.startDate,
            endDate: event.endDate,
            location: event.location,
            organizerId: event.organizerId,
          })
          .from(event)
          .limit(input.limit || 10);

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: true,
                  count: events.length,
                  events,
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
              text: `Error listing events: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Get event details
  server.registerTool(
    "get_event",
    {
      description: "Get details of a specific event",
      inputSchema: z.object({
        eventId: z.string().describe("Event ID"),
      }),
    },
    async (input) => {
      try {
        const [eventData] = await db
          .select()
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

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: true,
                  event: eventData,
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
              text: `Error getting event: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
