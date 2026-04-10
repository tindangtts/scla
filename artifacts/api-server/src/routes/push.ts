import { Router } from "express";
import type { Request, Response } from "express";
import { db } from "@workspace/db";
import { pushSubscriptionsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, type AuthenticatedRequest } from "../lib/auth-middleware.js";

const router = Router();

// GET /api/push/vapid-public-key — returns VAPID public key for client-side subscription
router.get("/vapid-public-key", (_req: Request, res: Response) => {
  const key = process.env.VAPID_PUBLIC_KEY;
  if (!key) {
    return res.status(503).json({ error: "service_unavailable", message: "Push notifications not configured" });
  }
  return res.json({ publicKey: key });
});

// POST /api/push/subscribe — save a push subscription for the authenticated user
// Body: { endpoint: string, keys: { p256dh: string, auth: string } }
router.post("/subscribe", requireAuth, async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  const { endpoint, keys } = req.body as { endpoint: string; keys: { p256dh: string; auth: string } };

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return res.status(400).json({ error: "validation_error", message: "endpoint and keys (p256dh, auth) are required" });
  }

  // Upsert: if endpoint already exists for this user, do nothing (idempotent)
  const existing = await db
    .select()
    .from(pushSubscriptionsTable)
    .where(and(eq(pushSubscriptionsTable.userId, user.id), eq(pushSubscriptionsTable.endpoint, endpoint)))
    .limit(1);

  if (existing.length === 0) {
    await db.insert(pushSubscriptionsTable).values({
      userId: user.id,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
    });
  }

  return res.status(201).json({ ok: true });
});

// POST /api/push/unsubscribe — remove a push subscription
// Body: { endpoint: string }
router.post("/unsubscribe", requireAuth, async (req: Request, res: Response) => {
  const { user } = req as AuthenticatedRequest;
  const { endpoint } = req.body as { endpoint: string };

  if (!endpoint) {
    return res.status(400).json({ error: "validation_error", message: "endpoint is required" });
  }

  await db
    .delete(pushSubscriptionsTable)
    .where(and(eq(pushSubscriptionsTable.userId, user.id), eq(pushSubscriptionsTable.endpoint, endpoint)));

  return res.json({ ok: true });
});

export default router;
