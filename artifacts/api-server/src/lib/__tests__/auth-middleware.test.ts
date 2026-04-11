import { describe, it, expect, vi, beforeEach } from "vitest";
import * as crypto from "crypto";
import type { Request, Response, NextFunction } from "express";

// Mock @workspace/db before importing auth-middleware
// NOTE: vi.mock is hoisted; factory cannot reference outer variables
vi.mock("@workspace/db", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn().mockResolvedValue([]),
        })),
      })),
    })),
  },
  usersTable: {
    id: "id",
    email: "email",
  },
  eq: vi.fn((col: unknown, val: unknown) => ({ col, val })),
}));

import { requireAuth, requireAdmin } from "../auth-middleware.js";
import { db } from "@workspace/db";

const TEST_SECRET = "test-secret-at-least-32-characters-long-for-hmac";

// ─── Helper: build a mock Express Request ────────────────────────────────────
function mockReq(headers: Record<string, string> = {}): Partial<Request> {
  return { headers } as Partial<Request>;
}

// ─── Helper: build a mock Express Response ────────────────────────────────────
function mockRes(): Partial<Response> & { statusCode: number; body: unknown } {
  const res: { statusCode: number; body: unknown; status: (code: number) => typeof res; json: (data: unknown) => typeof res } = {
    statusCode: 0,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(data) { this.body = data; return this; },
  };
  return res as Partial<Response> & { statusCode: number; body: unknown };
}

// ─── Helper: build a valid resident JWT ─────────────────────────────────────
function makeResidentToken(
  payload: { userId: string; userType: string; exp?: number },
  secret: string = TEST_SECRET
): string {
  const fullPayload = {
    userId: payload.userId,
    userType: payload.userType,
    exp: payload.exp ?? Math.floor(Date.now() / 1000) + 3600,
  };
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");
  const sig = crypto.createHmac("sha256", secret).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${sig}`;
}

// ─── Helper: build a valid admin token ──────────────────────────────────────
function makeAdminToken(
  payload: object,
  secret: string = TEST_SECRET,
  ctx: string = "admin"
): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT", ctx })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", secret).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${sig}`;
}

// ─── Helper: configure the db mock chain to return a specific value ──────────
function setDbResult(result: unknown[]) {
  const mockLimit = vi.fn().mockResolvedValue(result);
  const mockWhere = vi.fn(() => ({ limit: mockLimit }));
  const mockFrom = vi.fn(() => ({ where: mockWhere }));
  vi.mocked(db.select).mockReturnValue({ from: mockFrom } as ReturnType<typeof db.select>);
}

describe("auth-middleware", () => {
  beforeEach(() => {
    // Reset db mock to return empty result by default
    setDbResult([]);
  });

  describe("requireAuth", () => {
    it("returns 401 when no Authorization header is present", async () => {
      const req = mockReq();
      const res = mockRes();
      const next = vi.fn();

      await requireAuth(req as Request, res as Response, next as NextFunction);

      expect((res as { statusCode: number }).statusCode).toBe(401);
      expect(next).not.toHaveBeenCalled();
    });

    it("returns 401 when Authorization header does not start with Bearer", async () => {
      const req = mockReq({ authorization: "Basic sometoken" });
      const res = mockRes();
      const next = vi.fn();

      await requireAuth(req as Request, res as Response, next as NextFunction);

      expect((res as { statusCode: number }).statusCode).toBe(401);
      expect(next).not.toHaveBeenCalled();
    });

    it("returns 401 when token is invalid", async () => {
      const req = mockReq({ authorization: "Bearer invalid-token" });
      const res = mockRes();
      const next = vi.fn();

      await requireAuth(req as Request, res as Response, next as NextFunction);

      expect((res as { statusCode: number }).statusCode).toBe(401);
      expect(next).not.toHaveBeenCalled();
    });

    it("returns 401 when token is expired", async () => {
      const expiredToken = makeResidentToken({
        userId: "user-1",
        userType: "resident",
        exp: Math.floor(Date.now() / 1000) - 3600, // expired 1 hour ago
      });
      const req = mockReq({ authorization: `Bearer ${expiredToken}` });
      const res = mockRes();
      const next = vi.fn();

      await requireAuth(req as Request, res as Response, next as NextFunction);

      expect((res as { statusCode: number }).statusCode).toBe(401);
      expect(next).not.toHaveBeenCalled();
    });

    it("returns 401 when user is not found in DB", async () => {
      setDbResult([]); // user not found
      const token = makeResidentToken({ userId: "user-1", userType: "resident" });
      const req = mockReq({ authorization: `Bearer ${token}` });
      const res = mockRes();
      const next = vi.fn();

      await requireAuth(req as Request, res as Response, next as NextFunction);

      expect((res as { statusCode: number }).statusCode).toBe(401);
      expect(next).not.toHaveBeenCalled();
    });

    it("calls next() and attaches user to req when token is valid and user exists", async () => {
      const testUser = { id: "user-1", email: "test@example.com", userType: "resident" };
      setDbResult([testUser]);

      const token = makeResidentToken({ userId: "user-1", userType: "resident" });
      const req = mockReq({ authorization: `Bearer ${token}` });
      const res = mockRes();
      const next = vi.fn();

      await requireAuth(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalled();
      expect((req as Request & { user: typeof testUser }).user).toEqual(testUser);
    });
  });

  describe("requireAdmin", () => {
    it("returns null and sends 401 when no Authorization header", () => {
      const req = mockReq();
      const res = mockRes();

      const result = requireAdmin(req as Request, res as Response);

      expect(result).toBeNull();
      expect((res as { statusCode: number }).statusCode).toBe(401);
    });

    it("returns null when admin token has invalid signature", () => {
      const payload = {
        staffId: "staff-1",
        role: "admin",
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      // Use wrong secret to create invalid signature
      const badToken = makeAdminToken(payload, "wrong-secret-that-is-at-least-32-chars-ok");
      const req = mockReq({ authorization: `Bearer ${badToken}` });
      const res = mockRes();

      const result = requireAdmin(req as Request, res as Response);

      expect(result).toBeNull();
      expect((res as { statusCode: number }).statusCode).toBe(401);
    });

    it("returns null when token is missing admin ctx header", () => {
      const payload = {
        staffId: "staff-1",
        role: "admin",
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      const badToken = makeAdminToken(payload, TEST_SECRET, "user"); // wrong ctx
      const req = mockReq({ authorization: `Bearer ${badToken}` });
      const res = mockRes();

      const result = requireAdmin(req as Request, res as Response);

      // ctx is "user" not "admin", so verifyAdmin returns null -> status 401
      expect(result).toBeNull();
    });

    it("returns payload when admin token is valid", () => {
      const payload = {
        staffId: "staff-1",
        role: "admin",
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      const token = makeAdminToken(payload);
      const req = mockReq({ authorization: `Bearer ${token}` });
      const res = mockRes();

      const result = requireAdmin(req as Request, res as Response);

      expect(result).not.toBeNull();
      expect(result?.staffId).toBe("staff-1");
      expect(result?.role).toBe("admin");
    });
  });
});
