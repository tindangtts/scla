import type { Request, Response, NextFunction } from "express";
import * as jwt from "./jwt.js";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import * as crypto from "crypto";

/**
 * Typed request with authenticated user attached by requireAuth middleware.
 * Import this in route files to avoid casting to `any`.
 */
export type AuthenticatedRequest = Request & {
  user: typeof usersTable.$inferSelect;
};

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "unauthorized", message: "Authentication required" });
  }

  const token = authHeader.slice(7);
  const payload = jwt.verify(token);
  if (!payload) {
    return res.status(401).json({ error: "unauthorized", message: "Invalid or expired token" });
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, payload.userId)).limit(1);
  if (!user) {
    return res.status(401).json({ error: "unauthorized", message: "User not found" });
  }

  (req as Request & { user: typeof user }).user = user;
  return next();
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const payload = jwt.verify(token);
    if (payload) {
      const [user] = await db.select().from(usersTable).where(eq(usersTable.id, payload.userId)).limit(1);
      if (user) {
        (req as Request & { user: typeof user }).user = user;
      }
    }
  }
  return next();
}

export interface AdminTokenPayload {
  staffId: string;
  role: string;
  exp: number;
}

const ADMIN_SECRET = process.env.SESSION_SECRET!;

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

export function requireAdmin(req: Request, res: Response): AdminTokenPayload | null {
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
