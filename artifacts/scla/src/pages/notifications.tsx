import { useLocation } from "wouter";
import { useListNotifications, getListNotificationsQueryKey } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/app-layout";
import { formatDateTime } from "@/lib/format";
import { ChevronLeft, Bell, CreditCard, HelpCircle, Megaphone, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

const TYPE_ICONS = {
  ticket_update: HelpCircle,
  payment_confirmed: CreditCard,
  announcement: Megaphone,
  booking_reminder: Calendar,
  general: Bell,
};

const TYPE_COLORS = {
  ticket_update: "text-blue-600 bg-blue-500/10 border-blue-500/20",
  payment_confirmed: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
  announcement: "text-accent-foreground bg-accent/20 border-accent/30",
  booking_reminder: "text-purple-600 bg-purple-500/10 border-purple-500/20",
  general: "text-primary bg-primary/10 border-primary/20",
};

export default function NotificationsPage() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  const { data: notifications, isLoading } = useListNotifications({
    query: { queryKey: getListNotificationsQueryKey() }
  });

  return (
    <AppLayout>
      <div className="page-enter bg-slate-50 min-h-full">
        <div className="bg-gradient-teal px-5 pt-14 pb-8 rounded-b-[2rem] shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl rounded-full" />
          <div className="relative z-10 flex items-center gap-3">
            <button onClick={() => setLocation("/")} className="p-2.5 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors" data-testid="button-back">
              <ChevronLeft className="w-5 h-5 text-primary-foreground" />
            </button>
            <h1 className="text-xl font-extrabold text-primary-foreground tracking-tight">{t("notifications.title")}</h1>
          </div>
        </div>

        <div className="px-5 py-6 pb-12 space-y-3 -mt-4 relative z-20">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-[1.5rem]" />)}
            </div>
          ) : !notifications || notifications.length === 0 ? (
            <div className="bg-card border border-card-border rounded-[1.5rem] p-10 text-center shadow-sm mt-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <p className="font-extrabold text-lg text-foreground tracking-tight">{t("notifications.title")}</p>
              <p className="text-muted-foreground font-medium text-sm mt-1">You're all caught up.</p>
            </div>
          ) : (
            notifications.map(notif => {
              const Icon = TYPE_ICONS[notif.type] ?? Bell;
              const colorClass = TYPE_COLORS[notif.type] ?? TYPE_COLORS.general;
              
              return (
                <div
                  key={notif.id}
                  className={`border rounded-[1.5rem] p-5 flex gap-4 transition-all shadow-sm ${
                    !notif.isRead 
                      ? "bg-white border-primary/20 shadow-md" 
                      : "bg-card border-card-border hover:shadow-md"
                  }`}
                  data-testid={`notification-${notif.id}`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border ${colorClass}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notif.isRead ? "font-extrabold text-foreground" : "font-bold text-foreground/80"} leading-snug`}>
                      {notif.title}
                    </p>
                    <p className="text-xs font-medium text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{notif.body}</p>
                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-2">{formatDateTime(notif.createdAt)}</p>
                  </div>
                  {!notif.isRead && (
                    <div className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0 mt-1 shadow-sm shadow-primary/40 animate-pulse"></div>
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
