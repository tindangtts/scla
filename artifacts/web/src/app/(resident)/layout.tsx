import { requireAuth } from "@/lib/auth";
import { logout } from "./logout-action";
import PushPrompt from "@/components/push-prompt";

export default async function ResidentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();
  const displayName =
    user.user_metadata?.name || user.email?.split("@")[0] || "User";

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Star City Living</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm truncate max-w-[120px]">{displayName}</span>
          <form action={logout}>
            <button
              type="submit"
              className="text-xs bg-blue-700 hover:bg-blue-800 px-2 py-1 rounded"
            >
              Logout
            </button>
          </form>
        </div>
      </header>

      <PushPrompt />

      <main className="flex-1 pb-16">{children}</main>

      <nav className="fixed bottom-0 w-full bg-white border-t flex justify-around py-2 text-xs text-gray-600">
        <a href="/" className="flex flex-col items-center gap-1">
          <span>Home</span>
        </a>
        <a href="/bills" className="flex flex-col items-center gap-1">
          <span>Bills</span>
        </a>
        <a href="/star-assist" className="flex flex-col items-center gap-1">
          <span>Star Assist</span>
        </a>
        <a href="/bookings" className="flex flex-col items-center gap-1">
          <span>Bookings</span>
        </a>
        <a href="/more" className="flex flex-col items-center gap-1">
          <span>More</span>
        </a>
      </nav>
    </div>
  );
}
