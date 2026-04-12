import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { getTranslations } from "next-intl/server";

export default async function MorePage() {
  const t = await getTranslations("more");
  const ts = await getTranslations("settings");

  const menuItems = [
    { href: "/discover", label: t("discover"), description: t("discoverDesc") },
    {
      href: "/info-centre",
      label: t("infoCentre"),
      description: t("infoCentreDesc"),
    },
    {
      href: "/notifications",
      label: t("notifications"),
      description: t("notificationsDesc"),
    },
    { href: "/profile", label: t("profile"), description: t("profileDesc") },
    { href: "/wallet", label: t("wallet"), description: t("walletDesc") },
  ];

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">{t("title")}</h2>

      <div className="space-y-2">
        {menuItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="hover:bg-muted/50 transition-colors mb-2">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <span className="text-muted-foreground">&rsaquo;</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <h3 className="text-lg font-semibold mt-6">{t("settings")}</h3>

      <Card>
        <CardContent className="pt-4 pb-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{ts("language")}</span>
            <LocaleSwitcher />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{ts("theme")}</span>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
