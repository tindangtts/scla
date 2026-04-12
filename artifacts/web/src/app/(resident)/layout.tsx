import { requireAuth } from "@/lib/auth";
import { logout } from "./logout-action";
import PushPrompt from "@/components/push-prompt";
import NotificationBell from "@/components/notification-bell";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

export default async function ResidentLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAuth();
  const t = await getTranslations("nav");
  const th = await getTranslations("header");
  const displayName = user.user_metadata?.name || user.email?.split("@")[0] || "User";

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-600 dark:bg-blue-900 text-white px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold">{th("appName")}</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm truncate max-w-[120px]">{displayName}</span>
          <LocaleSwitcher />
          <ThemeToggle />
          <NotificationBell />
          <form action={logout}>
            <button
              type="submit"
              className="text-xs bg-blue-700 hover:bg-blue-800 dark:bg-blue-800 dark:hover:bg-blue-700 px-2 py-1 rounded"
            >
              {th("logout")}
            </button>
          </form>
        </div>
      </header>

      <PushPrompt />

      <main className="flex-1 pb-16 lg:pb-0">{children}</main>

      <nav className="fixed bottom-0 w-full bg-white dark:bg-gray-900 border-t dark:border-gray-700 flex justify-around py-2 text-xs text-gray-600 dark:text-gray-300 lg:hidden">
        <Link href="/" className="flex flex-col items-center gap-1">
          <span>{t("home")}</span>
        </Link>
        <Link href="/bills" className="flex flex-col items-center gap-1">
          <span>{t("bills")}</span>
        </Link>
        <Link href="/star-assist" className="flex flex-col items-center gap-1">
          <span>{t("starAssist")}</span>
        </Link>
        <Link href="/bookings" className="flex flex-col items-center gap-1">
          <span>{t("bookings")}</span>
        </Link>
        <Link href="/more" className="flex flex-col items-center gap-1">
          <span>{t("more")}</span>
        </Link>
      </nav>
    </div>
  );
}
