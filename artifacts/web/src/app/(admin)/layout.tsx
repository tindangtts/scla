import { requireAdmin } from "@/lib/auth";
import { adminLogout } from "./logout-action";
import Link from "next/link";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Users", href: "/admin/users" },
  { label: "Upgrade Requests", href: "/admin/upgrade-requests" },
  { label: "Tickets", href: "/admin/tickets" },
  { label: "Facilities", href: "/admin/facilities" },
  { label: "Content", href: "/admin/content" },
  { label: "Staff", href: "/admin/staff" },
  { label: "Audit Logs", href: "/admin/audit-logs" },
  { label: "Wallets", href: "/admin/wallets" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, staff } = await requireAdmin();
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
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-2 rounded hover:bg-gray-700"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <form action={adminLogout} className="mt-4">
          <button
            type="submit"
            className="w-full text-left px-3 py-2 rounded text-sm text-gray-400 hover:bg-gray-700 hover:text-white"
          >
            Sign Out
          </button>
        </form>
      </aside>

      <main className="flex-1 p-6 bg-gray-50">{children}</main>
    </div>
  );
}
