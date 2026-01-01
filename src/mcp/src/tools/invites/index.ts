import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerSpeakerTools } from "./speakers.js";
import { registerReviewerTools } from "./reviewers.js";
import { registerCommunicatorTools } from "./communicator.js";
import { registerUserViewTools } from "./user-view.js";

/**
 * Register all invite-related tools
 *
 * Tools registered:
 * - Speaker tools: invite, respond, list, bulk invite
 * - Reviewer tools: invite, respond, list, bulk invite
 * - Communicator tools: add, remove, list
 * - User view tools: list user invitations
 */
export function registerInviteTools(server: McpServer) {
  registerSpeakerTools(server);
  registerReviewerTools(server);
  registerCommunicatorTools(server);
  registerUserViewTools(server);
}
