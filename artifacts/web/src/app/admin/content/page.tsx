import { requireAdmin } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export const dynamic = "force-dynamic";

const sections = [
  {
    title: "Announcements & Newsletters",
    description:
      "Create and manage community announcements and newsletters. Control drafts, audience targeting, and publishing.",
    href: "/admin/content/announcements",
  },
  {
    title: "Promotions",
    description:
      "Manage partner promotions with validity dates and categories. Toggle active status.",
    href: "/admin/content/promotions",
  },
  {
    title: "FAQs",
    description:
      "Manage frequently asked questions. Organize by category and control sort order and publishing.",
    href: "/admin/content/faqs",
  },
];

export default async function ContentHubPage() {
  await requireAdmin();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Content Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sections.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="hover:shadow-md transition-shadow h-full">
              <CardHeader>
                <CardTitle className="text-base">{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {section.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
