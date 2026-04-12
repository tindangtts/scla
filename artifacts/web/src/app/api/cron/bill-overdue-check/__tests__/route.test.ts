import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

// Mock DB
const mockWhere = vi.fn();
const mockFrom = vi.fn(() => ({ where: mockWhere }));
const mockSelect = vi.fn(() => ({ from: mockFrom }));

vi.mock("@/lib/db", () => ({
  db: {
    select: (...args: unknown[]) => mockSelect(...args),
  },
}));

// Mock notifications
const mockNotifyBillOverdue = vi.fn();
vi.mock("@/lib/notifications", () => ({
  notifyBillOverdue: (...args: unknown[]) => mockNotifyBillOverdue(...args),
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((a: unknown, b: unknown) => ({ op: "eq", field: a, value: b })),
  and: vi.fn((...args: unknown[]) => ({ op: "and", conditions: args })),
  lt: vi.fn((a: unknown, b: unknown) => ({ op: "lt", field: a, value: b })),
  sql: Object.assign(
    (strings: TemplateStringsArray, ...values: unknown[]) => ({
      op: "sql",
      strings: Array.from(strings),
      values,
    }),
    {},
  ),
}));

vi.mock("@workspace/db/schema", () => ({
  invoicesTable: {
    id: "invoices_id",
    userId: "invoices_userId",
    invoiceNumber: "invoices_invoiceNumber",
    totalAmount: "invoices_totalAmount",
    status: "invoices_status",
    dueDate: "invoices_dueDate",
  },
}));

import { POST } from "../route";

function makeRequest(url: string, headers?: Record<string, string>) {
  return new NextRequest(new URL(url, "http://localhost:3000"), {
    method: "POST",
    headers,
  });
}

describe("POST /api/cron/bill-overdue-check", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = "test-secret";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("returns 401 when cron secret is wrong", async () => {
    const res = await POST(
      makeRequest("/api/cron/bill-overdue-check", {
        "x-cron-secret": "wrong-secret",
      }),
    );

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 200 with zero counts when no overdue invoices", async () => {
    mockWhere.mockResolvedValue([]);

    const res = await POST(
      makeRequest("/api/cron/bill-overdue-check", {
        "x-cron-secret": "test-secret",
      }),
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ processed: 0, errors: 0, total: 0 });
  });

  it("processes overdue invoices and returns counts", async () => {
    const invoices = [
      { id: "inv-1", userId: "user-1", invoiceNumber: "INV-001", totalAmount: "50000" },
      { id: "inv-2", userId: "user-2", invoiceNumber: "INV-002", totalAmount: "30000" },
    ];
    mockWhere.mockResolvedValue(invoices);
    mockNotifyBillOverdue.mockResolvedValue(undefined);

    const res = await POST(
      makeRequest("/api/cron/bill-overdue-check", {
        "x-cron-secret": "test-secret",
      }),
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ processed: 2, errors: 0, total: 2 });
    expect(mockNotifyBillOverdue).toHaveBeenCalledTimes(2);
    expect(mockNotifyBillOverdue).toHaveBeenCalledWith("user-1", "INV-001", 50000);
    expect(mockNotifyBillOverdue).toHaveBeenCalledWith("user-2", "INV-002", 30000);
  });

  it("counts errors when notification fails", async () => {
    const invoices = [
      { id: "inv-1", userId: "user-1", invoiceNumber: "INV-001", totalAmount: "50000" },
    ];
    mockWhere.mockResolvedValue(invoices);
    mockNotifyBillOverdue.mockRejectedValue(new Error("Push failed"));

    const res = await POST(
      makeRequest("/api/cron/bill-overdue-check", {
        "x-cron-secret": "test-secret",
      }),
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ processed: 0, errors: 1, total: 1 });
  });
});
