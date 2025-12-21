/**
 * Test utilities - colors and shared types
 */

export const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  dim: "\x1b[2m",
} as const;

export type WebhookEventType =
  | "checkout.paid"
  | "checkout.failed"
  | "checkout.expired";

export interface ChargilyWebhookData {
  id: string;
  entity: string;
  status: string;
  amount: number;
  currency: string;
  payment_method: string | null;
  metadata: Record<string, string> | null;
}

export interface ChargilyWebhookEvent {
  type: WebhookEventType;
  data: ChargilyWebhookData;
}

export function log(message: string) {
  console.log(message);
}

export function logSuccess(message: string) {
  console.log(`${colors.green}✓${colors.reset} ${message}`);
}

export function logError(message: string) {
  console.error(`${colors.red}✗${colors.reset} ${message}`);
}

export function logWarning(message: string) {
  console.log(`${colors.yellow}!${colors.reset} ${message}`);
}

export function logInfo(message: string) {
  console.log(`${colors.blue}ℹ${colors.reset} ${message}`);
}
