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
        where: vi.fn(() => ({
          returning: vi.fn().mockResolvedValue([]),
        })),
      })),
    })),
    execute: vi.fn().mockResolvedValue({ rows: [{ num: "0004" }] }),
  },
  usersTable: { id: "id", email: "email" },
  bookingsTable: { id: "id", userId: "userId", bookingNumber: "bookingNumber", date: "date", status: "status", recurringGroupId: "recurringGroupId" },
  facilitiesTable: { id: "id", name: "name" },
  eq: vi.fn((col: unknown, val: unknown) => ({ col, val })),
  and: vi.fn((...args: unknown[]) => args),
  gte: vi.fn((col: unknown, val: unknown) => ({ col, val })),
  desc: vi.fn((col: unknown) => col),
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

const MOCK_FACILITY = {
  id: "fac-1",
  name: "Tennis Court A",
  description: "Indoor tennis court",
  imageUrl: null,
  category: "tennis_court",
  memberRate: "8000",
  nonMemberRate: "15000",
  openingTime: "06:00",
  closingTime: "22:00",
  maxCapacity: 4,
  isAvailable: true,
};

const MOCK_BOOKING = {
  id: "booking-1",
  bookingNumber: "BK-0001",
  userId: SEED_IDS.residentUser,
  facilityId: "fac-1",
  facilityName: "Tennis Court A",
  facilityCategory: "tennis_court",
  date: "2026-05-01",
  startTime: "09:00",
  endTime: "10:00",
  totalAmount: "15000",
  status: "upcoming",
  paymentStatus: "pending",
  notes: null,
  recurringGroupId: null,
  createdAt: new Date("2026-04-11T09:00:00Z"),
};

const MOCK_CREATED_BOOKING = {
  id: "booking-4",
  bookingNumber: "BK-0004",
  userId: SEED_IDS.residentUser,
  facilityId: "fac-1",
  facilityName: "Tennis Court A",
  facilityCategory: "tennis_court",
  date: "2026-05-10",
  startTime: "10:00",
  endTime: "11:00",
  totalAmount: "15000",
  status: "upcoming",
  paymentStatus: "pending",
  notes: null,
  recurringGroupId: null,
  createdAt: new Date("2026-04-11T10:00:00Z"),
};

const MOCK_CANCELLED_BOOKING = {
  ...MOCK_BOOKING,
  status: "cancelled",
};

// ─── Helper: configure select mock for bookings ────────────────────────────────

/**
 * Sets up db.select to return:
 *   1st call → MOCK_RESIDENT_USER (auth middleware user lookup)
 *   2nd+ calls → bookingResult
 *
 * For booking creation, after user auth lookup:
 *   2nd call → facilityResult (facility lookup)
 * For booking create, insert mock is separate.
 */
function setupMocks(bookingResult: unknown[] = [MOCK_BOOKING]) {
  let callCount = 0;

  vi.mocked(db.select).mockImplementation(() => {
    callCount++;
    const isFirstCall = callCount === 1;
    const result = isFirstCall ? [MOCK_RESIDENT_USER] : bookingResult;

    // All query shapes in booking/facility routes:
    // - .from(t).where(eq(...)).orderBy(...) — list endpoint
    // - .from(t).where(eq(...)).limit(1)    — detail, facility lookup
    // - .from(t)                            — facilities list (no where)
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

/**
 * For booking creation: auth lookup returns user, facility lookup returns facility,
 * then no further selects.
 */
function setupMocksForCreate(facilityResult: unknown[] = [MOCK_FACILITY]) {
  let callCount = 0;

  vi.mocked(db.select).mockImplementation(() => {
    callCount++;
    let result: unknown[];
    if (callCount === 1) result = [MOCK_RESIDENT_USER];
    else result = facilityResult;

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

/**
 * For cancel: auth lookup returns user, booking lookup returns booking,
 * then update returns cancelled booking.
 */
function setupMocksForCancel(bookingResult: unknown[] = [MOCK_BOOKING]) {
  let callCount = 0;

  vi.mocked(db.select).mockImplementation(() => {
    callCount++;
    const result = callCount === 1 ? [MOCK_RESIDENT_USER] : bookingResult;

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

  // Setup update mock to return cancelled booking
  const mockReturning = vi.fn().mockResolvedValue([MOCK_CANCELLED_BOOKING]);
  const mockWhere = vi.fn(() => ({ returning: mockReturning }));
  const mockSet = vi.fn(() => ({ where: mockWhere }));
  vi.mocked(db.update).mockReturnValue({ set: mockSet } as unknown as ReturnType<typeof db.update>);
}

function setupInsertMock(result: unknown[]) {
  const mockReturning = vi.fn().mockResolvedValue(result);
  const mockValues = vi.fn(() => ({ returning: mockReturning }));
  vi.mocked(db.insert).mockReturnValue({ values: mockValues } as unknown as ReturnType<typeof db.insert>);
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("GET /api/bookings", () => {
  const residentToken = () => createTestToken(SEED_IDS.residentUser, "resident");

  beforeEach(() => {
    setupMocks([MOCK_BOOKING]);
  });

  it("returns 401 without auth token", async () => {
    const res = await request.get("/api/bookings");
    expect(res.status).toBe(401);
  });

  it("returns 200 with array of bookings for authenticated user", async () => {
    const token = residentToken();
    const res = await request.get("/api/bookings").set(authHeader(token));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("each booking has expected shape with numeric totalAmount", async () => {
    const token = residentToken();
    const res = await request.get("/api/bookings").set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    const booking = res.body[0];
    expect(booking).toMatchObject({
      id: expect.any(String),
      bookingNumber: expect.any(String),
      facilityId: expect.any(String),
      facilityName: expect.any(String),
      date: expect.any(String),
      startTime: expect.any(String),
      endTime: expect.any(String),
      status: expect.any(String),
      paymentStatus: expect.any(String),
      createdAt: expect.any(String),
    });
    // totalAmount must be a number (not string) per mapBooking
    expect(typeof booking.totalAmount).toBe("number");
    expect(booking).toHaveProperty("notes");
    expect(booking).toHaveProperty("recurringGroupId");
  });
});

describe("POST /api/bookings", () => {
  const residentToken = () => createTestToken(SEED_IDS.residentUser, "resident");

  beforeEach(() => {
    setupMocksForCreate([MOCK_FACILITY]);
    setupInsertMock([MOCK_CREATED_BOOKING]);
    vi.mocked(db.execute).mockResolvedValue({ rows: [{ num: "0004" }] } as any);
  });

  it("returns 401 without auth token", async () => {
    const res = await request.post("/api/bookings").send({
      facilityId: "fac-1",
      date: "2026-05-10",
      slotId: "fac-1-2026-05-10-10",
    });
    expect(res.status).toBe(401);
  });

  it("returns 400 when required fields are missing", async () => {
    const token = residentToken();
    const res = await request
      .post("/api/bookings")
      .set(authHeader(token))
      .send({ facilityId: "fac-1" }); // missing date and slotId
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("validation_error");
  });

  it("returns 400 when facilityId is missing", async () => {
    const token = residentToken();
    const res = await request
      .post("/api/bookings")
      .set(authHeader(token))
      .send({ date: "2026-05-10", slotId: "fac-1-2026-05-10-10" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("validation_error");
  });

  it("returns 404 when facility not found", async () => {
    setupMocksForCreate([]); // facility not found
    const token = residentToken();
    const res = await request
      .post("/api/bookings")
      .set(authHeader(token))
      .send({ facilityId: "nonexistent-fac", date: "2026-05-10", slotId: "nonexistent-fac-2026-05-10-10" });
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("not_found");
  });

  it("returns 201 with booking object on valid creation", async () => {
    const token = residentToken();
    const res = await request
      .post("/api/bookings")
      .set(authHeader(token))
      .send({ facilityId: "fac-1", date: "2026-05-10", slotId: "fac-1-2026-05-10-10" });
    expect(res.status).toBe(201);
    expect(res.body).toBeDefined();
  });

  it("response includes bookingNumber matching BK-XXXX pattern", async () => {
    const token = residentToken();
    const res = await request
      .post("/api/bookings")
      .set(authHeader(token))
      .send({ facilityId: "fac-1", date: "2026-05-10", slotId: "fac-1-2026-05-10-10" });
    expect(res.status).toBe(201);
    expect(res.body.bookingNumber).toMatch(/^BK-\d{4}$/);
  });

  it("response totalAmount is a number (not string)", async () => {
    const token = residentToken();
    const res = await request
      .post("/api/bookings")
      .set(authHeader(token))
      .send({ facilityId: "fac-1", date: "2026-05-10", slotId: "fac-1-2026-05-10-10" });
    expect(res.status).toBe(201);
    expect(typeof res.body.totalAmount).toBe("number");
  });
});

describe("GET /api/bookings/:id", () => {
  const residentToken = () => createTestToken(SEED_IDS.residentUser, "resident");

  it("returns 404 for non-existent booking", async () => {
    setupMocks([]); // no booking found
    const token = residentToken();
    const res = await request.get("/api/bookings/nonexistent-id").set(authHeader(token));
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("not_found");
  });

  it("returns 200 with booking detail for valid ID", async () => {
    setupMocks([MOCK_BOOKING]);
    const token = residentToken();
    const res = await request.get("/api/bookings/booking-1").set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.id).toBe("booking-1");
    expect(res.body.bookingNumber).toBe("BK-0001");
    expect(typeof res.body.totalAmount).toBe("number");
  });
});

describe("POST /api/bookings/:id/cancel", () => {
  const residentToken = () => createTestToken(SEED_IDS.residentUser, "resident");

  it("returns 404 for non-existent booking", async () => {
    setupMocksForCancel([]); // no booking found
    // Override update mock to be neutral (not called if 404 returned first)
    const token = residentToken();
    const res = await request.post("/api/bookings/nonexistent-id/cancel").set(authHeader(token));
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("not_found");
  });

  it("returns 200 with booking status updated to cancelled", async () => {
    setupMocksForCancel([MOCK_BOOKING]);
    const token = residentToken();
    const res = await request.post("/api/bookings/booking-1/cancel").set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("cancelled");
  });

  it("response booking.status equals cancelled", async () => {
    setupMocksForCancel([MOCK_BOOKING]);
    const token = residentToken();
    const res = await request.post("/api/bookings/booking-1/cancel").set(authHeader(token));
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: expect.any(String),
      bookingNumber: expect.any(String),
      status: "cancelled",
    });
  });
});

function setupFacilitiesMock(facilities: unknown[] = [MOCK_FACILITY]) {
  // The facilities list endpoint does: db.select().from(facilitiesTable)
  // which resolves as a thenable directly (no .where() call).
  // The slots endpoint does: db.select().from(facilitiesTable).where(...).limit(1)
  const mockLimit = vi.fn().mockResolvedValue(facilities);
  const mockWhere = vi.fn(() => {
    const whereResult: any = Promise.resolve(facilities);
    whereResult.limit = mockLimit;
    return whereResult;
  });
  // from() returns a thenable that also has .where() for slots lookups
  const mockFrom = vi.fn(() => {
    const fromResult: any = Promise.resolve(facilities);
    fromResult.where = mockWhere;
    return fromResult;
  });
  vi.mocked(db.select).mockReturnValue({ from: mockFrom } as unknown as ReturnType<typeof db.select>);
}

describe("GET /api/facilities", () => {
  it("returns 200 with array of facilities (no auth required)", async () => {
    setupFacilitiesMock([MOCK_FACILITY]);

    const res = await request.get("/api/facilities");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("each facility has expected shape with numeric rates", async () => {
    setupFacilitiesMock([MOCK_FACILITY]);

    const res = await request.get("/api/facilities");
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    const facility = res.body[0];
    expect(facility).toMatchObject({
      id: expect.any(String),
      name: expect.any(String),
      category: expect.any(String),
      openingTime: expect.any(String),
      closingTime: expect.any(String),
      maxCapacity: expect.any(Number),
      isAvailable: expect.any(Boolean),
    });
    // memberRate and nonMemberRate must be numbers per mapFacility
    expect(typeof facility.memberRate).toBe("number");
    expect(typeof facility.nonMemberRate).toBe("number");
    expect(facility).toHaveProperty("description");
  });
});

describe("GET /api/facilities/:id/slots", () => {
  it("returns 400 when date query param is missing", async () => {
    // The slots route checks date AFTER finding the facility, so facility must be found first.
    // Facility lookup: db.select().from(facilitiesTable).where(eq(...)).limit(1)
    setupFacilitiesMock([MOCK_FACILITY]);

    const res = await request.get("/api/facilities/fac-1/slots");
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("validation_error");
  });

  it("returns 404 when facility not found", async () => {
    setupFacilitiesMock([]); // no facility

    const res = await request.get("/api/facilities/nonexistent/slots?date=2026-05-10");
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("not_found");
  });

  it("returns 200 with array of time slots for valid facility and date", async () => {
    setupFacilitiesMock([MOCK_FACILITY]);

    const res = await request.get("/api/facilities/fac-1/slots?date=2026-05-10");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("each slot has shape with startTime, endTime, isAvailable, and price", async () => {
    setupFacilitiesMock([MOCK_FACILITY]);

    const res = await request.get("/api/facilities/fac-1/slots?date=2026-05-10");
    expect(res.status).toBe(200);
    const slot = res.body[0];
    expect(slot).toMatchObject({
      id: expect.any(String),
      startTime: expect.any(String),
      endTime: expect.any(String),
      isAvailable: expect.any(Boolean),
      price: expect.any(Number),
    });
  });
});
