import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { faker } from "@faker-js/faker";
import { db } from "../db.js";
import { user, account } from "../schema.js";
import { hashPassword } from "../utils/password.js";

export function registerUserTools(server: McpServer) {
  // Create a single user
  server.registerTool(
    "eventifive_create_user",
    {
      description: "Create a test user with email/password authentication",
      inputSchema: z.object({
        name: z.string().optional().describe("User's full name (auto-generated if not provided)"),
        email: z.email().optional().describe("User's email (auto-generated if not provided)"),
        password: z.string().optional().default("password123").describe("Password for the account"),
        institution: z.string().optional().describe("User's institution/organization"),
        researchDomain: z.string().optional().describe("User's research domain/field"),
      }),
    },
    async (input) => {
      try {
        const userId = uuidv4();
        const accountId = uuidv4();
        const now = new Date();

        const userName = input.name || faker.person.fullName();
        const userEmail = input.email || faker.internet.email().toLowerCase();
        const hashedPassword = await hashPassword(input.password || "password123");

        await db.insert(user).values({
          id: userId,
          name: userName,
          email: userEmail,
          emailVerified: true,
          institution: input.institution || faker.company.name(),
          researchDomain: input.researchDomain || faker.science.chemicalElement().name,
          createdAt: now,
          updatedAt: now,
        });

        await db.insert(account).values({
          id: accountId,
          accountId: userId,
          providerId: "credential",
          userId: userId,
          password: hashedPassword,
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
                  user: {
                    id: userId,
                    name: userName,
                    email: userEmail,
                    password: input.password || "password123",
                    institution: input.institution,
                    researchDomain: input.researchDomain,
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
              text: `Error creating user: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Create multiple users at once
  server.registerTool(
    "eventifive_create_users_bulk",
    {
      description: "Create multiple test users at once",
      inputSchema: z.object({
        count: z.number().min(1).max(50).describe("Number of users to create (1-50)"),
        password: z.string().optional().default("password123").describe("Password for all accounts"),
      }),
    },
    async (input) => {
      try {
        const users: Array<{
          id: string;
          name: string;
          email: string;
          password: string;
        }> = [];

        const hashedPassword = await hashPassword(input.password || "password123");
        const now = new Date();

        for (let i = 0; i < input.count; i++) {
          const userId = uuidv4();
          const accountId = uuidv4();
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
            id: accountId,
            accountId: userId,
            providerId: "credential",
            userId: userId,
            password: hashedPassword,
            createdAt: now,
            updatedAt: now,
          });

          users.push({
            id: userId,
            name: userName,
            email: userEmail,
            password: input.password || "password123",
          });
        }

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: true,
                  count: users.length,
                  users,
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
              text: `Error creating users: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // List existing users
  server.registerTool(
    "eventifive_list_users",
    {
      description: "List existing users in the database",
      inputSchema: z.object({
        limit: z.number().min(1).max(100).optional().default(10).describe("Number of users to return"),
      }),
    },
    async (input) => {
      try {
        const users = await db
          .select({
            id: user.id,
            name: user.name,
            email: user.email,
            institution: user.institution,
            createdAt: user.createdAt,
          })
          .from(user)
          .limit(input.limit || 10);

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: true,
                  count: users.length,
                  users,
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
              text: `Error listing users: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
