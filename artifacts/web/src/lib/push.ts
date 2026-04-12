import webpush from "web-push";
import { db } from "@/lib/db";
import { pushSubscriptionsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    "mailto:noreply@starcityliving.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY,
  );
}

export async function sendPushToUser(
  userId: string,
  payload: { title: string; body: string; url: string },
) {
  if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    console.warn("[push] VAPID keys not configured, skipping push notification");
    return;
  }

  const subscriptions = await db
    .select()
    .from(pushSubscriptionsTable)
    .where(eq(pushSubscriptionsTable.userId, userId));

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        },
        JSON.stringify(payload),
      );
    } catch (err: unknown) {
      const statusCode =
        err instanceof Error && "statusCode" in err
          ? (err as { statusCode: number }).statusCode
          : undefined;

      if (statusCode === 410) {
        // Subscription expired / unsubscribed — remove from DB
        await db.delete(pushSubscriptionsTable).where(eq(pushSubscriptionsTable.id, sub.id));
      } else {
        console.error(`[push] Failed to send to subscription ${sub.id}:`, err);
      }
    }
  }
}
