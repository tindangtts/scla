import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock push
const mockSendPushToUser = vi.fn();
vi.mock("@/lib/push", () => ({
  sendPushToUser: (...args: unknown[]) => mockSendPushToUser(...args),
}));

// Mock email
const mockSendBillOverdueEmail = vi.fn();
const mockSendTicketUpdateEmail = vi.fn();
vi.mock("@/lib/email", () => ({
  sendBillOverdueEmail: (...args: unknown[]) => mockSendBillOverdueEmail(...args),
  sendTicketUpdateEmail: (...args: unknown[]) => mockSendTicketUpdateEmail(...args),
}));

// Mock DB
const mockInsertValues = vi.fn().mockResolvedValue(undefined);
const mockInsert = vi.fn(() => ({ values: mockInsertValues }));
const mockSelectWhere = vi.fn();
const mockSelectFrom = vi.fn(() => ({ where: mockSelectWhere }));
const mockSelect = vi.fn(() => ({ from: mockSelectFrom }));

vi.mock("@/lib/db", () => ({
  db: {
    insert: (...args: unknown[]) => mockInsert(...args),
    select: (...args: unknown[]) => mockSelect(...args),
  },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((a: unknown, b: unknown) => ({ field: a, value: b })),
}));

vi.mock("@workspace/db/schema", () => ({
  notificationsTable: { name: "notifications" },
  usersTable: {
    id: "users_id",
    email: "users_email",
    name: "users_name",
    emailNotifications: "users_email_notifications",
  },
}));

import {
  notifyBillOverdue,
  notifyTicketUpdate,
  notifyNewMessage,
} from "../notifications";

describe("notification helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSendPushToUser.mockResolvedValue(undefined);
    mockSendBillOverdueEmail.mockResolvedValue(undefined);
    mockSendTicketUpdateEmail.mockResolvedValue(undefined);
    mockInsertValues.mockResolvedValue(undefined);
  });

  describe("notifyBillOverdue", () => {
    it("inserts notification, sends push, and sends email when opted in", async () => {
      mockSelectWhere.mockResolvedValue([
        { email: "r@test.com", name: "Resident", emailNotifications: true },
      ]);

      await notifyBillOverdue("user-1", "INV-001", 50000);

      expect(mockInsert).toHaveBeenCalled();
      expect(mockInsertValues).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user-1",
          title: "Bill Overdue",
          type: "general",
        })
      );
      expect(mockSendPushToUser).toHaveBeenCalledWith("user-1", {
        title: "Bill Overdue",
        body: expect.stringContaining("INV-001"),
        url: "/bills",
      });
      expect(mockSendBillOverdueEmail).toHaveBeenCalledWith(
        "r@test.com",
        "Resident",
        "INV-001",
        50000
      );
    });

    it("skips email when user opted out", async () => {
      mockSelectWhere.mockResolvedValue([
        { email: "r@test.com", name: "Resident", emailNotifications: false },
      ]);

      await notifyBillOverdue("user-1", "INV-002", 30000);

      expect(mockSendPushToUser).toHaveBeenCalled();
      expect(mockSendBillOverdueEmail).not.toHaveBeenCalled();
    });
  });

  describe("notifyTicketUpdate", () => {
    it("inserts notification, sends push, and sends email when opted in", async () => {
      mockSelectWhere.mockResolvedValue([
        { email: "r@test.com", name: "Resident", emailNotifications: true },
      ]);

      await notifyTicketUpdate("user-1", "ticket-id-1", "TK-001", "in_progress");

      expect(mockInsert).toHaveBeenCalled();
      expect(mockSendPushToUser).toHaveBeenCalledWith("user-1", {
        title: "Ticket Updated",
        body: expect.stringContaining("TK-001"),
        url: "/star-assist/ticket-id-1",
      });
      expect(mockSendTicketUpdateEmail).toHaveBeenCalledWith(
        "r@test.com",
        "Resident",
        "TK-001",
        "in_progress"
      );
    });

    it("skips email when user opted out", async () => {
      mockSelectWhere.mockResolvedValue([
        { email: "r@test.com", name: "Resident", emailNotifications: false },
      ]);

      await notifyTicketUpdate("user-1", "ticket-id-1", "TK-002", "closed");

      expect(mockSendTicketUpdateEmail).not.toHaveBeenCalled();
    });
  });

  describe("notifyNewMessage", () => {
    it("creates notification and sends push but no email", async () => {
      await notifyNewMessage("user-1", "ticket-id-1", "TK-001");

      expect(mockInsert).toHaveBeenCalled();
      expect(mockSendPushToUser).toHaveBeenCalledWith("user-1", {
        title: "New Message",
        body: expect.stringContaining("TK-001"),
        url: "/star-assist/ticket-id-1",
      });
      // notifyNewMessage does NOT send email
      expect(mockSendBillOverdueEmail).not.toHaveBeenCalled();
      expect(mockSendTicketUpdateEmail).not.toHaveBeenCalled();
    });
  });
});
