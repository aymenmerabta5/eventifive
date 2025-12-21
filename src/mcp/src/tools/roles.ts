import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { db } from "../db.js";
import { user, roles, userRoles, roleValues } from "../schema.js";
import { eq, and } from "drizzle-orm";

export function registerRoleTools(server: McpServer) {
  // Set user role
  server.registerTool(
    "eventifive_set_user_role",
    {
      description:
        "Set a role for a user. Available roles: super_admin, organizer, user",
      inputSchema: z.object({
        userId: z.string().optional().describe("User ID to set role for"),
        email: z
          .string()
          .email()
          .optional()
          .describe("User email to set role for (alternative to userId)"),
        role: z
          .enum(["super_admin", "organizer", "user"])
          .describe("Role to assign to the user"),
      }),
    },
    async (input) => {
      try {
        // Validate that either userId or email is provided
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
        let targetUser;
        if (input.userId) {
          const [foundUser] = await db
            .select({ id: user.id, name: user.name, email: user.email })
            .from(user)
            .where(eq(user.id, input.userId))
            .limit(1);
          targetUser = foundUser;
        } else if (input.email) {
          const [foundUser] = await db
            .select({ id: user.id, name: user.name, email: user.email })
            .from(user)
            .where(eq(user.email, input.email))
            .limit(1);
          targetUser = foundUser;
        }

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

        // Find the role
        const [targetRole] = await db
          .select({ id: roles.id, name: roles.name })
          .from(roles)
          .where(eq(roles.name, input.role))
          .limit(1);

        if (!targetRole) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Error: Role "${input.role}" not found in database. Make sure roles are seeded.`,
              },
            ],
            isError: true,
          };
        }

        // Check if user already has this role
        const [existingUserRole] = await db
          .select()
          .from(userRoles)
          .where(
            and(
              eq(userRoles.userId, targetUser.id),
              eq(userRoles.roleId, targetRole.id),
            ),
          )
          .limit(1);

        if (existingUserRole) {
          return {
            content: [
              {
                type: "text" as const,
                text: JSON.stringify(
                  {
                    success: true,
                    message: `User already has the "${input.role}" role`,
                    user: {
                      id: targetUser.id,
                      name: targetUser.name,
                      email: targetUser.email,
                    },
                    role: input.role,
                  },
                  null,
                  2,
                ),
              },
            ],
          };
        }

        // Add the role to the user
        await db.insert(userRoles).values({
          userId: targetUser.id,
          roleId: targetRole.id,
          assignedAt: new Date(),
        });

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: true,
                  message: `Role "${input.role}" assigned to user`,
                  user: {
                    id: targetUser.id,
                    name: targetUser.name,
                    email: targetUser.email,
                  },
                  role: input.role,
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
              text: `Error setting user role: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // Remove user role
  server.registerTool(
    "eventifive_remove_user_role",
    {
      description: "Remove a role from a user",
      inputSchema: z.object({
        userId: z.string().optional().describe("User ID to remove role from"),
        email: z
          .string()
          .email()
          .optional()
          .describe("User email to remove role from (alternative to userId)"),
        role: z
          .enum(["super_admin", "organizer", "user"])
          .describe("Role to remove from the user"),
      }),
    },
    async (input) => {
      try {
        // Validate that either userId or email is provided
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
        let targetUser;
        if (input.userId) {
          const [foundUser] = await db
            .select({ id: user.id, name: user.name, email: user.email })
            .from(user)
            .where(eq(user.id, input.userId))
            .limit(1);
          targetUser = foundUser;
        } else if (input.email) {
          const [foundUser] = await db
            .select({ id: user.id, name: user.name, email: user.email })
            .from(user)
            .where(eq(user.email, input.email))
            .limit(1);
          targetUser = foundUser;
        }

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

        // Find the role
        const [targetRole] = await db
          .select({ id: roles.id, name: roles.name })
          .from(roles)
          .where(eq(roles.name, input.role))
          .limit(1);

        if (!targetRole) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Error: Role "${input.role}" not found in database`,
              },
            ],
            isError: true,
          };
        }

        // Delete the user role
        const result = await db
          .delete(userRoles)
          .where(
            and(
              eq(userRoles.userId, targetUser.id),
              eq(userRoles.roleId, targetRole.id),
            ),
          );

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: true,
                  message: `Role "${input.role}" removed from user`,
                  user: {
                    id: targetUser.id,
                    name: targetUser.name,
                    email: targetUser.email,
                  },
                  role: input.role,
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
              text: `Error removing user role: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // Get user roles
  server.registerTool(
    "eventifive_get_user_roles",
    {
      description: "Get all roles assigned to a user",
      inputSchema: z.object({
        userId: z.string().optional().describe("User ID to get roles for"),
        email: z
          .string()
          .email()
          .optional()
          .describe("User email to get roles for (alternative to userId)"),
      }),
    },
    async (input) => {
      try {
        // Validate that either userId or email is provided
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
        let targetUser;
        if (input.userId) {
          const [foundUser] = await db
            .select({ id: user.id, name: user.name, email: user.email })
            .from(user)
            .where(eq(user.id, input.userId))
            .limit(1);
          targetUser = foundUser;
        } else if (input.email) {
          const [foundUser] = await db
            .select({ id: user.id, name: user.name, email: user.email })
            .from(user)
            .where(eq(user.email, input.email))
            .limit(1);
          targetUser = foundUser;
        }

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

        // Get user's roles
        const userRolesList = await db
          .select({
            roleId: roles.id,
            roleName: roles.name,
            assignedAt: userRoles.assignedAt,
          })
          .from(userRoles)
          .innerJoin(roles, eq(userRoles.roleId, roles.id))
          .where(eq(userRoles.userId, targetUser.id));

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
                  roles: userRolesList.map((r) => ({
                    name: r.roleName,
                    assignedAt: r.assignedAt,
                  })),
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
              text: `Error getting user roles: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // List all available roles
  server.registerTool(
    "eventifive_list_roles",
    {
      description: "List all available roles in the system",
      inputSchema: z.object({}),
    },
    async () => {
      try {
        const allRoles = await db
          .select({
            id: roles.id,
            name: roles.name,
          })
          .from(roles);

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: true,
                  roles: allRoles,
                  availableRoleNames: roleValues,
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
              text: `Error listing roles: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );

  // List users by role
  server.registerTool(
    "eventifive_list_users_by_role",
    {
      description: "List all users with a specific role",
      inputSchema: z.object({
        role: z
          .enum(["super_admin", "organizer", "user"])
          .describe("Role to filter users by"),
        limit: z
          .number()
          .min(1)
          .max(100)
          .optional()
          .default(20)
          .describe("Maximum number of users to return"),
      }),
    },
    async (input) => {
      try {
        // Find the role
        const [targetRole] = await db
          .select({ id: roles.id, name: roles.name })
          .from(roles)
          .where(eq(roles.name, input.role))
          .limit(1);

        if (!targetRole) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Error: Role "${input.role}" not found in database`,
              },
            ],
            isError: true,
          };
        }

        // Get users with this role
        const usersWithRole = await db
          .select({
            userId: user.id,
            userName: user.name,
            userEmail: user.email,
            assignedAt: userRoles.assignedAt,
          })
          .from(userRoles)
          .innerJoin(user, eq(userRoles.userId, user.id))
          .where(eq(userRoles.roleId, targetRole.id))
          .limit(input.limit || 20);

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: true,
                  role: input.role,
                  count: usersWithRole.length,
                  users: usersWithRole.map((u) => ({
                    id: u.userId,
                    name: u.userName,
                    email: u.userEmail,
                    assignedAt: u.assignedAt,
                  })),
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
              text: `Error listing users by role: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    },
  );
}
