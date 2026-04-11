import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock dependencies before importing scheduler ────────────────────────────
// vi.mock is hoisted; factories CANNOT reference outer variables

vi.mock("../email-service.js", () => ({
  sendBillOverdueEmail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../push-service.js", () => ({
  sendPushToUser: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../logger.js", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@workspace/db", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn().mockResolvedValue([]),
      })),
    })),
  },
  invoicesTable: {
    dueDate: "due_date",
    status: "status",
  },
  and: vi.fn((...args: unknown[]) => args),
  lt: vi.fn((col: unknown, val: unknown) => ({ col, val })),
  or: vi.fn((...args: unknown[]) => args),
  eq: vi.fn((col: unknown, val: unknown) => ({ col, val })),
}));

import { checkBillOverdue } from "../scheduler.js";
import { sendBillOverdueEmail } from "../email-service.js";
import { sendPushToUser } from "../push-service.js";
import { db } from "@workspace/db";

// ─── Helper: configure the db mock chain to return specific invoices ──────────
function setOverdueInvoices(invoices: unknown[]) {
  const mockWhere = vi.fn().mockResolvedValue(invoices);
  const mockFrom = vi.fn(() => ({ where: mockWhere }));
  vi.mocked(db.select).mockReturnValue({ from: mockFrom } as unknown as ReturnType<typeof db.select>);
}

// ─── Test invoice factory ─────────────────────────────────────────────────────
function makeInvoice(overrides: Partial<{
  userId: string;
  invoiceNumber: string;
  totalAmount: string;
  paidAmount: string;
  dueDate: string;
  status: string;
}> = {}) {
  return {
    userId: "user-1",
    invoiceNumber: "INV-001",
    totalAmount: "100.00",
    paidAmount: "0.00",
    dueDate: "2026-03-01",
    status: "unpaid",
    ...overrides,
  };
}

describe("scheduler - checkBillOverdue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset db to empty by default
    setOverdueInvoices([]);
  });

  it("does nothing when no overdue invoices exist", async () => {
    setOverdueInvoices([]);

    await checkBillOverdue();

    expect(sendBillOverdueEmail).not.toHaveBeenCalled();
    expect(sendPushToUser).not.toHaveBeenCalled();
  });

  it("calls sendBillOverdueEmail once for each overdue invoice", async () => {
    const invoices = [
      makeInvoice({ userId: "user-1", invoiceNumber: "INV-001" }),
      makeInvoice({ userId: "user-2", invoiceNumber: "INV-002", status: "partially_paid", paidAmount: "30.00" }),
    ];
    setOverdueInvoices(invoices);

    await checkBillOverdue();

    expect(sendBillOverdueEmail).toHaveBeenCalledTimes(2);
  });

  it("calls sendPushToUser once for each overdue invoice", async () => {
    const invoices = [
      makeInvoice({ userId: "user-1", invoiceNumber: "INV-001" }),
      makeInvoice({ userId: "user-2", invoiceNumber: "INV-002" }),
    ];
    setOverdueInvoices(invoices);

    await checkBillOverdue();

    expect(sendPushToUser).toHaveBeenCalledTimes(2);
  });

  it("passes correct userId and invoiceNumber to sendBillOverdueEmail", async () => {
    const invoice = makeInvoice({
      userId: "user-99",
      invoiceNumber: "INV-999",
      totalAmount: "500.00",
      paidAmount: "200.00",
      dueDate: "2026-03-15",
    });
    setOverdueInvoices([invoice]);

    await checkBillOverdue();

    expect(sendBillOverdueEmail).toHaveBeenCalledWith(
      "user-99",
      "INV-999",
      "300.00", // 500 - 200
      "2026-03-15"
    );
  });

  it("passes correct userId and push payload to sendPushToUser", async () => {
    const invoice = makeInvoice({
      userId: "user-99",
      invoiceNumber: "INV-999",
      totalAmount: "500.00",
      paidAmount: "200.00",
    });
    setOverdueInvoices([invoice]);

    await checkBillOverdue();

    expect(sendPushToUser).toHaveBeenCalledWith(
      "user-99",
      expect.objectContaining({
        title: "Invoice Overdue",
        url: "/bills",
      })
    );
  });
});
