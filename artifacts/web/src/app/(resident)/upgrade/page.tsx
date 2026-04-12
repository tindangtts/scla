import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { AppSubHeader } from "@/components/layout/app-header";
import { UpgradeForm } from "./upgrade-form";
import Link from "next/link";
import { Clock, ShieldCheck, Sparkles, CreditCard, Wallet, Ticket } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function UpgradePage() {
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
        <AppSubHeader title="Upgrade" backHref="/" backLabel="Home" />
        <div className="p-5">
          <p className="text-muted-foreground">User account not found. Please contact support.</p>
        </div>
      </>
    );
  }

  if (dbUser.userType === "resident") {
    return (
      <>
        <AppSubHeader title="Upgrade" backHref="/" backLabel="Home" />
        <div className="px-5 -mt-6 pb-8 relative z-20">
          <div className="rounded-2xl bg-card border border-card-border p-6 shadow-sm text-center space-y-3">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-7 h-7" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-extrabold tracking-tight">Already verified</h2>
              <p className="text-sm text-muted-foreground mt-1">
                You already have full resident access.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90"
            >
              Back to home
            </Link>
          </div>
        </div>
      </>
    );
  }

  if (dbUser.upgradeStatus === "pending") {
    return (
      <>
        <AppSubHeader title="Upgrade" backHref="/" backLabel="Home" />
        <div className="px-5 -mt-6 pb-8 relative z-20">
          <div className="rounded-2xl bg-card border border-card-border p-6 shadow-sm text-center space-y-3">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Clock className="w-7 h-7" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-extrabold tracking-tight">Request pending</h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                Our team will verify your details within 1–2 business days and notify you once
                approved.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90"
            >
              Back to home
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AppSubHeader title="Upgrade to Resident" backHref="/" backLabel="Home" />

      <div className="px-5 -mt-6 pb-8 relative z-20 space-y-4">
        {/* Perks */}
        <div className="rounded-2xl bg-gradient-gold text-accent-foreground p-5 shadow-lg shadow-accent/20 relative overflow-hidden">
          <div aria-hidden="true" className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 blur-3xl rounded-full" />
          <div className="relative">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]">What you unlock</p>
            </div>
            <ul className="mt-3 space-y-2 text-sm font-semibold">
              <li className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" aria-hidden="true" /> Pay bills instantly in-app
              </li>
              <li className="flex items-center gap-2">
                <Wallet className="w-4 h-4" aria-hidden="true" /> Wallet & deposit tracking
              </li>
              <li className="flex items-center gap-2">
                <Ticket className="w-4 h-4" aria-hidden="true" /> Unlimited Star Assist tickets
              </li>
            </ul>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-2xl bg-card border border-card-border p-5 shadow-sm">
          <h2 className="text-base font-bold tracking-tight mb-1">Submit upgrade request</h2>
          <p className="text-xs text-muted-foreground mb-4">
            Enter your apartment details. Our team verifies and approves within 1–2 business days.
          </p>
          <UpgradeForm />
        </div>
      </div>
    </>
  );
}
