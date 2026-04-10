import bcrypt from "bcryptjs";

const BCRYPT_ROUNDS = 12;

/**
 * Hash a plain-text password with bcrypt (cost factor 12).
 * Returns a string starting with "$2b$".
 */
export async function hashPasswordBcrypt(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * Verify a plain-text password against a stored hash.
 * Supports both bcrypt hashes ($2b$ prefix) and the legacy SHA256 hex format
 * (64-char lowercase hex produced by sha256(password + "scla-salt")).
 *
 * Returns true if the password matches, false otherwise.
 */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  if (storedHash.startsWith("$2b$")) {
    // Modern bcrypt path
    return bcrypt.compare(password, storedHash);
  } else {
    // Legacy SHA256 path — compare using timing-safe method via crypto
    const { createHash, timingSafeEqual } = await import("crypto");
    const legacy = createHash("sha256").update(password + "scla-salt").digest("hex");
    // timingSafeEqual to prevent timing attacks even on legacy path
    const a = Buffer.from(legacy, "hex");
    const b = Buffer.from(storedHash, "hex");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  }
}

/**
 * Returns true if the stored hash is a legacy SHA256 hash that needs upgrading.
 */
export function isLegacyHash(storedHash: string): boolean {
  return !storedHash.startsWith("$2b$");
}
