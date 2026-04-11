/**
 * Shared integration test helpers.
 *
 * Each test file is responsible for mocking @workspace/db at the module level
 * using vi.mock before importing anything that pulls in the db. Example pattern:
 *
 * ```ts
 * vi.mock("@workspace/db", () => ({
 *   db: {
 *     select: vi.fn(() => ({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit: vi.fn().mockResolvedValue([]) })) })) })),
 *     insert: vi.fn(() => ({ values: vi.fn(() => ({ returning: vi.fn().mockResolvedValue([]) })) })),
 *     update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn().mockResolvedValue([]) })) })),
 *   },
 *   usersTable: { id: "id", email: "email" },
 *   invoicesTable: { id: "id", userId: "userId" },
 *   upgradeRequestsTable: { id: "id", userId: "userId" },
 *   eq: vi.fn((col: unknown, val: unknown) => ({ col, val })),
 *   and: vi.fn((...args: unknown[]) => args),
 *   desc: vi.fn((col: unknown) => col),
 * }));
 * ```
 *
 * IMPORTANT: Use inline vi.fn() inside vi.mock factories (NOT outer variable
 * references) to avoid the vitest hoisting ReferenceError.
 */

import supertest from "supertest";
import app from "../app.js";
import * as jwt from "../lib/jwt.js";
import * as crypto from "crypto";

export { supertest, app };

/** Convenience re-export: create a supertest request agent for the Express app */
export const request = supertest(app);

/**
 * Seed UUIDs matching the deterministic IDs in seed.ts.
 * Use these to mock DB queries returning seeded users/invoices.
 */
export const SEED_IDS = {
  guestUser: "00000000-0000-4000-8000-000000000001",
  residentUser: "00000000-0000-4000-8000-000000000002",
  adminStaff: "00000000-0000-4000-8000-000000000101",
} as const;

/**
 * Generate a signed JWT token for a resident/guest user.
 * Uses the same SESSION_SECRET as the running test environment.
 */
export function createTestToken(userId: string, userType: string): string {
  return jwt.sign({ userId, userType });
}

/**
 * Generate a signed admin JWT token.
 * Admin tokens use the header ctx: "admin" field to distinguish them from resident tokens.
 */
export function createAdminToken(staffId: string, role: string): string {
  const SECRET = process.env.SESSION_SECRET!;
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT", ctx: "admin" })).toString("base64url");
  const payload = {
    staffId,
    role,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", SECRET).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${sig}`;
}

/**
 * Returns an Authorization header object for use with supertest.
 * Example: request.get("/api/auth/me").set(authHeader(token))
 */
export function authHeader(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}
