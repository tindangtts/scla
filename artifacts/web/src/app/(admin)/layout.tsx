export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-900 text-white p-4 flex-shrink-0">
        <h1 className="text-xl font-bold mb-6">SCLA Admin</h1>
        <nav className="flex flex-col gap-2">
          <a
            href="/admin/dashboard"
            className="px-3 py-2 rounded hover:bg-gray-700"
          >
            Dashboard
          </a>
          <a href="/admin/users" className="px-3 py-2 rounded hover:bg-gray-700">
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
      </aside>

      <main className="flex-1 p-6 bg-gray-50">{children}</main>
    </div>
  );
}
