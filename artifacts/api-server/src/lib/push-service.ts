import webpush from "web-push";
import { db } from "@workspace/db";
import { pushSubscriptionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger.js";

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT ?? "mailto:admin@starcity.com.mm";

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

/**
 * Send a push notification to all subscriptions for a given userId.
 * Invalid/expired subscriptions (410 Gone) are automatically removed from the DB.
 * This function is intentionally non-throwing — failed pushes are logged but never
 * bubble up to callers, so ticket/invoice update endpoints do not fail if push delivery fails.
 */
export async function sendPushToUser(userId: string, payload: PushPayload): Promise<void> {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    logger.warn("VAPID keys not configured — push notification skipped");
    return;
  }

  const subscriptions = await db
    .select()
    .from(pushSubscriptionsTable)
    .where(eq(pushSubscriptionsTable.userId, userId));

  const results = await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(payload)
        );
      } catch (err: any) {
        // 410 = subscription expired/unsubscribed — remove from DB
        if (err?.statusCode === 410) {
          await db
            .delete(pushSubscriptionsTable)
            .where(eq(pushSubscriptionsTable.endpoint, sub.endpoint));
          logger.info({ endpoint: sub.endpoint }, "Removed expired push subscription");
        } else {
          throw err;
        }
      }
    })
  );

  const failed = results.filter(r => r.status === "rejected");
  if (failed.length > 0) {
    logger.error({ failed }, "Some push notifications failed to deliver");
  }
}

/** Utility: returns a new VAPID key pair for first-time setup. Call once, store keys in env. */
export function generateVapidKeys(): { publicKey: string; privateKey: string } {
  return webpush.generateVAPIDKeys();
}
