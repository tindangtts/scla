import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { getUserNotifications, getUnreadCount } from "@/lib/queries/notifications";
import { AppSubHeader } from "@/components/layout/app-header";
import { EmptyState } from "@/components/ui/empty-state";
import { MarkAsReadButton, MarkAllAsReadButton } from "./notification-buttons";
import {
  BellRing,
  Ticket as TicketIcon,
  CreditCard,
  Megaphone,
  Calendar,
  Info,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComponentType } from "react";

export const dynamic = "force-dynamic";

function formatRelativeTime(date: Date) {
  const diff = Date.now() - new Date(date).getTime();
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

const TYPE_META: Record<
  string,
  { label: string; icon: ComponentType<{ className?: string }>; tint: string }
> = {
  ticket_update: { label: "Ticket", icon: TicketIcon, tint: "text-primary bg-primary/10" },
  payment_confirmed: { label: "Payment", icon: CreditCard, tint: "text-emerald-600 bg-emerald-500/10" },
  announcement: { label: "Announcement", icon: Megaphone, tint: "text-amber-600 bg-amber-500/10" },
  booking_reminder: { label: "Booking", icon: Calendar, tint: "text-violet-600 bg-violet-500/10" },
  general: { label: "General", icon: Info, tint: "text-muted-foreground bg-muted" },
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
      <div className="p-5">
        <p className="text-muted-foreground">User account not found.</p>
      </div>
    );
  }

  const [notifications, unreadCount] = await Promise.all([
    getUserNotifications(dbUser.id),
    getUnreadCount(dbUser.id),
  ]);

  return (
    <>
      <AppSubHeader
        title="Notifications"
        backHref="/"
        backLabel="Home"
        action={
          <Link
            href="/notifications/preferences"
            aria-label="Notification preferences"
            className="p-2 rounded-md text-primary-foreground hover:bg-white/15 transition-colors"
          >
            <Settings className="w-4 h-4" aria-hidden="true" />
          </Link>
        }
      />

      <div className="px-5 -mt-6 pb-8 relative z-20 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground font-medium">
            {unreadCount === 0
              ? "You're all caught up"
              : `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`}
          </p>
          {unreadCount > 0 ? <MarkAllAsReadButton /> : null}
        </div>

        {notifications.length === 0 ? (
          <EmptyState
            icon={BellRing}
            title="No notifications yet"
            description="Ticket updates, bill reminders, and announcements show up here."
          />
        ) : (
          <ul className="space-y-2.5">
            {notifications.map((n) => {
              const meta = TYPE_META[n.type] ?? TYPE_META.general;
              const Icon = meta.icon;
              return (
                <li key={n.id}>
                  <div
                    className={cn(
                      "flex items-start gap-3 rounded-2xl bg-card border border-card-border p-4 shadow-sm transition-colors",
                      !n.isRead && "bg-primary/5 ring-1 ring-primary/20",
                    )}
                  >
                    <div className={cn("p-2 rounded-xl shrink-0", meta.tint)}>
                      <Icon className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-[10px] font-bold uppercase tracking-wider">
                          {meta.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-semibold">
                          {formatRelativeTime(n.createdAt)}
                        </span>
                      </div>
                      <p className={cn("text-sm text-foreground", !n.isRead ? "font-bold" : "font-semibold")}>
                        {n.title}
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{n.body}</p>
                    </div>
                    {!n.isRead ? <MarkAsReadButton notificationId={n.id} /> : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
