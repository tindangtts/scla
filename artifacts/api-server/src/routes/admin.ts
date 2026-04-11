import { Router } from "express";
import { db } from "@workspace/db";
import {
  staffUsersTable, usersTable, upgradeRequestsTable, announcementsTable,
  promotionsTable, ticketsTable, facilitiesTable, bookingsTable, faqsTable,
  auditLogsTable
} from "@workspace/db";
import { eq, desc, asc, count, and, gte, lte, like, or, sql } from "drizzle-orm";
import * as jwt from "../lib/jwt.js";
import * as crypto from "crypto";
import { auditLog } from "../lib/audit-middleware.js";

const router = Router();

const ADMIN_SECRET = process.env.SESSION_SECRET ?? "scla-dev-secret-2026";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "scla-salt").digest("hex");
}

interface AdminTokenPayload {
  staffId: string;
  role: string;
  exp: number;
}

function signAdmin(payload: Omit<AdminTokenPayload, "exp">): string {
  const fullPayload: AdminTokenPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
  };
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT", ctx: "admin" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");
  const sig = crypto.createHmac("sha256", ADMIN_SECRET).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${sig}`;
}

function verifyAdmin(token: string): AdminTokenPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, body, sig] = parts;
    const headerData = JSON.parse(Buffer.from(header, "base64url").toString());
    if (headerData.ctx !== "admin") return null;
    const expectedSig = crypto.createHmac("sha256", ADMIN_SECRET).update(`${header}.${body}`).digest("base64url");
    if (sig !== expectedSig) return null;
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as AdminTokenPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

function requireAdmin(req: any, res: any): AdminTokenPayload | null {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "unauthorized" });
    return null;
  }
  const payload = verifyAdmin(authHeader.slice(7));
  if (!payload) {
    res.status(401).json({ error: "unauthorized" });
    return null;
  }
  return payload;
}

async function getStaffEmail(staffId: string): Promise<string> {
  const [s] = await db.select({ email: staffUsersTable.email }).from(staffUsersTable).where(eq(staffUsersTable.id, staffId)).limit(1);
  return s?.email ?? "unknown";
}

// POST /api/admin/auth/login
router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "email and password required" });

  const [staff] = await db.select().from(staffUsersTable).where(eq(staffUsersTable.email, email)).limit(1);
  if (!staff || !staff.isActive) return res.status(401).json({ error: "invalid_credentials" });
  if (staff.passwordHash !== hashPassword(password)) return res.status(401).json({ error: "invalid_credentials" });

  const token = signAdmin({ staffId: staff.id, role: staff.role });
  return res.json({
    token,
    staff: { id: staff.id, name: staff.name, email: staff.email, role: staff.role },
  });
});

// GET /api/admin/auth/me
router.get("/auth/me", async (req, res) => {
  const payload = requireAdmin(req, res);
  if (!payload) return;
  const [staff] = await db.select().from(staffUsersTable).where(eq(staffUsersTable.id, payload.staffId)).limit(1);
  if (!staff) return res.status(404).json({ error: "not_found" });
  return res.json({ id: staff.id, name: staff.name, email: staff.email, role: staff.role });
});

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

router.get("/dashboard", async (req, res) => {
  const payload = requireAdmin(req, res);
  if (!payload) return;

  const [openTickets] = await db.select({ val: count() }).from(ticketsTable)
    .where(eq(ticketsTable.status, "open"));
  const [inProgressTickets] = await db.select({ val: count() }).from(ticketsTable)
    .where(eq(ticketsTable.status, "in_progress"));
  const [pendingVerifications] = await db.select({ val: count() }).from(upgradeRequestsTable)
    .where(eq(upgradeRequestsTable.status, "pending"));
  const [totalUsers] = await db.select({ val: count() }).from(usersTable);
  const [residentCount] = await db.select({ val: count() }).from(usersTable)
    .where(eq(usersTable.userType, "resident"));
  const [guestCount] = await db.select({ val: count() }).from(usersTable)
    .where(eq(usersTable.userType, "guest"));

  const today = new Date().toISOString().slice(0, 10);
  const [todayBookings] = await db.select({ val: count() }).from(bookingsTable)
    .where(eq(bookingsTable.date, today));

  const recentUsers = await db.select({
    id: usersTable.id,
    name: usersTable.name,
    email: usersTable.email,
    userType: usersTable.userType,
    createdAt: usersTable.createdAt,
  }).from(usersTable).orderBy(desc(usersTable.createdAt)).limit(5);

  const recentTickets = await db.select().from(ticketsTable)
    .orderBy(desc(ticketsTable.createdAt)).limit(5);

  return res.json({
    openTickets: openTickets.val,
    inProgressTickets: inProgressTickets.val,
    pendingVerifications: pendingVerifications.val,
    totalUsers: totalUsers.val,
    residentCount: residentCount.val,
    guestCount: guestCount.val,
    todayBookings: todayBookings.val,
    recentUsers,
    recentTickets: recentTickets.map(t => ({
      id: t.id, ticketNumber: t.ticketNumber, title: t.title,
      status: t.status, category: t.category, createdAt: t.createdAt,
    })),
  });
});

// ─── USER MANAGEMENT ─────────────────────────────────────────────────────────

router.get("/users", async (req, res) => {
  const payload = requireAdmin(req, res);
  if (!payload) return;

  const { search, userType, page = "1", limit = "20" } = req.query as Record<string, string>;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let users = await db.select().from(usersTable)
    .orderBy(desc(usersTable.createdAt))
    .limit(parseInt(limit))
    .offset(offset);

  if (search) {
    users = users.filter(u =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone && u.phone.includes(search))
    );
  }
  if (userType) users = users.filter(u => u.userType === userType);

  const [{ total }] = await db.select({ total: count() }).from(usersTable);

  return res.json({
    users: users.map(u => ({
      id: u.id, name: u.name, email: u.email, phone: u.phone,
      userType: u.userType, unitNumber: u.unitNumber, developmentName: u.developmentName,
      upgradeStatus: u.upgradeStatus, createdAt: u.createdAt,
    })),
    total,
    page: parseInt(page),
    limit: parseInt(limit),
  });
});

router.get("/users/:id", async (req, res) => {
  const payload = requireAdmin(req, res);
  if (!payload) return;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.params.id)).limit(1);
  if (!user) return res.status(404).json({ error: "not_found" });

  const tickets = await db.select().from(ticketsTable)
    .where(eq(ticketsTable.userId, user.id)).orderBy(desc(ticketsTable.createdAt)).limit(10);
  const bookings = await db.select().from(bookingsTable)
    .where(eq(bookingsTable.userId, user.id)).orderBy(desc(bookingsTable.createdAt)).limit(10);

  return res.json({
    id: user.id, name: user.name, email: user.email, phone: user.phone,
    userType: user.userType, unitNumber: user.unitNumber, developmentName: user.developmentName,
    upgradeStatus: user.upgradeStatus, residentId: user.residentId, createdAt: user.createdAt,
    tickets: tickets.map(t => ({ id: t.id, ticketNumber: t.ticketNumber, title: t.title, status: t.status, createdAt: t.createdAt })),
    bookings: bookings.map(b => ({ id: b.id, bookingNumber: b.bookingNumber, facilityName: b.facilityName, date: b.date, status: b.status })),
  });
});

router.patch("/users/:id", async (req, res) => {
  const payload = requireAdmin(req, res);
  if (!payload) return;
  const { userType, upgradeStatus, isActive } = req.body;

  const updates: Record<string, any> = { updatedAt: new Date() };
  if (userType) updates.userType = userType;
  if (upgradeStatus) updates.upgradeStatus = upgradeStatus;

  const [updated] = await db.update(usersTable).set(updates)
    .where(eq(usersTable.id, req.params.id)).returning();
  if (!updated) return res.status(404).json({ error: "not_found" });
  return res.json({ id: updated.id, name: updated.name, userType: updated.userType, upgradeStatus: updated.upgradeStatus });
});

// ─── UPGRADE REQUESTS ─────────────────────────────────────────────────────────

router.get("/upgrade-requests", async (req, res) => {
  const payload = requireAdmin(req, res);
  if (!payload) return;
  const { status } = req.query as { status?: string };

  let requests = await db.select().from(upgradeRequestsTable)
    .orderBy(desc(upgradeRequestsTable.submittedAt));
  if (status) requests = requests.filter(r => r.status === status);

  return res.json(requests);
});

router.patch("/upgrade-requests/:id", async (req, res) => {
  const payload = requireAdmin(req, res);
  if (!payload) return;
  const { action, reviewNote } = req.body;
  if (!["approve", "reject"].includes(action)) return res.status(400).json({ error: "action must be approve or reject" });

  const [request] = await db.select().from(upgradeRequestsTable)
    .where(eq(upgradeRequestsTable.id, req.params.id)).limit(1);
  if (!request) return res.status(404).json({ error: "not_found" });
  if (request.status !== "pending") return res.status(400).json({ error: "request already reviewed" });

  const newStatus = action === "approve" ? "approved" : "rejected";
  const [updated] = await db.update(upgradeRequestsTable)
    .set({ status: newStatus, reviewedAt: new Date(), reviewNote: reviewNote ?? null })
    .where(eq(upgradeRequestsTable.id, req.params.id)).returning();

  if (action === "approve") {
    await db.update(usersTable)
      .set({
        userType: "resident",
        upgradeStatus: "approved",
        unitNumber: request.unitNumber,
        residentId: request.residentId,
        developmentName: request.developmentName,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, request.userId));
  } else {
    await db.update(usersTable)
      .set({ upgradeStatus: "rejected", updatedAt: new Date() })
      .where(eq(usersTable.id, request.userId));
  }

  const staffEmail = await getStaffEmail(payload.staffId);
  await auditLog({
    actorId: payload.staffId,
    actorEmail: staffEmail,
    action: newStatus === "approved" ? "upgrade_approve" : "upgrade_reject",
    targetType: "user",
    targetId: request.userId,
    metadata: { requestId: req.params.id, reviewNote },
  });

  return res.json(updated);
});

// ─── CONTENT MANAGEMENT ───────────────────────────────────────────────────────

router.get("/content/announcements", async (req, res) => {
  const payload = requireAdmin(req, res);
  if (!payload) return;
  const rows = await db.select().from(announcementsTable).orderBy(desc(announcementsTable.createdAt));
  return res.json(rows);
});

router.post("/content/announcements", async (req, res) => {
  const payload = requireAdmin(req, res);
  if (!payload) return;
  const { title, content, summary, type, imageUrl, isPinned, isDraft, targetAudience, tags, publishedAt } = req.body;
  if (!title || !content || !summary) return res.status(400).json({ error: "title, content, summary required" });

  const [row] = await db.insert(announcementsTable).values({
    title, content, summary,
    type: type ?? "announcement",
    imageUrl: imageUrl ?? null,
    isPinned: isPinned ?? false,
    isDraft: isDraft ?? false,
    targetAudience: targetAudience ?? "all",
    tags: tags ?? [],
    publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
  }).returning();
  return res.status(201).json(row);
});

router.patch("/content/announcements/:id", async (req, res) => {
  const payload = requireAdmin(req, res);
  if (!payload) return;
  const { title, content, summary, type, imageUrl, isPinned, isDraft, targetAudience, tags, publishedAt } = req.body;

  const updates: Record<string, any> = {};
  if (title !== undefined) updates.title = title;
  if (content !== undefined) updates.content = content;
  if (summary !== undefined) updates.summary = summary;
  if (type !== undefined) updates.type = type;
  if (imageUrl !== undefined) updates.imageUrl = imageUrl;
  if (isPinned !== undefined) updates.isPinned = isPinned;
  if (isDraft !== undefined) updates.isDraft = isDraft;
  if (targetAudience !== undefined) updates.targetAudience = targetAudience;
  if (tags !== undefined) updates.tags = tags;
  if (publishedAt !== undefined) updates.publishedAt = new Date(publishedAt);

  const [updated] = await db.update(announcementsTable).set(updates)
    .where(eq(announcementsTable.id, req.params.id)).returning();
  if (!updated) return res.status(404).json({ error: "not_found" });
  return res.json(updated);
});

router.delete("/content/announcements/:id", async (req, res) => {
  const payload = requireAdmin(req, res);
  if (!payload) return;
  await db.delete(announcementsTable).where(eq(announcementsTable.id, req.params.id));
  return res.json({ success: true });
});

router.get("/content/promotions", async (req, res) => {
  const payload = requireAdmin(req, res);
  if (!payload) return;
  const rows = await db.select().from(promotionsTable).orderBy(desc(promotionsTable.createdAt));
  return res.json(rows);
});

router.post("/content/promotions", async (req, res) => {
  const payload = requireAdmin(req, res);
  if (!payload) return;
  const { title, description, category, imageUrl, validFrom, validUntil, isActive, partnerName } = req.body;
  if (!title || !description || !category || !partnerName) {
    return res.status(400).json({ error: "title, description, category, partnerName required" });
  }
  const [row] = await db.insert(promotionsTable).values({
    title, description, category, imageUrl: imageUrl ?? null,
    validFrom: validFrom ? new Date(validFrom) : new Date(),
    validUntil: validUntil ? new Date(validUntil) : null,
    isActive: isActive ?? true,
    partnerName,
  }).returning();
  return res.status(201).json(row);
});

router.patch("/content/promotions/:id", async (req, res) => {
  const payload = requireAdmin(req, res);
  if (!payload) return;
  const { title, description, category, imageUrl, validFrom, validUntil, isActive, partnerName } = req.body;
  const updates: Record<string, any> = {};
  if (title !== undefined) updates.title = title;
  if (description !== undefined) updates.description = description;
  if (category !== undefined) updates.category = category;
  if (imageUrl !== undefined) updates.imageUrl = imageUrl;
  if (isActive !== undefined) updates.isActive = isActive;
  if (partnerName !== undefined) updates.partnerName = partnerName;
  if (validFrom !== undefined) updates.validFrom = new Date(validFrom);
  if (validUntil !== undefined) updates.validUntil = new Date(validUntil);

  const [updated] = await db.update(promotionsTable).set(updates)
    .where(eq(promotionsTable.id, req.params.id)).returning();
  if (!updated) return res.status(404).json({ error: "not_found" });
  return res.json(updated);
});

router.delete("/content/promotions/:id", async (req, res) => {
  const payload = requireAdmin(req, res);
  if (!payload) return;
  await db.delete(promotionsTable).where(eq(promotionsTable.id, req.params.id));
  return res.json({ success: true });
});

// ─── TICKET MANAGEMENT ────────────────────────────────────────────────────────

router.get("/tickets", async (req, res) => {
  const payload = requireAdmin(req, res);
  if (!payload) return;
  const { status, category, search } = req.query as Record<string, string>;

  let tickets = await db.select().from(ticketsTable).orderBy(desc(ticketsTable.createdAt));
  if (status) tickets = tickets.filter(t => t.status === status);
  if (category) tickets = tickets.filter(t => t.category === category);
  if (search) tickets = tickets.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
    (t.unitNumber && t.unitNumber.toLowerCase().includes(search.toLowerCase()))
  );

  const userIds = [...new Set(tickets.map(t => t.userId))];
  let userMap: Record<string, { name: string; email: string }> = {};
  if (userIds.length > 0) {
    const users = await db.select({ id: usersTable.id, name: usersTable.name, email: usersTable.email })
      .from(usersTable);
    userMap = Object.fromEntries(users.map(u => [u.id, { name: u.name, email: u.email }]));
  }

  return res.json(tickets.map(t => ({
    ...t,
    user: userMap[t.userId] ?? { name: "Unknown", email: "" },
  })));
});

router.patch("/tickets/:id", async (req, res) => {
  const payload = requireAdmin(req, res);
  if (!payload) return;
  const { status, assignedTo, staffResponse } = req.body;

  const [existing] = await db.select().from(ticketsTable).where(eq(ticketsTable.id, req.params.id)).limit(1);
  if (!existing) return res.status(404).json({ error: "not_found" });

  const updates: Record<string, any> = { updatedAt: new Date() };
  if (status) updates.status = status;
  if (assignedTo !== undefined) updates.assignedTo = assignedTo;

  if (staffResponse) {
    const newUpdate = {
      id: crypto.randomUUID(),
      message: staffResponse,
      author: "StarCity Support",
      authorType: "staff" as const,
      createdAt: new Date().toISOString(),
    };
    updates.updates = [...(existing.updates ?? []), newUpdate];
  }

  const [updated] = await db.update(ticketsTable).set(updates)
    .where(eq(ticketsTable.id, req.params.id)).returning();
  return res.json(updated);
});

// ─── FACILITIES & BOOKINGS ────────────────────────────────────────────────────

router.get("/facilities", async (req, res) => {
  const payload = requireAdmin(req, res);
  if (!payload) return;
  const rows = await db.select().from(facilitiesTable).orderBy(asc(facilitiesTable.name));
  return res.json(rows);
});

router.post("/facilities", async (req, res) => {
  const payload = requireAdmin(req, res);
  if (!payload) return;
  const { name, description, imageUrl, category, memberRate, nonMemberRate, openingTime, closingTime, maxCapacity } = req.body;
  if (!name || !description || !category || !memberRate || !nonMemberRate || !openingTime || !closingTime || !maxCapacity) {
    return res.status(400).json({ error: "all fields required" });
  }
  const [row] = await db.insert(facilitiesTable).values({
    name, description, imageUrl: imageUrl ?? null, category,
    memberRate: String(memberRate), nonMemberRate: String(nonMemberRate),
    openingTime, closingTime, maxCapacity: parseInt(maxCapacity), isAvailable: true,
  }).returning();
  return res.status(201).json(row);
});

router.patch("/facilities/:id", async (req, res) => {
  const payload = requireAdmin(req, res);
  if (!payload) return;
  const { name, description, imageUrl, memberRate, nonMemberRate, openingTime, closingTime, maxCapacity, isAvailable } = req.body;
  const updates: Record<string, any> = {};
  if (name !== undefined) updates.name = name;
  if (description !== undefined) updates.description = description;
  if (imageUrl !== undefined) updates.imageUrl = imageUrl;
  if (memberRate !== undefined) updates.memberRate = String(memberRate);
  if (nonMemberRate !== undefined) updates.nonMemberRate = String(nonMemberRate);
  if (openingTime !== undefined) updates.openingTime = openingTime;
  if (closingTime !== undefined) updates.closingTime = closingTime;
  if (maxCapacity !== undefined) updates.maxCapacity = parseInt(maxCapacity);
  if (isAvailable !== undefined) updates.isAvailable = isAvailable;

  const [updated] = await db.update(facilitiesTable).set(updates)
    .where(eq(facilitiesTable.id, req.params.id)).returning();
  if (!updated) return res.status(404).json({ error: "not_found" });
  return res.json(updated);
});

router.delete("/facilities/:id", async (req, res) => {
  const payload = requireAdmin(req, res);
  if (!payload) return;
  await db.delete(facilitiesTable).where(eq(facilitiesTable.id, req.params.id));
  return res.json({ success: true });
});

router.get("/bookings", async (req, res) => {
  const payload = requireAdmin(req, res);
  if (!payload) return;
  const { status, facilityId, date } = req.query as Record<string, string>;

  let bookings = await db.select().from(bookingsTable).orderBy(desc(bookingsTable.createdAt));
  if (status) bookings = bookings.filter(b => b.status === status);
  if (facilityId) bookings = bookings.filter(b => b.facilityId === facilityId);
  if (date) bookings = bookings.filter(b => b.date === date);

  const userIds = [...new Set(bookings.map(b => b.userId))];
  let userMap: Record<string, { name: string; email: string }> = {};
  if (userIds.length > 0) {
    const users = await db.select({ id: usersTable.id, name: usersTable.name, email: usersTable.email }).from(usersTable);
    userMap = Object.fromEntries(users.map(u => [u.id, { name: u.name, email: u.email }]));
  }

  return res.json(bookings.map(b => ({
    ...b,
    user: userMap[b.userId] ?? { name: "Unknown", email: "" },
  })));
});

router.patch("/bookings/:id/cancel", async (req, res) => {
  const payload = requireAdmin(req, res);
  if (!payload) return;
  const [updated] = await db.update(bookingsTable)
    .set({ status: "cancelled" })
    .where(eq(bookingsTable.id, req.params.id)).returning();
  if (!updated) return res.status(404).json({ error: "not_found" });

  const staffEmail = await getStaffEmail(payload.staffId);
  await auditLog({
    actorId: payload.staffId,
    actorEmail: staffEmail,
    action: "booking_cancel",
    targetType: "booking",
    targetId: req.params.id,
    metadata: { bookingNumber: updated.bookingNumber },
  });

  return res.json(updated);
});

// ─── FAQ MANAGEMENT ───────────────────────────────────────────────────────────

router.get("/faqs", async (req, res) => {
  const payload = requireAdmin(req, res);
  if (!payload) return;
  const rows = await db.select().from(faqsTable).orderBy(asc(faqsTable.sortOrder), asc(faqsTable.createdAt));
  return res.json(rows);
});

router.post("/faqs", async (req, res) => {
  const payload = requireAdmin(req, res);
  if (!payload) return;
  const { question, answer, category, isPublished, sortOrder } = req.body;
  if (!question || !answer) return res.status(400).json({ error: "question and answer required" });
  const [row] = await db.insert(faqsTable).values({
    question, answer, category: category ?? "General",
    isPublished: isPublished ?? true, sortOrder: sortOrder ?? 0,
  }).returning();
  return res.status(201).json(row);
});

router.patch("/faqs/:id", async (req, res) => {
  const payload = requireAdmin(req, res);
  if (!payload) return;
  const { question, answer, category, isPublished, sortOrder } = req.body;
  const updates: Record<string, any> = { updatedAt: new Date() };
  if (question !== undefined) updates.question = question;
  if (answer !== undefined) updates.answer = answer;
  if (category !== undefined) updates.category = category;
  if (isPublished !== undefined) updates.isPublished = isPublished;
  if (sortOrder !== undefined) updates.sortOrder = sortOrder;

  const [updated] = await db.update(faqsTable).set(updates)
    .where(eq(faqsTable.id, req.params.id)).returning();
  if (!updated) return res.status(404).json({ error: "not_found" });
  return res.json(updated);
});

router.delete("/faqs/:id", async (req, res) => {
  const payload = requireAdmin(req, res);
  if (!payload) return;
  await db.delete(faqsTable).where(eq(faqsTable.id, req.params.id));
  return res.json({ success: true });
});

// ─── STAFF USERS ──────────────────────────────────────────────────────────────

router.get("/staff", async (req, res) => {
  const payload = requireAdmin(req, res);
  if (!payload) return;
  if (payload.role !== "admin") return res.status(403).json({ error: "admin only" });
  const rows = await db.select({
    id: staffUsersTable.id, name: staffUsersTable.name, email: staffUsersTable.email,
    role: staffUsersTable.role, isActive: staffUsersTable.isActive, createdAt: staffUsersTable.createdAt,
  }).from(staffUsersTable).orderBy(asc(staffUsersTable.name));
  return res.json(rows);
});

router.post("/staff", async (req, res) => {
  const payload = requireAdmin(req, res);
  if (!payload) return;
  if (payload.role !== "admin") return res.status(403).json({ error: "admin only" });
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) return res.status(400).json({ error: "all fields required" });
  const [row] = await db.insert(staffUsersTable).values({
    name, email, passwordHash: hashPassword(password), role, isActive: true,
  }).returning({ id: staffUsersTable.id, name: staffUsersTable.name, email: staffUsersTable.email, role: staffUsersTable.role });

  const staffEmail = await getStaffEmail(payload.staffId);
  await auditLog({
    actorId: payload.staffId,
    actorEmail: staffEmail,
    action: "staff_create",
    targetType: "staff",
    targetId: row.id,
    metadata: { role: row.role, email: row.email },
  });

  return res.status(201).json(row);
});

router.patch("/staff/:id", async (req, res) => {
  const payload = requireAdmin(req, res);
  if (!payload) return;
  if (payload.role !== "admin") return res.status(403).json({ error: "admin only" });
  const { name, role, isActive } = req.body;
  const updates: Record<string, any> = { updatedAt: new Date() };
  if (name !== undefined) updates.name = name;
  if (role !== undefined) updates.role = role;
  if (isActive !== undefined) updates.isActive = isActive;
  const [updated] = await db.update(staffUsersTable).set(updates)
    .where(eq(staffUsersTable.id, req.params.id)).returning({
      id: staffUsersTable.id, name: staffUsersTable.name, email: staffUsersTable.email,
      role: staffUsersTable.role, isActive: staffUsersTable.isActive,
    });
  if (!updated) return res.status(404).json({ error: "not_found" });

  const staffEmail = await getStaffEmail(payload.staffId);
  await auditLog({
    actorId: payload.staffId,
    actorEmail: staffEmail,
    action: isActive === false ? "staff_deactivate" : "staff_update",
    targetType: "staff",
    targetId: req.params.id,
    metadata: { changes: req.body },
  });

  return res.json(updated);
});

// ─── AUDIT LOGS ───────────────────────────────────────────────────────────────

router.get("/audit-logs", async (req, res) => {
  const payload = requireAdmin(req, res);
  if (!payload) return;

  const { action, actorId, from, to, page = "1", limit = "50" } = req.query as Record<string, string>;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const offset = (pageNum - 1) * limitNum;

  const conditions: any[] = [];
  if (action) conditions.push(eq(auditLogsTable.action, action as typeof auditLogsTable.$inferInsert["action"]));
  if (actorId) conditions.push(eq(auditLogsTable.actorId, actorId));
  if (from) conditions.push(gte(auditLogsTable.createdAt, new Date(from)));
  if (to) conditions.push(lte(auditLogsTable.createdAt, new Date(to)));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const logs = await db.select()
    .from(auditLogsTable)
    .where(whereClause)
    .orderBy(desc(auditLogsTable.createdAt))
    .limit(limitNum)
    .offset(offset);

  const [{ total }] = await db.select({ total: count() })
    .from(auditLogsTable)
    .where(whereClause);

  return res.json({ logs, total, page: pageNum, limit: limitNum });
});

export default router;
