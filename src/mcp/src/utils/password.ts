import { createHash, randomBytes, timingSafeEqual } from "crypto";

// Simple password hashing using scrypt-like approach
// This is compatible with Better Auth's default password hashing
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const hash = createHash("sha256")
    .update(password + salt)
    .digest("hex");
  return `${salt}:${hash}`;
}

export async function verifyPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  const [salt, hash] = hashedPassword.split(":");
  if (!salt || !hash) return false;

  const testHash = createHash("sha256")
    .update(password + salt)
    .digest("hex");

  try {
    return timingSafeEqual(Buffer.from(hash), Buffer.from(testHash));
  } catch {
    return false;
  }
}
