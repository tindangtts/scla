import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock Supabase
const mockGetUser = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
  })),
}));

// Mock DB
const mockOnConflictDoUpdate = vi.fn().mockResolvedValue(undefined);
const mockInsertValues = vi.fn(() => ({ onConflictDoUpdate: mockOnConflictDoUpdate }));
const mockInsert = vi.fn(() => ({ values: mockInsertValues }));

const mockDeleteWhere = vi.fn().mockResolvedValue(undefined);
const mockDelete = vi.fn(() => ({ where: mockDeleteWhere }));

const mockWhere = vi.fn();
const mockFrom = vi.fn(() => ({ where: mockWhere }));
const mockSelect = vi.fn(() => ({ from: mockFrom }));

vi.mock("@/lib/db", () => ({
  db: {
    select: (...args: unknown[]) => mockSelect(...args),
    insert: (...args: unknown[]) => mockInsert(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((a: unknown, b: unknown) => ({ field: a, value: b })),
  and: vi.fn((...args: unknown[]) => ({ op: "and", conditions: args })),
}));

vi.mock("@workspace/db/schema", () => ({
  pushSubscriptionsTable: {
    userId: "push_subscriptions_userId",
    endpoint: "push_subscriptions_endpoint",
  },
  usersTable: { id: "users_id", email: "users_email" },
}));

import { POST } from "../route";

function makeRequest(body: unknown) {
  return new NextRequest(new URL("/api/push/subscribe", "http://localhost:3000"), {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

const mockUser = { id: "supabase-1", email: "test@test.com" };

describe("POST /api/push/subscribe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const res = await POST(
      makeRequest({ endpoint: "https://push.example.com", p256dh: "key", auth: "auth" }),
    );

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 400 when subscription fields are missing", async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser } });

    const res = await POST(makeRequest({ endpoint: "https://push.example.com" }));

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Missing subscription fields");
  });

  it("returns 404 when user not found in app DB", async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser } });
    mockWhere.mockResolvedValue([]);

    const res = await POST(
      makeRequest({ endpoint: "https://push.example.com", p256dh: "key", auth: "auth" }),
    );

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("User not found");
  });

  it("stores subscription and returns ok for authenticated user", async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser } });
    mockWhere.mockResolvedValue([{ id: "app-user-1" }]);

    const res = await POST(
      makeRequest({
        endpoint: "https://push.example.com/sub1",
        p256dh: "test-p256dh",
        auth: "test-auth",
      }),
    );

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(mockInsert).toHaveBeenCalled();
    expect(mockInsertValues).toHaveBeenCalledWith({
      userId: "app-user-1",
      endpoint: "https://push.example.com/sub1",
      p256dh: "test-p256dh",
      auth: "test-auth",
    });
  });
});
