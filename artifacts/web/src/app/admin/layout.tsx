import { requireAdmin } from "@/lib/auth";
import { adminLogout } from "./logout-action";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { getTranslations } from "next-intl/server";

const navKeys = [
  { key: "dashboard", href: "/admin/dashboard" },
  { key: "users", href: "/admin/users" },
  { key: "upgradeRequests", href: "/admin/upgrade-requests" },
  { key: "tickets", href: "/admin/tickets" },
  { key: "facilities", href: "/admin/facilities" },
  { key: "content", href: "/admin/content" },
  { key: "staff", href: "/admin/staff" },
  { key: "auditLogs", href: "/admin/audit-logs" },
  { key: "wallets", href: "/admin/wallets" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, staff } = await requireAdmin();
  const t = await getTranslations("admin");
  const staffName = staff.name || user.email || "Admin";
  const staffRole = staff.role.replace(/_/g, " ");

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-900 text-white p-4 flex-shrink-0 flex flex-col">
        <div className="mb-6">
          <h1 className="text-xl font-bold">SCLA Admin</h1>
          <p className="text-sm text-gray-400 mt-1 truncate">{staffName}</p>
          <p className="text-xs text-gray-500 capitalize">{staffRole}</p>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          {navKeys.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-2 rounded hover:bg-gray-700"
            >
              {t(item.key as Parameters<typeof t>[0])}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 mt-4 mb-2">
          <LocaleSwitcher />
          <ThemeToggle />
        </div>

        <form action={adminLogout}>
          <button
            type="submit"
            className="w-full text-left px-3 py-2 rounded text-sm text-gray-400 hover:bg-gray-700 hover:text-white"
          >
            {t("signOut")}
          </button>
        </form>
      </aside>

      <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-950">
        {children}
      </main>
    </div>
  );
}
