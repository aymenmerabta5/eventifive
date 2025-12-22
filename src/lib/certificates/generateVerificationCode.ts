import { customAlphabet } from "nanoid";

// Use uppercase alphanumeric characters for readability (no confusing chars like 0/O, 1/I/L)
const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const nanoid = customAlphabet(alphabet, 8);

/**
 * Generate a unique verification code for a certificate
 * Format: EVT-{YEAR}-{NANOID(8)}
 * Example: EVT-2024-X7K9M2AB
 */
export function generateVerificationCode(): string {
  const year = new Date().getFullYear();
  const code = nanoid();
  return `EVT-${year}-${code}`;
}
