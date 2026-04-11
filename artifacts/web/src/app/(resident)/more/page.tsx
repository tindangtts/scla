import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

const MENU_ITEMS = [
  {
    href: "/discover",
    label: "Discover",
    description: "Announcements, newsletters & promotions",
  },
  {
    href: "/info-centre",
    label: "Info Centre",
    description: "Knowledge base & FAQs",
  },
  {
    href: "/notifications",
    label: "Notifications",
    description: "View your notifications",
  },
  {
    href: "/profile",
    label: "Profile",
    description: "View and edit your profile",
  },
  {
    href: "/wallet",
    label: "Wallet",
    description: "Balance and transactions",
  },
];

export default function MorePage() {
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">More</h2>

      <div className="space-y-2">
        {MENU_ITEMS.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="hover:bg-muted/50 transition-colors mb-2">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <span className="text-muted-foreground">&rsaquo;</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
