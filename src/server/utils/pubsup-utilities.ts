import { createHmac } from "crypto";
import { env } from "@/env";

/**
 * Hash a channel identifier using HMAC-SHA256 for defense-in-depth.
 * This prevents attackers with Redis access from targeting specific users
 * by making channel names unpredictable without the application secret.
 *
 * @param type - The channel type prefix (e.g., "user", "conv", "typing")
 * @param id - The identifier to hash (userId, conversationId, etc.)
 * @returns A 16-character hex hash
 */
function hashChannel(type: string, id: string): string {
  // Use BETTER_AUTH_SECRET for HMAC, fallback to a dev secret in development
  const secret = env.BETTER_AUTH_SECRET ?? "dev-secret-do-not-use-in-production";
  const hmac = createHmac("sha256", secret);
  hmac.update(`${type}:${id}`);
  return hmac.digest("hex").substring(0, 16);
}

export function getUserChannel(userId: string): string {
  return `user:${hashChannel("user", userId)}:messages`;
}

export function getConversationChannel(conversationId: string): string {
  return `conversation:${hashChannel("conv", conversationId)}`;
}

export function getPresenceChannel(): string {
  // Presence channel is global, no user-specific data to protect
  return "presence:updates";
}

export function getTypingChannel(conversationId: string): string {
  return `typing:${hashChannel("typing", conversationId)}`;
}

export function getReadReceiptsChannel(conversationId: string): string {
  return `read:${hashChannel("read", conversationId)}`;
}
