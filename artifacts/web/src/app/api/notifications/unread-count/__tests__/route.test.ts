import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase
const mockGetUser = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
  })),
}));

// Mock DB
const mockLimit = vi.fn();
const mockWhere = vi.fn(() => ({ limit: mockLimit }));
const mockFrom = vi.fn(() => ({ where: mockWhere }));
const mockSelect = vi.fn(() => ({ from: mockFrom }));

vi.mock("@/lib/db", () => ({
  db: {
    select: (...args: Parameters<typeof mockSelect>) => mockSelect(...args),
  },
}));

// Mock getUnreadCount
const mockGetUnreadCount = vi.fn();
vi.mock("@/lib/queries/notifications", () => ({
  getUnreadCount: (...args: unknown[]) => mockGetUnreadCount(...args),
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((a: unknown, b: unknown) => ({ field: a, value: b })),
}));

vi.mock("@workspace/db/schema", () => ({
  usersTable: { id: "users_id", email: "users_email" },
}));

import { GET } from "../route";

const mockUser = { id: "supabase-1", email: "test@test.com" };

describe("GET /api/notifications/unread-count", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const res = await GET();

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("returns count 0 when user not found in app DB", async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser } });
    mockLimit.mockResolvedValue([]);

    const res = await GET();

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.count).toBe(0);
  });

  it("returns unread count from getUnreadCount", async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser } });
    mockLimit.mockResolvedValue([{ id: "app-user-1" }]);
    mockGetUnreadCount.mockResolvedValue(5);

    const res = await GET();

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.count).toBe(5);
    expect(mockGetUnreadCount).toHaveBeenCalledWith("app-user-1");
  });
});
