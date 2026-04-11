import { describe, it, expect, vi, beforeEach } from "vitest";

// Module-level state for mock results - mutated by setupMocks()
// vi.mock factories run in isolation, so they capture these by reference through the closure
const mockState = {
  invoices: [] as unknown[],
  wallet: [{ balance: "500000" }] as unknown[],
};

// Sentinel objects used as table identity markers
const TABLE_INVOICES = Symbol.for("invoicesTable");
const TABLE_WALLET = Symbol.for("walletTable");

// Mock @workspace/db before any imports that pull it in.
// vi.mock is hoisted — must use inline factories only.
vi.mock("@workspace/db", () => {
  const invoicesMarker = Symbol.for("invoicesTable");
  const walletMarker = Symbol.for("walletTable");

  const invoicesTable: any = { id: "id", userId: "userId", dueDate: "dueDate", __marker: invoicesMarker };
  const walletTransactionsTable: any = { id: "id", userId: "userId", type: "type", amount: "amount", category: "category", __marker: walletMarker };

  return {
    db: {
      select: vi.fn((..._args: any[]) => ({
        from: vi.fn((table: any) => {
          // Determine result based on which table is being queried
          const isWallet = table?.__marker === walletMarker;
          const getResult = () => isWallet ? mockState.wallet : mockState.invoices;

          const mockLimit = vi.fn(() => Promise.resolve(getResult()));
          const mockOrderBy = vi.fn(() => Promise.resolve(getResult()));
          const mockWhere = vi.fn(() => {
            const whereResult: any = Promise.resolve(getResult());
            whereResult.limit = mockLimit;
            whereResult.orderBy = mockOrderBy;
            return whereResult;
          });
          return {
            where: mockWhere,
            orderBy: mockOrderBy,
          };
        }),
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
      transaction: vi.fn(async (fn: any) => {
        const tx = {
          insert: vi.fn(() => ({ values: vi.fn().mockResolvedValue([]) })),
          update: vi.fn(() => ({ set: vi.fn(() => ({ where: vi.fn().mockResolvedValue([]) })) })),
        };
        return fn(tx);
      }),
    },
    usersTable: { id: "id", email: "email", userId: "userId" },
    invoicesTable,
    walletTransactionsTable,
    eq: vi.fn((col: unknown, val: unknown) => ({ col, val })),
    and: vi.fn((...args: unknown[]) => args),
    desc: vi.fn((col: unknown) => col),
    sql: vi.fn(),
  };
});

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
import { createTestToken, authHeader, SEED_IDS } from "./helpers.js";

const request = supertest(app);

// ─── Mock data ────────────────────────────────────────────────────────────────

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

function setupMocks(
  invoices: unknown[] = MOCK_INVOICES,
  wallet: unknown[] = [{ balance: "500000" }],
) {
  mockState.invoices = invoices;
  mockState.wallet = wallet;
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
    setupMocks([]);
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

  it("returns 401 without auth token", async () => {
    const res = await request
      .post("/api/invoices/inv-1/pay")
      .send({});
    expect(res.status).toBe(401);
  });

  it("returns 404 when invoice does not exist", async () => {
    setupMocks([]);
    const token = residentToken();
    const res = await request
      .post("/api/invoices/inv-1/pay")
      .set(authHeader(token))
      .send({});
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("not_found");
  });

  it("returns 400 when invoice is already paid", async () => {
    setupMocks([MOCK_INVOICES[1]]);
    const token = residentToken();
    const res = await request
      .post("/api/invoices/inv-2/pay")
      .set(authHeader(token))
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("already_paid");
  });

  it("returns 400 when wallet balance is insufficient", async () => {
    setupMocks([MOCK_INVOICES[0]], [{ balance: "0" }]);
    const token = residentToken();
    const res = await request
      .post("/api/invoices/inv-1/pay")
      .set(authHeader(token))
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("insufficient_balance");
    expect(res.body.walletBalance).toBe(0);
    expect(res.body.outstanding).toBe(285000);
  });

  it("returns 200 with success on valid wallet payment", async () => {
    setupMocks([MOCK_INVOICES[0]], [{ balance: "500000" }]);
    const token = residentToken();
    const res = await request
      .post("/api/invoices/inv-1/pay")
      .set(authHeader(token))
      .send({});
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.invoice).toMatchObject({
      id: "inv-1",
      invoiceNumber: "INV-2026-04-001",
      status: "paid",
      paidAmount: 285000,
    });
  });
});
