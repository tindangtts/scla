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
  },
  usersTable: { id: "id", email: "email", userId: "userId" },
  invoicesTable: { id: "id", userId: "userId", dueDate: "dueDate" },
  eq: vi.fn((col: unknown, val: unknown) => ({ col, val })),
  and: vi.fn((...args: unknown[]) => args),
  desc: vi.fn((col: unknown) => col),
}));

// Mock rate limiter for auth middleware path
vi.mock("../lib/rate-limiter.js", () => ({
  authRateLimiter: (_req: any, _res: any, next: any) => next(),
}));

// Mock password functions
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

const MOCK_INVOICES = [
  {
    id: "inv-1",
    invoiceNumber: "INV-2026-04-001",
    userId: SEED_IDS.residentUser,
    unitNumber: "A-12-03",
    category: "Service Charge",
    description: "Monthly Service Charge",
    issueDate: "2026-04-01",
    dueDate: "2026-04-15",
    totalAmount: "285000",
    paidAmount: "0",
    status: "unpaid",
    month: "2026-04",
    lineItems: [
      { name: "Service Charge", amount: 250000 },
      { name: "Waste Management", amount: 35000 },
    ],
  },
  {
    id: "inv-2",
    invoiceNumber: "INV-2026-03-001",
    userId: SEED_IDS.residentUser,
    unitNumber: "A-12-03",
    category: "Service Charge",
    description: "March Service Charge",
    issueDate: "2026-03-01",
    dueDate: "2026-03-15",
    totalAmount: "285000",
    paidAmount: "285000",
    status: "paid",
    month: "2026-03",
    lineItems: [
      { name: "Service Charge", amount: 250000 },
      { name: "Waste Management", amount: 35000 },
    ],
  },
];

// ─── Helper: configure mock chain for db.select ───────────────────────────────

/**
 * Set up the db.select mock to return different results based on what's being queried.
 * The auth middleware does a users lookup (with .limit(1)), and invoice routes do
 * invoice lookups (summary: no limit, list: orderBy, detail: with .limit(1), pay: no limit).
 *
 * Call order per request:
 *   1st db.select() call → auth middleware user lookup → returns [MOCK_RESIDENT_USER]
 *   2nd db.select() call → invoice route query → returns invoiceResult
 */
function setupMocks(invoiceResult: unknown[] = MOCK_INVOICES) {
  let callCount = 0;

  vi.mocked(db.select).mockImplementation(() => {
    callCount++;
    const isFirstCall = callCount === 1;
    const result = isFirstCall ? [MOCK_RESIDENT_USER] : invoiceResult;

    // All query shapes the invoice routes use:
    // - .from(t).where(eq(...)) → summary, pay (awaited directly as array)
    // - .from(t).where(eq(...)).orderBy(...) → list endpoint
    // - .from(t).where(and(...)).limit(1) → detail endpoint
    const mockOrderBy = vi.fn().mockResolvedValue(result);
    const mockLimit = vi.fn().mockResolvedValue(result);
    const mockWhere = vi.fn(() => {
      // Return a thenable that also supports .limit() and .orderBy()
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

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("GET /api/invoices", () => {
  const residentToken = () => createTestToken(SEED_IDS.residentUser, "resident");

  beforeEach(() => {
    setupMocks();
  });

  it("returns 401 without auth token", async () => {
    const res = await request.get("/api/invoices");
    expect(res.status).toBe(401);
  });

  it("returns 200 with array of invoices for authenticated resident", async () => {
    const res = await request.get("/api/invoices").set(authHeader(residentToken()));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("each invoice has the expected mapped shape with numbers (not strings)", async () => {
    const res = await request.get("/api/invoices").set(authHeader(residentToken()));
    expect(res.status).toBe(200);
    const invoices = res.body;
    expect(invoices.length).toBeGreaterThan(0);
    const invoice = invoices[0];
    expect(invoice).toMatchObject({
      id: expect.any(String),
      invoiceNumber: expect.any(String),
      unitNumber: expect.any(String),
      category: expect.any(String),
      status: expect.any(String),
      month: expect.any(String),
    });
    // totalAmount and paidAmount must be numbers (not strings) per mapInvoice
    expect(typeof invoice.totalAmount).toBe("number");
    expect(typeof invoice.paidAmount).toBe("number");
    expect(Array.isArray(invoice.lineItems)).toBe(true);
  });
});

describe("GET /api/invoices/summary", () => {
  const residentToken = () => createTestToken(SEED_IDS.residentUser, "resident");

  beforeEach(() => {
    setupMocks();
  });

  it("returns 401 without auth token", async () => {
    const res = await request.get("/api/invoices/summary");
    expect(res.status).toBe(401);
  });

  it("returns 200 with summary object", async () => {
    const res = await request.get("/api/invoices/summary").set(authHeader(residentToken()));
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      totalOutstanding: expect.any(Number),
      totalThisMonth: expect.any(Number),
      unpaidCount: expect.any(Number),
      partiallyPaidCount: expect.any(Number),
    });
    expect(res.body).toHaveProperty("lastPaymentDate");
    expect(res.body).toHaveProperty("lastPaymentAmount");
  });

  it("totalOutstanding correctly sums unpaid invoice amounts", async () => {
    // MOCK_INVOICES: inv-1 is unpaid (285000), inv-2 is paid (0 outstanding)
    const res = await request.get("/api/invoices/summary").set(authHeader(residentToken()));
    expect(res.status).toBe(200);
    expect(res.body.unpaidCount).toBe(1);
    expect(res.body.partiallyPaidCount).toBe(0);
    expect(res.body.totalOutstanding).toBe(285000);
  });
});

describe("GET /api/invoices/:id", () => {
  const residentToken = () => createTestToken(SEED_IDS.residentUser, "resident");

  it("returns 401 without auth token", async () => {
    const res = await request.get("/api/invoices/inv-1");
    expect(res.status).toBe(401);
  });

  it("returns 404 for non-existent invoice", async () => {
    setupMocks([]); // invoice not found
    const token = residentToken();
    const res = await request.get("/api/invoices/nonexistent-id").set(authHeader(token));
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("not_found");
  });

  it("returns 200 with invoice detail for valid ID", async () => {
    setupMocks([MOCK_INVOICES[0]]);
    const token = residentToken();
    const res = await request.get("/api/invoices/inv-1").set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.id).toBe("inv-1");
    expect(typeof res.body.totalAmount).toBe("number");
    expect(typeof res.body.paidAmount).toBe("number");
    expect(res.body.invoiceNumber).toBe("INV-2026-04-001");
  });
});

describe("POST /api/invoices/:id/pay", () => {
  const residentToken = () => createTestToken(SEED_IDS.residentUser, "resident");

  beforeEach(() => {
    setupMocks();
  });

  it("returns 401 without auth token", async () => {
    const res = await request
      .post("/api/invoices/inv-1/pay")
      .send({ paymentMethod: "wavepay", invoiceIds: ["inv-1"] });
    expect(res.status).toBe(401);
  });

  it("returns 400 when paymentMethod is missing", async () => {
    const token = residentToken();
    const res = await request
      .post("/api/invoices/inv-1/pay")
      .set(authHeader(token))
      .send({ invoiceIds: ["inv-1"] });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("validation_error");
  });

  it("returns 400 when invoiceIds is missing or empty", async () => {
    const token = residentToken();
    const res = await request
      .post("/api/invoices/inv-1/pay")
      .set(authHeader(token))
      .send({ paymentMethod: "wavepay", invoiceIds: [] });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("validation_error");
  });

  it("returns 200 with payment session on valid request", async () => {
    const token = residentToken();
    const res = await request
      .post("/api/invoices/inv-1/pay")
      .set(authHeader(token))
      .send({ paymentMethod: "wavepay", invoiceIds: ["inv-1"] });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      sessionId: expect.any(String),
      paymentMethod: "wavepay",
      totalAmount: expect.any(Number),
      redirectUrl: expect.stringContaining("wavepay.com"),
      status: "pending",
    });
  });

  it("returns 200 with kbzpay redirect URL when using kbzpay method", async () => {
    const token = residentToken();
    const res = await request
      .post("/api/invoices/inv-1/pay")
      .set(authHeader(token))
      .send({ paymentMethod: "kbzpay", invoiceIds: ["inv-1"] });
    expect(res.status).toBe(200);
    expect(res.body.redirectUrl).toContain("kbzpay.com");
    expect(res.body.status).toBe("pending");
  });
});
