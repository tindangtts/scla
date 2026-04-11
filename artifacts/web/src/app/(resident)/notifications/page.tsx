import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { getUserNotifications, getUnreadCount } from "@/lib/queries/notifications";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { MarkAsReadButton, MarkAllAsReadButton } from "./notification-buttons";

export const dynamic = "force-dynamic";

function formatRelativeTime(date: Date) {
  const now = Date.now();
  const diff = now - new Date(date).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const TYPE_LABELS: Record<string, string> = {
  ticket_update: "Ticket",
  payment_confirmed: "Payment",
  announcement: "Announcement",
  booking_reminder: "Booking",
  general: "General",
};

export default async function NotificationsPage() {
  const user = await requireAuth();

  const dbUsers = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, user.email!))
    .limit(1);

  const dbUser = dbUsers[0];
  if (!dbUser) {
    return (
      <div className="p-4">
        <p className="text-muted-foreground">User account not found.</p>
      </div>
    );
  }

  const [notifications, unreadCount] = await Promise.all([
    getUserNotifications(dbUser.id),
    getUnreadCount(dbUser.id),
  ]);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Notifications</h2>
        <Link
          href="/notifications/preferences"
          className="text-sm text-blue-600 hover:underline"
        >
          Settings
        </Link>
      </div>

      {unreadCount > 0 && (
        <MarkAllAsReadButton />
      )}

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No notifications yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={
                !notification.isRead
                  ? "border-l-4 border-l-blue-500"
                  : ""
              }
            >
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0 flex-1">
                    <p
                      className={`text-sm ${
                        !notification.isRead ? "font-bold" : "font-medium"
                      }`}
                    >
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {notification.body}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {TYPE_LABELS[notification.type] ?? notification.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(notification.createdAt)}
                      </span>
                    </div>
                  </div>
                  {!notification.isRead && (
                    <MarkAsReadButton notificationId={notification.id} />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
