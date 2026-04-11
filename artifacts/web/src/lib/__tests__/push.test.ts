import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock web-push
const mockSendNotification = vi.fn();
const mockSetVapidDetails = vi.fn();
vi.mock("web-push", () => ({
  default: {
    setVapidDetails: (...args: unknown[]) => mockSetVapidDetails(...args),
    sendNotification: (...args: unknown[]) => mockSendNotification(...args),
  },
}));

// Mock DB
const mockDeleteWhere = vi.fn().mockResolvedValue(undefined);
const mockDelete = vi.fn(() => ({ where: mockDeleteWhere }));
const mockSelectWhere = vi.fn();
const mockSelectFrom = vi.fn(() => ({ where: mockSelectWhere }));
const mockSelect = vi.fn(() => ({ from: mockSelectFrom }));

vi.mock("@/lib/db", () => ({
  db: {
    select: (...args: unknown[]) => mockSelect(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((a: unknown, b: unknown) => ({ field: a, value: b })),
}));

vi.mock("@workspace/db/schema", () => ({
  pushSubscriptionsTable: {
    userId: "push_subscriptions_userId",
    id: "push_subscriptions_id",
    endpoint: "push_subscriptions_endpoint",
  },
}));

describe("push helpers", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset module-level env check behavior
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe("sendPushToUser", () => {
    it("skips when VAPID keys not configured", async () => {
      delete process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      delete process.env.VAPID_PRIVATE_KEY;

      // Re-import to get fresh module with env check
      const { sendPushToUser } = await import("../push");

      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      await sendPushToUser("user-1", { title: "Test", body: "Test", url: "/" });

      expect(mockSendNotification).not.toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining("VAPID keys not configured")
      );
      warnSpy.mockRestore();
    });

    it("sends notification to all subscriptions", async () => {
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = "test-public-key";
      process.env.VAPID_PRIVATE_KEY = "test-private-key";

      const subs = [
        { id: "sub-1", endpoint: "https://push.example.com/1", p256dh: "key1", auth: "auth1", userId: "user-1" },
        { id: "sub-2", endpoint: "https://push.example.com/2", p256dh: "key2", auth: "auth2", userId: "user-1" },
      ];
      mockSelectWhere.mockResolvedValue(subs);
      mockSendNotification.mockResolvedValue({});

      const { sendPushToUser } = await import("../push");
      await sendPushToUser("user-1", { title: "Hello", body: "World", url: "/test" });

      expect(mockSendNotification).toHaveBeenCalledTimes(2);
      expect(mockSendNotification).toHaveBeenCalledWith(
        { endpoint: "https://push.example.com/1", keys: { p256dh: "key1", auth: "auth1" } },
        JSON.stringify({ title: "Hello", body: "World", url: "/test" })
      );
    });

    it("deletes expired subscription on 410 status", async () => {
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = "test-public-key";
      process.env.VAPID_PRIVATE_KEY = "test-private-key";

      const subs = [
        { id: "sub-expired", endpoint: "https://push.example.com/expired", p256dh: "key1", auth: "auth1", userId: "user-1" },
      ];
      mockSelectWhere.mockResolvedValue(subs);

      const error410 = Object.assign(new Error("Gone"), { statusCode: 410 });
      mockSendNotification.mockRejectedValue(error410);

      const { sendPushToUser } = await import("../push");
      await sendPushToUser("user-1", { title: "Test", body: "Test", url: "/" });

      expect(mockDelete).toHaveBeenCalled();
      expect(mockDeleteWhere).toHaveBeenCalled();
    });

    it("logs error but continues on non-410 failure", async () => {
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = "test-public-key";
      process.env.VAPID_PRIVATE_KEY = "test-private-key";

      const subs = [
        { id: "sub-1", endpoint: "https://push.example.com/1", p256dh: "key1", auth: "auth1", userId: "user-1" },
      ];
      mockSelectWhere.mockResolvedValue(subs);

      const error500 = Object.assign(new Error("Server Error"), { statusCode: 500 });
      mockSendNotification.mockRejectedValue(error500);

      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const { sendPushToUser } = await import("../push");
      await sendPushToUser("user-1", { title: "Test", body: "Test", url: "/" });

      expect(mockDelete).not.toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalled();
      errorSpy.mockRestore();
    });
  });
});
