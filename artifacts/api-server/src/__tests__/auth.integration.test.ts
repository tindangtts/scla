import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock @workspace/db before any imports that pull it in.
// vi.mock is hoisted to the top at runtime — use inline vi.fn() to avoid ReferenceError.
vi.mock("@workspace/db", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn().mockResolvedValue([]),
        })),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn().mockResolvedValue([]),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn().mockResolvedValue([]),
      })),
    })),
  },
  usersTable: { id: "id", email: "email" },
  upgradeRequestsTable: { id: "id", userId: "userId" },
  eq: vi.fn((col: unknown, val: unknown) => ({ col, val })),
}));

// Mock rate limiter to bypass rate limiting in tests
vi.mock("../lib/rate-limiter.js", () => ({
  authRateLimiter: (_req: any, _res: any, next: any) => next(),
}));

// Mock password functions — avoid real bcrypt (slow in tests)
vi.mock("../lib/password.js", () => ({
  hashPasswordBcrypt: vi.fn().mockResolvedValue("hashed-password"),
  verifyPassword: vi.fn().mockResolvedValue(true),
  isLegacyHash: vi.fn().mockReturnValue(false),
}));

import supertest from "supertest";
import app from "../app.js";
import { db } from "@workspace/db";
import { createTestToken, authHeader, SEED_IDS } from "./helpers.js";

const request = supertest(app);

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_GUEST_USER = {
  id: SEED_IDS.guestUser,
  name: "Demo User",
  email: "demo@starcity.com",
  phone: "+9509123456",
  passwordHash: "hashed-password",
  userType: "guest",
  unitNumber: null,
  residentId: null,
  estateId: null,
  developmentName: null,
  upgradeStatus: "none",
  createdAt: new Date("2026-01-01T00:00:00Z"),
};

const MOCK_RESIDENT_USER = {
  id: SEED_IDS.residentUser,
  name: "Resident User",
  email: "resident@starcity.com",
  phone: "+9509111222",
  passwordHash: "hashed-password",
  userType: "resident",
  unitNumber: "A-12-03",
  residentId: "SC-001",
  estateId: "estate-1",
  developmentName: "City Loft",
  upgradeStatus: "approved",
  createdAt: new Date("2026-01-01T00:00:00Z"),
};

// ─── Helper: configure select mock to return a value ─────────────────────────

function setSelectResult(result: unknown[]) {
  const mockLimit = vi.fn().mockResolvedValue(result);
  const mockWhere = vi.fn(() => ({ limit: mockLimit }));
  const mockFrom = vi.fn(() => ({ where: mockWhere }));
  vi.mocked(db.select).mockReturnValue({ from: mockFrom } as unknown as ReturnType<typeof db.select>);
}

function setInsertResult(result: unknown[]) {
  const mockReturning = vi.fn().mockResolvedValue(result);
  const mockValues = vi.fn(() => ({ returning: mockReturning }));
  vi.mocked(db.insert).mockReturnValue({ values: mockValues } as unknown as ReturnType<typeof db.insert>);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    // Default: no existing user (email not taken)
    setSelectResult([]);
    setInsertResult([MOCK_GUEST_USER]);
  });

  it("returns 400 when all fields are missing", async () => {
    const res = await request.post("/api/auth/register").send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("validation_error");
  });

  it("returns 400 when name is missing", async () => {
    const res = await request.post("/api/auth/register").send({
      email: "new@example.com",
      phone: "+959123456",
      password: "password123",
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("validation_error");
  });

  it("returns 400 when password is too short (< 8 chars)", async () => {
    const res = await request.post("/api/auth/register").send({
      name: "New User",
      email: "new@example.com",
      phone: "+959123456",
      password: "short",
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("validation_error");
    expect(res.body.message).toMatch(/8 characters/);
  });

  it("returns 400 when email already exists", async () => {
    setSelectResult([MOCK_GUEST_USER]); // email taken
    const res = await request.post("/api/auth/register").send({
      name: "New User",
      email: "demo@starcity.com",
      phone: "+959123456",
      password: "password123",
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("email_taken");
  });

  it("returns 201 with token and user on valid registration", async () => {
    const res = await request.post("/api/auth/register").send({
      name: "New User",
      email: "newuser@starcity.com",
      phone: "+959123456",
      password: "password123",
    });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user).toBeDefined();
  });

  it("response user has expected shape", async () => {
    const res = await request.post("/api/auth/register").send({
      name: "New User",
      email: "newuser@starcity.com",
      phone: "+959123456",
      password: "password123",
    });
    expect(res.status).toBe(201);
    const { user } = res.body;
    expect(user).toMatchObject({
      id: expect.any(String),
      name: expect.any(String),
      email: expect.any(String),
      phone: expect.any(String),
      userType: expect.any(String),
      upgradeStatus: expect.any(String),
      createdAt: expect.any(String),
    });
    // These keys should be present (possibly null)
    expect(user).toHaveProperty("unitNumber");
    expect(user).toHaveProperty("residentId");
    expect(user).toHaveProperty("estateId");
    expect(user).toHaveProperty("developmentName");
  });
});

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    setSelectResult([MOCK_GUEST_USER]);
  });

  it("returns 400 when email and password are missing", async () => {
    const res = await request.post("/api/auth/login").send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("validation_error");
  });

  it("returns 400 when only email is provided", async () => {
    const res = await request.post("/api/auth/login").send({ email: "demo@starcity.com" });
    expect(res.status).toBe(400);
  });

  it("returns 401 when user is not found", async () => {
    setSelectResult([]); // no user
    const res = await request.post("/api/auth/login").send({
      email: "nobody@starcity.com",
      password: "password123",
    });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("invalid_credentials");
  });

  it("returns 401 when password is incorrect", async () => {
    const { verifyPassword } = await import("../lib/password.js");
    vi.mocked(verifyPassword).mockResolvedValueOnce(false);
    const res = await request.post("/api/auth/login").send({
      email: "demo@starcity.com",
      password: "wrongpassword",
    });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("invalid_credentials");
  });

  it("returns 200 with token and user on valid login", async () => {
    const res = await request.post("/api/auth/login").send({
      email: "demo@starcity.com",
      password: "password123",
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe("demo@starcity.com");
  });
});

describe("GET /api/auth/me", () => {
  beforeEach(() => {
    setSelectResult([MOCK_RESIDENT_USER]);
  });

  it("returns 401 when no Authorization header is provided", async () => {
    const res = await request.get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("returns 401 when Authorization header is malformed", async () => {
    const res = await request.get("/api/auth/me").set("Authorization", "Basic bad-token");
    expect(res.status).toBe(401);
  });

  it("returns 200 with user object when valid token is provided", async () => {
    const token = createTestToken(SEED_IDS.residentUser, "resident");
    const res = await request.get("/api/auth/me").set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(SEED_IDS.residentUser);
    expect(res.body.email).toBe("resident@starcity.com");
    expect(res.body).not.toHaveProperty("passwordHash");
  });
});

describe("POST /api/auth/upgrade", () => {
  beforeEach(() => {
    // Auth lookup returns resident user
    setSelectResult([MOCK_GUEST_USER]);
    // Mock update and insert
    const mockWhere = vi.fn().mockResolvedValue([]);
    const mockSet = vi.fn(() => ({ where: mockWhere }));
    vi.mocked(db.update).mockReturnValue({ set: mockSet } as unknown as ReturnType<typeof db.update>);
    setInsertResult([{
      id: "req-1",
      userId: SEED_IDS.guestUser,
      userName: "Demo User",
      userEmail: "demo@starcity.com",
      unitNumber: "A-12-03",
      residentId: "SC-001",
      developmentName: "City Loft",
      status: "pending",
      submittedAt: new Date("2026-04-11T00:00:00Z"),
      reviewedAt: null,
      reviewNote: null,
    }]);
  });

  it("returns 401 when no auth token is provided", async () => {
    const res = await request.post("/api/auth/upgrade").send({
      unitNumber: "A-12-03",
      residentId: "SC-001",
      developmentName: "City Loft",
    });
    expect(res.status).toBe(401);
  });

  it("returns 400 when required fields are missing", async () => {
    const token = createTestToken(SEED_IDS.guestUser, "guest");
    const res = await request
      .post("/api/auth/upgrade")
      .set(authHeader(token))
      .send({ unitNumber: "A-12-03" }); // missing residentId and developmentName
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("validation_error");
  });

  it("returns 200 with upgrade request on valid submission", async () => {
    const token = createTestToken(SEED_IDS.guestUser, "guest");
    const res = await request
      .post("/api/auth/upgrade")
      .set(authHeader(token))
      .send({
        unitNumber: "A-12-03",
        residentId: "SC-001",
        developmentName: "City Loft",
      });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: expect.any(String),
      unitNumber: "A-12-03",
      residentId: "SC-001",
      developmentName: "City Loft",
      status: "pending",
      submittedAt: expect.any(String),
    });
  });
});
