import { requireAdmin } from "@/lib/auth";
import { adminLogout } from "./logout-action";

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
          <a
            href="/admin/dashboard"
            className="px-3 py-2 rounded hover:bg-gray-700"
          >
            Dashboard
          </a>
          <a
            href="/admin/users"
            className="px-3 py-2 rounded hover:bg-gray-700"
          >
            Users
          </a>
          <a
            href="/admin/tickets"
            className="px-3 py-2 rounded hover:bg-gray-700"
          >
            Tickets
          </a>
          <a
            href="/admin/facilities"
            className="px-3 py-2 rounded hover:bg-gray-700"
          >
            Facilities
          </a>
          <a
            href="/admin/content"
            className="px-3 py-2 rounded hover:bg-gray-700"
          >
            Content
          </a>
          <a
            href="/admin/audit-logs"
            className="px-3 py-2 rounded hover:bg-gray-700"
          >
            Audit Logs
          </a>
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
