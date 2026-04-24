import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { AppSubHeader } from "@/components/layout/app-header";
import { EmptyState } from "@/components/ui/empty-state";
import { getUserHistory, type HistoryItemType } from "@/lib/queries/history";
import { formatDate, formatMMK, humanizeStatus, statusBadgeClass } from "@/lib/format";
import {
  CreditCard,
  Calendar,
  Ticket as TicketIcon,
  ChevronRight,
  Clock,
} from "lucide-react";

export const dynamic = "force-dynamic";

const tabs: Array<{ key: HistoryItemType | "all"; label: string }> = [
  { key: "all", label: "All" },
  { key: "bill", label: "Bills" },
  { key: "booking", label: "Bookings" },
  { key: "ticket", label: "Tickets" },
];

const typeIcons = {
  bill: CreditCard,
  booking: Calendar,
  ticket: TicketIcon,
};

const typeTints = {
  bill: "text-primary bg-primary/10",
  booking: "text-emerald-600 bg-emerald-500/10",
  ticket: "text-amber-600 bg-amber-500/10",
};

interface Props {
  searchParams: Promise<{ type?: string }>;
}

export default async function HistoryPage({ searchParams }: Props) {
  const params = await searchParams;
  const user = await requireAuth();

  const dbUsers = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, user.email!))
    .limit(1);

  const dbUser = dbUsers[0];

  if (!dbUser) {
    return (
      <>
        <AppSubHeader title="Activity History" backHref="/more" backLabel="More" />
        <div className="p-5">
          <p className="text-muted-foreground">User account not found.</p>
        </div>
      </>
    );
  }

  const rawType = params.type;
  const validTypes = ["bill", "booking", "ticket"] as const;
  const activeTab = validTypes.includes(rawType as HistoryItemType) ? (rawType as HistoryItemType) : "all";
  const filterType = activeTab === "all" ? undefined : activeTab;
  const items = await getUserHistory(dbUser.id, filterType);

  return (
    <>
      <AppSubHeader title="Activity History" backHref="/more" backLabel="More" />

      <div className="px-5 -mt-6 pb-8 relative z-20 space-y-4">
        <div
          role="tablist"
          aria-label="Filter by type"
          className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1"
        >
          {tabs.map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <Link
                key={tab.key}
                href={tab.key === "all" ? "/history" : `/history?type=${tab.key}`}
                role="tab"
                aria-selected={isActive}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-card-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {items.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No activity yet"
            description="Your bills, bookings, and tickets will appear here."
          />
        ) : (
          <ul className="space-y-2.5">
            {items.map((item) => {
              const Icon = typeIcons[item.type];
              const tint = typeTints[item.type];

              return (
                <li key={`${item.type}-${item.id}`}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 rounded-2xl bg-card border border-card-border p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-[transform,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <div className={`p-2.5 rounded-xl shrink-0 ${tint}`}>
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground font-medium tabular-nums">
                        {item.number} · {formatDate(item.date)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusBadgeClass(item.status)}`}
                      >
                        {humanizeStatus(item.status)}
                      </span>
                      {item.amount && (
                        <p className="text-xs font-bold text-foreground mt-1 tabular-nums">
                          {formatMMK(item.amount)}
                        </p>
                      )}
                    </div>
                    <ChevronRight
                      className="w-4 h-4 text-muted-foreground shrink-0"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
