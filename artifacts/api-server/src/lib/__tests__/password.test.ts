import { describe, it, expect } from "vitest";
import { createHash } from "crypto";
import { hashPasswordBcrypt, verifyPassword, isLegacyHash } from "../password.js";

// Helper: create a legacy SHA256 hash the way the old system did
function makeLegacyHash(password: string): string {
  return createHash("sha256").update(password + "scla-salt").digest("hex");
}

describe("password", () => {
  describe("hashPasswordBcrypt", () => {
    it("returns a bcrypt hash starting with $2b$", async () => {
      const hash = await hashPasswordBcrypt("mypassword");
      expect(hash).toMatch(/^\$2b\$/);
    });

    it("produces different hashes for the same input (random salt)", async () => {
      const hash1 = await hashPasswordBcrypt("mypassword");
      const hash2 = await hashPasswordBcrypt("mypassword");
      expect(hash1).not.toBe(hash2);
    });
  });

  describe("verifyPassword", () => {
    it("returns true for matching bcrypt password", async () => {
      const hash = await hashPasswordBcrypt("correct-password");
      const result = await verifyPassword("correct-password", hash);
      expect(result).toBe(true);
    });

    it("returns false for wrong password against bcrypt hash", async () => {
      const hash = await hashPasswordBcrypt("correct-password");
      const result = await verifyPassword("wrong-password", hash);
      expect(result).toBe(false);
    });

    it("returns true for matching legacy SHA256 password", async () => {
      const legacyHash = makeLegacyHash("legacy-password");
      const result = await verifyPassword("legacy-password", legacyHash);
      expect(result).toBe(true);
    });

    it("returns false for wrong password against legacy SHA256 hash", async () => {
      const legacyHash = makeLegacyHash("legacy-password");
      const result = await verifyPassword("wrong-password", legacyHash);
      expect(result).toBe(false);
    });
  });

  describe("isLegacyHash", () => {
    it("returns false for bcrypt hashes", async () => {
      const hash = await hashPasswordBcrypt("test");
      expect(isLegacyHash(hash)).toBe(false);
    });

    it("returns true for SHA256 hex strings", () => {
      const sha256Hash = makeLegacyHash("test");
      expect(isLegacyHash(sha256Hash)).toBe(true);
    });
  });
});
