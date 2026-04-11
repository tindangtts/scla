import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock @workspace/db before any imports that pull it in.
// vi.mock is hoisted to the top at runtime — use inline vi.fn() to avoid ReferenceError.
vi.mock("@workspace/db", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn().mockResolvedValue([]),
          orderBy: vi.fn().mockResolvedValue([]),
        })),
        orderBy: vi.fn().mockResolvedValue([]),
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
    execute: vi.fn().mockResolvedValue({ rows: [{ num: "0004" }] }),
  },
  usersTable: { id: "id", email: "email" },
  ticketsTable: { id: "id", userId: "userId", ticketNumber: "ticketNumber" },
  ticketMessagesTable: { id: "id", ticketId: "ticketId", senderId: "senderId" },
  eq: vi.fn((col: unknown, val: unknown) => ({ col, val })),
  and: vi.fn((...args: unknown[]) => args),
  desc: vi.fn((col: unknown) => col),
  asc: vi.fn((col: unknown) => col),
  sql: vi.fn((strings: TemplateStringsArray) => strings[0]),
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

const MOCK_TICKET = {
  id: "ticket-1",
  ticketNumber: "SA-0001",
  userId: SEED_IDS.residentUser,
  title: "AC not working",
  category: "maintenance",
  serviceType: "electrical",
  status: "open",
  unitNumber: "A-12-03",
  description: "The air conditioning unit in the living room is not cooling properly.",
  attachmentUrl: null,
  createdAt: new Date("2026-04-01T10:00:00Z"),
  updatedAt: new Date("2026-04-01T10:00:00Z"),
  updates: [
    {
      id: "update-1",
      message: "Ticket submitted successfully. Our team will review and respond shortly.",
      author: "Star Assist Team",
      authorType: "staff",
      createdAt: "2026-04-01T10:00:00.000Z",
    },
  ],
};

const MOCK_TICKET_MESSAGE = {
  id: "msg-1",
  ticketId: "ticket-1",
  senderId: SEED_IDS.residentUser,
  senderType: "resident",
  content: "Please fix this urgently.",
  createdAt: new Date("2026-04-01T11:00:00Z"),
};

const MOCK_CREATED_TICKET = {
  id: "ticket-4",
  ticketNumber: "SA-0004",
  userId: SEED_IDS.residentUser,
  title: "New maintenance request",
  category: "maintenance",
  serviceType: "plumbing",
  status: "open",
  unitNumber: "A-12-03",
  description: "Leaking pipe in bathroom.",
  attachmentUrl: null,
  createdAt: new Date("2026-04-11T09:00:00Z"),
  updatedAt: new Date("2026-04-11T09:00:00Z"),
  updates: [
    {
      id: "update-new",
      message: "Ticket submitted successfully. Our team will review and respond shortly.",
      author: "Star Assist Team",
      authorType: "staff",
      createdAt: "2026-04-11T09:00:00.000Z",
    },
  ],
};

// ─── Helper: configure select mock for tickets ─────────────────────────────────

/**
 * Sets up db.select to return:
 *   1st call → MOCK_RESIDENT_USER (auth middleware user lookup)
 *   2nd+ calls → ticketResult
 */
function setupMocks(ticketResult: unknown[] = [MOCK_TICKET]) {
  let callCount = 0;

  vi.mocked(db.select).mockImplementation(() => {
    callCount++;
    const isFirstCall = callCount === 1;
    const result = isFirstCall ? [MOCK_RESIDENT_USER] : ticketResult;

    // Thenable with .limit() and .orderBy() for all query shapes in ticket routes:
    // - .from(t).where(eq(...)).orderBy(...) — list endpoint
    // - .from(t).where(eq(...)).limit(1)    — detail endpoint
    // - .from(t).where(eq(...))             — messages ticket lookup (awaited directly)
    const mockOrderBy = vi.fn().mockResolvedValue(result);
    const mockLimit = vi.fn().mockResolvedValue(result);
    const mockWhere = vi.fn(() => {
      const whereResult: any = Promise.resolve(result);
      whereResult.limit = mockLimit;
      whereResult.orderBy = mockOrderBy;
      return whereResult;
    });
    const mockFrom = vi.fn(() => ({
      where: mockWhere,
      orderBy: vi.fn().mockResolvedValue(result),
    }));
    return { from: mockFrom } as unknown as ReturnType<typeof db.select>;
  });
}

function setupInsertMock(result: unknown[]) {
  const mockReturning = vi.fn().mockResolvedValue(result);
  const mockValues = vi.fn(() => ({ returning: mockReturning }));
  vi.mocked(db.insert).mockReturnValue({ values: mockValues } as unknown as ReturnType<typeof db.insert>);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("POST /api/tickets", () => {
  const residentToken = () => createTestToken(SEED_IDS.residentUser, "resident");

  beforeEach(() => {
    setupMocks();
    setupInsertMock([MOCK_CREATED_TICKET]);
    vi.mocked(db.execute).mockResolvedValue({ rows: [{ num: "0004" }] } as any);
  });

  it("returns 401 without auth token", async () => {
    const res = await request.post("/api/tickets").send({
      title: "AC not working",
      category: "maintenance",
      serviceType: "electrical",
      description: "AC broken",
    });
    expect(res.status).toBe(401);
  });

  it("returns 400 when required fields are missing", async () => {
    const token = residentToken();
    const res = await request
      .post("/api/tickets")
      .set(authHeader(token))
      .send({ title: "No category or description" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("validation_error");
  });

  it("returns 400 when title is missing", async () => {
    const token = residentToken();
    const res = await request
      .post("/api/tickets")
      .set(authHeader(token))
      .send({ category: "maintenance", serviceType: "electrical", description: "AC broken" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("validation_error");
  });

  it("returns 400 when description is missing", async () => {
    const token = residentToken();
    const res = await request
      .post("/api/tickets")
      .set(authHeader(token))
      .send({ title: "AC not working", category: "maintenance", serviceType: "electrical" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("validation_error");
  });

  it("returns 201 with ticket object on valid creation", async () => {
    const token = residentToken();
    const res = await request
      .post("/api/tickets")
      .set(authHeader(token))
      .send({
        title: "New maintenance request",
        category: "maintenance",
        serviceType: "plumbing",
        description: "Leaking pipe in bathroom.",
        unitNumber: "A-12-03",
      });
    expect(res.status).toBe(201);
    expect(res.body).toBeDefined();
  });

  it("response includes ticketNumber matching SA-XXXX pattern", async () => {
    const token = residentToken();
    const res = await request
      .post("/api/tickets")
      .set(authHeader(token))
      .send({
        title: "New maintenance request",
        category: "maintenance",
        serviceType: "plumbing",
        description: "Leaking pipe in bathroom.",
      });
    expect(res.status).toBe(201);
    expect(res.body.ticketNumber).toMatch(/^SA-\d{4}$/);
  });

  it("response includes first update from Star Assist Team", async () => {
    const token = residentToken();
    const res = await request
      .post("/api/tickets")
      .set(authHeader(token))
      .send({
        title: "New maintenance request",
        category: "maintenance",
        serviceType: "plumbing",
        description: "Leaking pipe in bathroom.",
      });
    expect(res.status).toBe(201);
    expect(Array.isArray(res.body.updates)).toBe(true);
    expect(res.body.updates.length).toBeGreaterThan(0);
    expect(res.body.updates[0].author).toBe("Star Assist Team");
  });

  it("response has expected shape", async () => {
    const token = residentToken();
    const res = await request
      .post("/api/tickets")
      .set(authHeader(token))
      .send({
        title: "New maintenance request",
        category: "maintenance",
        serviceType: "plumbing",
        description: "Leaking pipe in bathroom.",
      });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      id: expect.any(String),
      ticketNumber: expect.any(String),
      title: expect.any(String),
      category: expect.any(String),
      serviceType: expect.any(String),
      status: "open",
      description: expect.any(String),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
    expect(Array.isArray(res.body.updates)).toBe(true);
  });
});

describe("GET /api/tickets", () => {
  const residentToken = () => createTestToken(SEED_IDS.residentUser, "resident");

  beforeEach(() => {
    setupMocks([MOCK_TICKET]);
  });

  it("returns 401 without auth token", async () => {
    const res = await request.get("/api/tickets");
    expect(res.status).toBe(401);
  });

  it("returns 200 with array of tickets for authenticated user", async () => {
    const token = residentToken();
    const res = await request.get("/api/tickets").set(authHeader(token));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("each ticket has expected shape fields", async () => {
    const token = residentToken();
    const res = await request.get("/api/tickets").set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    const ticket = res.body[0];
    expect(ticket).toMatchObject({
      id: expect.any(String),
      ticketNumber: expect.any(String),
      title: expect.any(String),
      category: expect.any(String),
      serviceType: expect.any(String),
      status: expect.any(String),
      description: expect.any(String),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
    expect(ticket).toHaveProperty("unitNumber");
    expect(ticket).toHaveProperty("attachmentUrl");
    expect(Array.isArray(ticket.updates)).toBe(true);
  });
});

describe("GET /api/tickets/:id", () => {
  const residentToken = () => createTestToken(SEED_IDS.residentUser, "resident");

  it("returns 404 for non-existent ticket", async () => {
    setupMocks([]); // no ticket found
    const token = residentToken();
    const res = await request.get("/api/tickets/nonexistent-id").set(authHeader(token));
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("not_found");
  });

  it("returns 200 with ticket detail for valid ID", async () => {
    setupMocks([MOCK_TICKET]);
    const token = residentToken();
    const res = await request.get("/api/tickets/ticket-1").set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.id).toBe("ticket-1");
    expect(res.body.ticketNumber).toBe("SA-0001");
  });
});

describe("GET /api/tickets/:id/messages", () => {
  const residentToken = () => createTestToken(SEED_IDS.residentUser, "resident");

  it("returns 404 for non-existent ticket", async () => {
    // Auth lookup returns user, then ticket lookup returns nothing
    let callCount = 0;
    vi.mocked(db.select).mockImplementation(() => {
      callCount++;
      const result = callCount === 1 ? [MOCK_RESIDENT_USER] : [];
      const mockOrderBy = vi.fn().mockResolvedValue(result);
      const mockLimit = vi.fn().mockResolvedValue(result);
      const mockWhere = vi.fn(() => {
        const whereResult: any = Promise.resolve(result);
        whereResult.limit = mockLimit;
        whereResult.orderBy = mockOrderBy;
        return whereResult;
      });
      return { from: vi.fn(() => ({ where: mockWhere })) } as unknown as ReturnType<typeof db.select>;
    });

    const token = residentToken();
    const res = await request.get("/api/tickets/nonexistent/messages").set(authHeader(token));
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("not_found");
  });

  it("returns 403 when ticket belongs to different user", async () => {
    const DIFFERENT_USER_TICKET = { ...MOCK_TICKET, userId: "different-user-id" };
    // Auth lookup returns user, then ticket lookup returns a ticket owned by different user
    let callCount = 0;
    vi.mocked(db.select).mockImplementation(() => {
      callCount++;
      const result = callCount === 1 ? [MOCK_RESIDENT_USER] : [DIFFERENT_USER_TICKET];
      const mockOrderBy = vi.fn().mockResolvedValue(result);
      const mockLimit = vi.fn().mockResolvedValue(result);
      const mockWhere = vi.fn(() => {
        const whereResult: any = Promise.resolve(result);
        whereResult.limit = mockLimit;
        whereResult.orderBy = mockOrderBy;
        return whereResult;
      });
      return { from: vi.fn(() => ({ where: mockWhere })) } as unknown as ReturnType<typeof db.select>;
    });

    const token = residentToken();
    const res = await request.get("/api/tickets/ticket-other/messages").set(authHeader(token));
    expect(res.status).toBe(403);
    expect(res.body.error).toBe("forbidden");
  });

  it("returns 200 with empty array when no messages exist", async () => {
    // Auth lookup returns user, ticket lookup returns MOCK_TICKET (owned by resident), messages returns []
    let callCount = 0;
    vi.mocked(db.select).mockImplementation(() => {
      callCount++;
      let result: unknown[];
      if (callCount === 1) result = [MOCK_RESIDENT_USER];
      else if (callCount === 2) result = [MOCK_TICKET];
      else result = [];
      const mockOrderBy = vi.fn().mockResolvedValue(result);
      const mockLimit = vi.fn().mockResolvedValue(result);
      const mockWhere = vi.fn(() => {
        const whereResult: any = Promise.resolve(result);
        whereResult.limit = mockLimit;
        whereResult.orderBy = mockOrderBy;
        return whereResult;
      });
      return { from: vi.fn(() => ({ where: mockWhere })) } as unknown as ReturnType<typeof db.select>;
    });

    const token = residentToken();
    const res = await request.get("/api/tickets/ticket-1/messages").set(authHeader(token));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  it("returns 200 with messages array when messages exist", async () => {
    // Auth lookup returns user, ticket lookup returns MOCK_TICKET, messages returns [MOCK_TICKET_MESSAGE]
    let callCount = 0;
    vi.mocked(db.select).mockImplementation(() => {
      callCount++;
      let result: unknown[];
      if (callCount === 1) result = [MOCK_RESIDENT_USER];
      else if (callCount === 2) result = [MOCK_TICKET];
      else result = [MOCK_TICKET_MESSAGE];
      const mockOrderBy = vi.fn().mockResolvedValue(result);
      const mockLimit = vi.fn().mockResolvedValue(result);
      const mockWhere = vi.fn(() => {
        const whereResult: any = Promise.resolve(result);
        whereResult.limit = mockLimit;
        whereResult.orderBy = mockOrderBy;
        return whereResult;
      });
      return { from: vi.fn(() => ({ where: mockWhere })) } as unknown as ReturnType<typeof db.select>;
    });

    const token = residentToken();
    const res = await request.get("/api/tickets/ticket-1/messages").set(authHeader(token));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});

describe("POST /api/tickets/:id/messages", () => {
  const residentToken = () => createTestToken(SEED_IDS.residentUser, "resident");

  it("returns 400 when content is empty or missing", async () => {
    // Auth lookup returns user, ticket lookup returns MOCK_TICKET
    let callCount = 0;
    vi.mocked(db.select).mockImplementation(() => {
      callCount++;
      const result = callCount === 1 ? [MOCK_RESIDENT_USER] : [MOCK_TICKET];
      const mockOrderBy = vi.fn().mockResolvedValue(result);
      const mockLimit = vi.fn().mockResolvedValue(result);
      const mockWhere = vi.fn(() => {
        const whereResult: any = Promise.resolve(result);
        whereResult.limit = mockLimit;
        whereResult.orderBy = mockOrderBy;
        return whereResult;
      });
      return { from: vi.fn(() => ({ where: mockWhere })) } as unknown as ReturnType<typeof db.select>;
    });

    const token = residentToken();
    const res = await request
      .post("/api/tickets/ticket-1/messages")
      .set(authHeader(token))
      .send({ content: "" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("validation_error");
  });

  it("returns 201 with message object on valid submission", async () => {
    // Auth lookup returns user, ticket lookup returns MOCK_TICKET
    let callCount = 0;
    vi.mocked(db.select).mockImplementation(() => {
      callCount++;
      const result = callCount === 1 ? [MOCK_RESIDENT_USER] : [MOCK_TICKET];
      const mockOrderBy = vi.fn().mockResolvedValue(result);
      const mockLimit = vi.fn().mockResolvedValue(result);
      const mockWhere = vi.fn(() => {
        const whereResult: any = Promise.resolve(result);
        whereResult.limit = mockLimit;
        whereResult.orderBy = mockOrderBy;
        return whereResult;
      });
      return { from: vi.fn(() => ({ where: mockWhere })) } as unknown as ReturnType<typeof db.select>;
    });

    setupInsertMock([MOCK_TICKET_MESSAGE]);

    const token = residentToken();
    const res = await request
      .post("/api/tickets/ticket-1/messages")
      .set(authHeader(token))
      .send({ content: "Please fix this urgently." });
    expect(res.status).toBe(201);
    expect(res.body).toBeDefined();
    expect(res.body.ticketId).toBe("ticket-1");
  });

  it("response includes senderId matching the authenticated user", async () => {
    // Auth lookup returns user, ticket lookup returns MOCK_TICKET
    let callCount = 0;
    vi.mocked(db.select).mockImplementation(() => {
      callCount++;
      const result = callCount === 1 ? [MOCK_RESIDENT_USER] : [MOCK_TICKET];
      const mockOrderBy = vi.fn().mockResolvedValue(result);
      const mockLimit = vi.fn().mockResolvedValue(result);
      const mockWhere = vi.fn(() => {
        const whereResult: any = Promise.resolve(result);
        whereResult.limit = mockLimit;
        whereResult.orderBy = mockOrderBy;
        return whereResult;
      });
      return { from: vi.fn(() => ({ where: mockWhere })) } as unknown as ReturnType<typeof db.select>;
    });

    setupInsertMock([MOCK_TICKET_MESSAGE]);

    const token = residentToken();
    const res = await request
      .post("/api/tickets/ticket-1/messages")
      .set(authHeader(token))
      .send({ content: "Please fix this urgently." });
    expect(res.status).toBe(201);
    expect(res.body.senderId).toBe(SEED_IDS.residentUser);
  });
});
