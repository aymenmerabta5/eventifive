import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerSpeakerTools } from "./speakers.js";
import { registerReviewerTools } from "./reviewers.js";
import { registerCommitteeTools } from "./committee.js";
import { registerUserViewTools } from "./user-view.js";

/**
 * Register all invite-related tools
 *
 * Tools registered:
 * - Speaker tools: invite, respond, list, bulk invite
 * - Reviewer tools: invite, respond, list, bulk invite
 * - Committee tools: add, remove, list
 * - User view tools: list user invitations
 */
export function registerInviteTools(server: McpServer) {
  registerSpeakerTools(server);
  registerReviewerTools(server);
  registerCommitteeTools(server);
  registerUserViewTools(server);
}
