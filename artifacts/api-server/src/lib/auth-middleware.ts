import type { Request, Response, NextFunction } from "express";
import * as jwt from "./jwt.js";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

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
