import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getUserById, getUserWalletBalance } from "@/lib/queries/admin-users";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/layout/admin-page-header";
import { Button } from "@/components/ui/button";
import { formatDate, formatMMK } from "@/lib/format";
import { updateUserRole } from "./actions";
import { Mail, Phone, MapPin, Building2, IdCard, CalendarDays, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const user = await getUserById(id);
  if (!user) notFound();

  const walletBalance = await getUserWalletBalance(id);
  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((s) => s.charAt(0).toUpperCase())
    .join("");

  return (
    <div>
      <AdminPageHeader
        title={user.name}
        backHref="/admin/users"
        backLabel="All users"
        action={
          <Link
            href={`/admin/wallets/${user.id}`}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors"
          >
            <Wallet className="w-3.5 h-3.5" aria-hidden="true" />
            Adjust wallet
          </Link>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Profile */}
        <div className="rounded-2xl bg-card border border-card-border p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-5">
            <div
              aria-hidden="true"
              className="w-14 h-14 rounded-2xl bg-gradient-teal text-primary-foreground flex items-center justify-center text-lg font-extrabold shadow-sm"
            >
              {initials}
            </div>
            <div className="min-w-0">
              <p className="font-extrabold tracking-tight text-foreground truncate">{user.name}</p>
              <span
                className={cn(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mt-1",
                  user.userType === "resident"
                    ? "bg-primary/10 text-primary"
                    : "bg-secondary text-secondary-foreground",
                )}
              >
                {user.userType}
              </span>
            </div>
          </div>

          <dl className="divide-y divide-border">
            <ProfileRow icon={Mail} label="Email" value={user.email} />
            <ProfileRow icon={Phone} label="Phone" value={user.phone} />
            <ProfileRow icon={MapPin} label="Unit number" value={user.unitNumber || "—"} />
            <ProfileRow icon={IdCard} label="Resident ID" value={user.residentId || "—"} />
            <ProfileRow icon={Building2} label="Development" value={user.developmentName || "—"} />
            <ProfileRow icon={CalendarDays} label="Created" value={formatDate(user.createdAt)} />
          </dl>
        </div>

        {/* Wallet + Role */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-card border border-card-border p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Wallet balance
                </p>
                <p className="text-3xl font-extrabold text-foreground mt-1 tracking-tight tabular-nums">
                  {formatMMK(walletBalance)}
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <Wallet className="w-6 h-6" aria-hidden="true" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-card border border-card-border p-6 shadow-sm">
            <h3 className="text-sm font-bold tracking-tight mb-1">Role assignment</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Changes propagate to Supabase Auth + app database.
            </p>
            <form action={updateUserRole} className="flex items-end gap-3 flex-wrap">
              <input type="hidden" name="userId" value={user.id} />
              <div className="flex-1 min-w-[160px] space-y-1.5">
                <label
                  htmlFor="newRole"
                  className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
                >
                  User role
                </label>
                <select
                  id="newRole"
                  name="newRole"
                  defaultValue={user.userType}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                >
                  <option value="guest">Guest</option>
                  <option value="resident">Resident</option>
                </select>
              </div>
              <Button type="submit" className="font-bold">
                Update role
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="p-2 rounded-xl bg-muted text-muted-foreground shrink-0">
        <Icon className="w-4 h-4" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <dt className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </dt>
        <dd className="text-sm font-semibold text-foreground truncate">{value}</dd>
      </div>
    </div>
  );
}
