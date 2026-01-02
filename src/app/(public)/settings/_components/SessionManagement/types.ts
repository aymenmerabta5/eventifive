import type { DeviceType } from "@/lib/session-parser";
import type { authClient } from "@/lib/auth-client";

// Better Auth session type from listSessions
export type BetterAuthSession = NonNullable<
  Awaited<ReturnType<typeof authClient.listSessions>>["data"]
>[number];

// Parsed session data with device info
export interface ParsedSession extends BetterAuthSession {
  deviceLabel: string;
  browser: string;
  os: string;
  deviceType: DeviceType;
  isCurrent: boolean;
}

// Dialog variant type
export type DialogVariant = "single" | "all";
