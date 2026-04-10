import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, upgradeRequestsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import * as jwt from "../lib/jwt.js";
import { hashPasswordBcrypt, verifyPassword, isLegacyHash } from "../lib/password.js";
import { authRateLimiter } from "../lib/rate-limiter.js";
import * as crypto from "crypto";

const ADMIN_SECRET = process.env.SESSION_SECRET!;

interface AdminTokenPayload {
  staffId: string;
  role: string;
  exp: number;
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

const router = Router();

function userToPublic(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    userType: user.userType,
    unitNumber: user.unitNumber ?? null,
    residentId: user.residentId ?? null,
    estateId: user.estateId ?? null,
    developmentName: user.developmentName ?? null,
    upgradeStatus: user.upgradeStatus,
    createdAt: user.createdAt.toISOString(),
  };
}

router.post("/register", authRateLimiter, async (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ error: "validation_error", message: "All fields are required" });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: "validation_error", message: "Password must be at least 8 characters" });
  }

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing.length > 0) {
    return res.status(400).json({ error: "email_taken", message: "Email already registered" });
  }

  const [user] = await db.insert(usersTable).values({
    name,
    email,
    phone,
    passwordHash: await hashPasswordBcrypt(password),
    userType: "guest",
    upgradeStatus: "none",
  }).returning();

  const token = jwt.sign({ userId: user.id, userType: user.userType });

  return res.status(201).json({ token, user: userToPublic(user) });
});

router.post("/login", authRateLimiter, async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "validation_error", message: "Email and password required" });
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!user) {
    return res.status(401).json({ error: "invalid_credentials", message: "Invalid email or password" });
  }

  const passwordValid = await verifyPassword(password, user.passwordHash);
  if (!passwordValid) {
    return res.status(401).json({ error: "invalid_credentials", message: "Invalid email or password" });
  }

  // Re-hash legacy SHA256 passwords to bcrypt on successful login (per D-01, D-03)
  if (isLegacyHash(user.passwordHash)) {
    const newHash = await hashPasswordBcrypt(password);
    await db.update(usersTable)
      .set({ passwordHash: newHash })
      .where(eq(usersTable.id, user.id));
  }

  const token = jwt.sign({ userId: user.id, userType: user.userType });

  return res.json({ token, user: userToPublic(user) });
});

router.get("/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "unauthorized", message: "No token provided" });
  }

  const token = authHeader.slice(7);
  const payload = jwt.verify(token);
  if (!payload) {
    return res.status(401).json({ error: "unauthorized", message: "Invalid token" });
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, payload.userId)).limit(1);
  if (!user) {
    return res.status(404).json({ error: "not_found", message: "User not found" });
  }

  return res.json(userToPublic(user));
});

router.post("/upgrade", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "unauthorized", message: "No token provided" });
  }

  const token = authHeader.slice(7);
  const payload = jwt.verify(token);
  if (!payload) {
    return res.status(401).json({ error: "unauthorized", message: "Invalid token" });
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, payload.userId)).limit(1);
  if (!user) {
    return res.status(404).json({ error: "not_found", message: "User not found" });
  }

  const { unitNumber, residentId, developmentName } = req.body;
  if (!unitNumber || !residentId || !developmentName) {
    return res.status(400).json({ error: "validation_error", message: "All fields required" });
  }

  await db.update(usersTable)
    .set({ upgradeStatus: "pending" })
    .where(eq(usersTable.id, user.id));

  const [request] = await db.insert(upgradeRequestsTable).values({
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    unitNumber,
    residentId,
    developmentName,
    status: "pending",
  }).returning();

  return res.json({
    id: request.id,
    userId: request.userId,
    userName: request.userName,
    userEmail: request.userEmail,
    unitNumber: request.unitNumber,
    residentId: request.residentId,
    developmentName: request.developmentName,
    status: request.status,
    submittedAt: request.submittedAt.toISOString(),
    reviewedAt: request.reviewedAt?.toISOString() ?? null,
    reviewNote: request.reviewNote ?? null,
  });
});

router.get("/upgrade-requests", async (req, res) => {
  const requests = await db.select().from(upgradeRequestsTable).orderBy(upgradeRequestsTable.submittedAt);
  return res.json(requests.map(r => ({
    id: r.id,
    userId: r.userId,
    userName: r.userName,
    userEmail: r.userEmail,
    unitNumber: r.unitNumber,
    residentId: r.residentId,
    developmentName: r.developmentName,
    status: r.status,
    submittedAt: r.submittedAt.toISOString(),
    reviewedAt: r.reviewedAt?.toISOString() ?? null,
    reviewNote: r.reviewNote ?? null,
  })));
});

router.post("/upgrade-requests/:id/approve", async (req, res) => {
  const { id } = req.params;
  const [request] = await db.select().from(upgradeRequestsTable).where(eq(upgradeRequestsTable.id, id)).limit(1);
  if (!request) {
    return res.status(404).json({ error: "not_found", message: "Request not found" });
  }

  const [updated] = await db.update(upgradeRequestsTable)
    .set({ status: "approved", reviewedAt: new Date() })
    .where(eq(upgradeRequestsTable.id, id))
    .returning();

  await db.update(usersTable)
    .set({
      userType: "resident",
      upgradeStatus: "approved",
      unitNumber: request.unitNumber,
      residentId: request.residentId,
      developmentName: request.developmentName,
    })
    .where(eq(usersTable.id, request.userId));

  return res.json({
    id: updated.id,
    userId: updated.userId,
    userName: updated.userName,
    userEmail: updated.userEmail,
    unitNumber: updated.unitNumber,
    residentId: updated.residentId,
    developmentName: updated.developmentName,
    status: updated.status,
    submittedAt: updated.submittedAt.toISOString(),
    reviewedAt: updated.reviewedAt?.toISOString() ?? null,
    reviewNote: updated.reviewNote ?? null,
  });
});

router.post("/upgrade-requests/:id/reject", async (req, res) => {
  const { id } = req.params;
  const [request] = await db.select().from(upgradeRequestsTable).where(eq(upgradeRequestsTable.id, id)).limit(1);
  if (!request) {
    return res.status(404).json({ error: "not_found", message: "Request not found" });
  }

  const [updated] = await db.update(upgradeRequestsTable)
    .set({ status: "rejected", reviewedAt: new Date() })
    .where(eq(upgradeRequestsTable.id, id))
    .returning();

  await db.update(usersTable)
    .set({ upgradeStatus: "rejected" })
    .where(eq(usersTable.id, request.userId));

  return res.json({
    id: updated.id,
    userId: updated.userId,
    userName: updated.userName,
    userEmail: updated.userEmail,
    unitNumber: updated.unitNumber,
    residentId: updated.residentId,
    developmentName: updated.developmentName,
    status: updated.status,
    submittedAt: updated.submittedAt.toISOString(),
    reviewedAt: updated.reviewedAt?.toISOString() ?? null,
    reviewNote: updated.reviewNote ?? null,
  });
});

export default router;
