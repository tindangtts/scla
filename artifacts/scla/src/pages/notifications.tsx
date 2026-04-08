import { useLocation } from "wouter";
import { useListNotifications, getListNotificationsQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/app-layout";
import { formatDateTime } from "@/lib/format";
import { ChevronLeft, Bell, CreditCard, HelpCircle, Megaphone, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const TYPE_ICONS = {
  ticket_update: HelpCircle,
  payment_confirmed: CreditCard,
  announcement: Megaphone,
  booking_reminder: Calendar,
  general: Bell,
};

export default function NotificationsPage() {
  const [, setLocation] = useLocation();

  const { data: notifications, isLoading } = useListNotifications({
    query: { queryKey: getListNotificationsQueryKey() }
  });

  return (
    <AppLayout>
      <div className="page-enter">
        <div className="bg-primary px-4 pt-12 pb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setLocation("/")} className="p-2 bg-primary-foreground/10 rounded-full" data-testid="button-back">
              <ChevronLeft className="w-4 h-4 text-primary-foreground" />
            </button>
            <h1 className="text-lg font-semibold text-primary-foreground">Notifications</h1>
          </div>
        </div>

        <div className="px-4 py-4 pb-6 space-y-2">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
            </div>
          ) : !notifications || notifications.length === 0 ? (
            <div className="text-center py-16">
              <Bell className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium text-foreground">No notifications</p>
              <p className="text-muted-foreground text-sm mt-1">You're all caught up.</p>
            </div>
          ) : (
            notifications.map(notif => {
              const Icon = TYPE_ICONS[notif.type] ?? Bell;
              return (
                <div
                  key={notif.id}
                  className={`bg-card border rounded-xl p-4 flex gap-3 ${
                    !notif.isRead ? "border-primary/30 bg-primary/3" : "border-card-border"
                  }`}
                  data-testid={`notification-${notif.id}`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                    !notif.isRead ? "bg-primary/10" : "bg-muted"
                  }`}>
                    <Icon className={`w-4 h-4 ${!notif.isRead ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notif.isRead ? "font-semibold text-foreground" : "font-medium text-foreground"}`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.body}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatDateTime(notif.createdAt)}</p>
                  </div>
                  {!notif.isRead && (
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5"></div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </AppLayout>
  );
}
