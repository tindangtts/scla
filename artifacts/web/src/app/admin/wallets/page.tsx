import { requireAdmin } from "@/lib/auth";
import { searchResidents } from "@/lib/queries/admin-wallets";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
      <h2 className="text-2xl font-bold mb-6">Wallet Management</h2>

      <form method="GET" className="flex gap-3 mb-6">
        <input
          type="text"
          name="search"
          placeholder="Search residents by name or email..."
          defaultValue={search}
          className="px-3 py-2 border rounded-md text-sm flex-1 min-w-[200px]"
        />
        <Button type="submit" size="sm">
          Search
        </Button>
      </form>

      {!search ? (
        <p className="text-muted-foreground">
          Search for a resident to manage their wallet.
        </p>
      ) : residents.length === 0 ? (
        <p className="text-muted-foreground">No residents found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {residents.map((r) => (
            <div
              key={r.id}
              className="border rounded-lg p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-medium">{r.name}</p>
                <p className="text-sm text-muted-foreground">{r.email}</p>
                <p className="text-xs text-muted-foreground">
                  {r.unitNumber ? `${r.unitNumber}, ${r.developmentName}` : "-"}
                </p>
              </div>
              <Link href={`/admin/wallets/${r.id}`}>
                <Button size="sm" variant="outline">
                  Manage Wallet
                </Button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
