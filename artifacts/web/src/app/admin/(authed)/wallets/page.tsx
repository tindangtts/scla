import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { searchResidents } from "@/lib/queries/admin-wallets";
import { AdminPageHeader } from "@/components/layout/admin-page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Search, Wallet as WalletIcon, MapPin } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function WalletsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const search = params.search || "";

  const residents = search ? await searchResidents(search) : [];

  return (
    <div>
      <AdminPageHeader
        title="Wallet management"
        description="Search residents, audit balances, and issue adjustments."
      />

      <form
        method="GET"
        className="rounded-2xl bg-card border border-card-border p-3 shadow-sm mb-6 flex flex-col sm:flex-row gap-2.5"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
          <Input
            type="search"
            name="search"
            placeholder="Search residents by name or email..."
            defaultValue={search}
            className="pl-9"
            aria-label="Search residents"
          />
        </div>
        <Button type="submit" className="font-bold">
          Search
        </Button>
      </form>

      {!search ? (
        <EmptyState
          icon={WalletIcon}
          title="Search for a resident"
          description="Find a resident by name or email to manage their wallet."
        />
      ) : residents.length === 0 ? (
        <EmptyState
          icon={WalletIcon}
          title="No residents found"
          description="Double-check the spelling, or try a partial name."
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {residents.map((r) => (
            <li
              key={r.id}
              className="rounded-2xl bg-card border border-card-border p-4 shadow-sm flex items-center justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                <p className="font-bold text-foreground truncate">{r.name}</p>
                <p className="text-xs text-muted-foreground truncate">{r.email}</p>
                {r.unitNumber ? (
                  <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1 font-medium">
                    <MapPin className="w-3 h-3" aria-hidden="true" />
                    {r.unitNumber} · {r.developmentName}
                  </p>
                ) : null}
              </div>
              <Link
                href={`/admin/wallets/${r.id}`}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors"
              >
                <WalletIcon className="w-3.5 h-3.5" aria-hidden="true" />
                Manage
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
