import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock Supabase
const mockGetUser = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
  })),
}));

// Mock DB chains
const mockLimit = vi.fn();
const mockOrderBy = vi.fn();
const mockWhere = vi.fn(() => ({
  limit: mockLimit,
  orderBy: mockOrderBy,
}));
const mockFrom = vi.fn(() => ({ where: mockWhere }));
const mockSelectObj = vi.fn(() => ({ from: mockFrom }));

const mockReturning = vi.fn();
const mockInsertValues = vi.fn(() => ({ returning: mockReturning }));
const mockInsert = vi.fn(() => ({ values: mockInsertValues }));

vi.mock("@/lib/db", () => ({
  db: {
    select: (...args: unknown[]) => mockSelectObj(...args),
    insert: (...args: unknown[]) => mockInsert(...args),
  },
}));

vi.mock("@/lib/notifications", () => ({
  notifyNewMessage: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((a: unknown, b: unknown) => ({ field: a, value: b })),
  asc: vi.fn((a: unknown) => ({ asc: a })),
}));

vi.mock("@workspace/db/schema", () => ({
  ticketMessagesTable: {
    ticketId: "ticket_messages_ticketId",
    createdAt: "ticket_messages_createdAt",
  },
  ticketsTable: {
    id: "tickets_id",
    userId: "tickets_userId",
    assignedTo: "tickets_assignedTo",
    ticketNumber: "tickets_ticketNumber",
  },
  usersTable: { id: "users_id", email: "users_email" },
  staffUsersTable: { id: "staff_users_id", email: "staff_users_email" },
}));

// Stub fetch globally for WS broadcast
vi.stubGlobal("fetch", vi.fn().mockResolvedValue({}));

import { GET, POST } from "../route";

function makeRequest(url: string, options?: RequestInit) {
  return new NextRequest(new URL(url, "http://localhost:3000"), options);
}

function makeParams(id: string) {
  return Promise.resolve({ id });
}

const VALID_UUID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
const INVALID_UUID = "not-a-uuid";

const mockUser = { id: "supabase-1", email: "test@test.com" };

describe("GET /api/tickets/[id]/messages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const res = await GET(makeRequest(`/api/tickets/${VALID_UUID}/messages`), {
      params: makeParams(VALID_UUID),
    });

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 400 for invalid UUID", async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser } });

    const res = await GET(makeRequest(`/api/tickets/${INVALID_UUID}/messages`), {
      params: makeParams(INVALID_UUID),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Invalid ticket ID");
  });

  it("returns 404 when ticket not found", async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser } });
    mockLimit.mockResolvedValue([]);

    const res = await GET(makeRequest(`/api/tickets/${VALID_UUID}/messages`), {
      params: makeParams(VALID_UUID),
    });

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Ticket not found");
  });

  it("returns 200 with messages when ticket exists", async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser } });
    const messages = [
      { id: "msg-1", content: "Hello", senderType: "resident" },
      { id: "msg-2", content: "Hi there", senderType: "staff" },
    ];

    // First call: ticket check (returns ticket via limit)
    // Second call: messages query (returns messages via orderBy)
    let callCount = 0;
    mockLimit.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return [{ id: VALID_UUID }];
      return messages;
    });
    mockOrderBy.mockResolvedValue(messages);

    const res = await GET(makeRequest(`/api/tickets/${VALID_UUID}/messages`), {
      params: makeParams(VALID_UUID),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual(messages);
  });
});

describe("POST /api/tickets/[id]/messages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const res = await POST(
      makeRequest(`/api/tickets/${VALID_UUID}/messages`, {
        method: "POST",
        body: JSON.stringify({ content: "Hello" }),
      }),
      { params: makeParams(VALID_UUID) },
    );

    expect(res.status).toBe(401);
  });

  it("returns 400 when content is empty", async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser } });
    mockLimit.mockResolvedValue([{ id: VALID_UUID }]);

    const res = await POST(
      makeRequest(`/api/tickets/${VALID_UUID}/messages`, {
        method: "POST",
        body: JSON.stringify({ content: "" }),
      }),
      { params: makeParams(VALID_UUID) },
    );

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Content is required");
  });

  it("returns 400 for invalid UUID", async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser } });

    const res = await POST(
      makeRequest(`/api/tickets/${INVALID_UUID}/messages`, {
        method: "POST",
        body: JSON.stringify({ content: "Hello" }),
      }),
      { params: makeParams(INVALID_UUID) },
    );

    expect(res.status).toBe(400);
  });

  it("returns 201 with message when resident sends", async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser } });

    const createdMessage = {
      id: "msg-new",
      content: "Hello",
      senderType: "resident",
      senderId: "user-1",
    };

    // Multiple limit/where calls: ticket check, staff check, user check, then notification ticket check
    let limitCall = 0;
    mockLimit.mockImplementation(() => {
      limitCall++;
      switch (limitCall) {
        case 1:
          return [{ id: VALID_UUID }]; // ticket exists
        case 2:
          return []; // not staff
        case 3:
          return [{ id: "user-1" }]; // user found
        case 4:
          return [{ userId: "user-1", assignedTo: "staff-1", ticketNumber: "TK-001" }]; // ticket for notification
        default:
          return [];
      }
    });
    mockReturning.mockResolvedValue([createdMessage]);

    const res = await POST(
      makeRequest(`/api/tickets/${VALID_UUID}/messages`, {
        method: "POST",
        body: JSON.stringify({ content: "Hello" }),
      }),
      { params: makeParams(VALID_UUID) },
    );

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toEqual(createdMessage);
  });

  it("returns 201 with staff senderType when staff sends", async () => {
    mockGetUser.mockResolvedValue({ data: { user: mockUser } });

    const createdMessage = {
      id: "msg-new",
      content: "Reply",
      senderType: "staff",
      senderId: "staff-1",
    };

    let limitCall = 0;
    mockLimit.mockImplementation(() => {
      limitCall++;
      switch (limitCall) {
        case 1:
          return [{ id: VALID_UUID }]; // ticket exists
        case 2:
          return [{ id: "staff-1" }]; // is staff
        case 3:
          return [{ userId: "user-1", assignedTo: null, ticketNumber: "TK-001" }]; // ticket for notification
        default:
          return [];
      }
    });
    mockReturning.mockResolvedValue([createdMessage]);

    const res = await POST(
      makeRequest(`/api/tickets/${VALID_UUID}/messages`, {
        method: "POST",
        body: JSON.stringify({ content: "Reply" }),
      }),
      { params: makeParams(VALID_UUID) },
    );

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.senderType).toBe("staff");
  });
});
