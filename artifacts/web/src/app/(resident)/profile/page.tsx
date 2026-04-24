import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { AppHeader } from "@/components/layout/app-header";
import { EditForm } from "./edit-form";
import { formatDate } from "@/lib/format";
import { Mail, Phone, MapPin, Building2, BadgeCheck, CalendarDays, Crown, ChevronRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
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
        <AppHeader name="Profile" />
        <div className="p-5">
          <p className="text-muted-foreground">User account not found. Please contact support.</p>
        </div>
      </>
    );
  }

  const initials = dbUser.name
    .split(" ")
    .slice(0, 2)
    .map((s) => s.charAt(0).toUpperCase())
    .join("");

  const isResident = dbUser.userType === "resident";

  return (
    <>
      <AppHeader name="Profile" subtitle={isResident ? "Verified resident" : "Guest account"} />

      <div className="px-5 -mt-8 pb-8 relative z-20 space-y-5">
        {/* Identity card */}
        <div className="rounded-[1.75rem] bg-card border border-card-border p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div
              aria-hidden="true"
              className="w-16 h-16 rounded-2xl bg-gradient-teal text-primary-foreground flex items-center justify-center text-xl font-extrabold tracking-tight shadow-md shadow-primary/20"
            >
              {initials || "U"}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-extrabold tracking-tight truncate">{dbUser.name}</h2>
              <p className="text-sm text-muted-foreground truncate">{dbUser.email}</p>
              <span
                className={`inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isResident
                    ? "bg-primary/10 text-primary"
                    : "bg-accent/15 text-accent-foreground"
                }`}
              >
                <BadgeCheck className="w-3 h-3" aria-hidden="true" />
                {isResident ? "Resident" : "Guest"}
              </span>
            </div>
          </div>

          <dl className="grid grid-cols-1 gap-0 mt-6 border-t border-border divide-y divide-border">
            <ProfileField icon={Mail} label="Email" value={dbUser.email} />
            <ProfileField icon={Phone} label="Phone" value={dbUser.phone} />
            {dbUser.unitNumber ? (
              <ProfileField icon={MapPin} label="Unit number" value={dbUser.unitNumber} />
            ) : null}
            {dbUser.residentId ? (
              <ProfileField icon={BadgeCheck} label="Resident ID" value={dbUser.residentId} />
            ) : null}
            {dbUser.developmentName ? (
              <ProfileField icon={Building2} label="Development" value={dbUser.developmentName} />
            ) : null}
            <ProfileField
              icon={CalendarDays}
              label="Member since"
              value={formatDate(dbUser.createdAt)}
            />
          </dl>
        </div>

        {/* SCSC Membership */}
        <section aria-labelledby="membership-heading" className="rounded-2xl bg-card border border-card-border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 id="membership-heading" className="text-base font-bold tracking-tight">
              SCSC Membership
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-muted text-muted-foreground">
              Non-Member
            </span>
          </div>
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-accent/10 text-accent-foreground shrink-0">
              <Crown className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Unlock member benefits
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Get discounted facility rates, priority booking, and exclusive perks
              </p>
            </div>
          </div>
          <Link
            href="/membership"
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-gradient-gold text-accent-foreground text-sm font-bold hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            View Membership Plans
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </section>

        {/* Edit form */}
        <section aria-labelledby="edit-profile-heading" className="rounded-2xl bg-card border border-card-border p-5 shadow-sm">
          <h3 id="edit-profile-heading" className="text-base font-bold tracking-tight mb-4">
            Edit profile
          </h3>
          <EditForm name={dbUser.name} phone={dbUser.phone} />
        </section>
      </div>
    </>
  );
}

function ProfileField({
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
