import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { AdminPageHeader } from "@/components/layout/admin-page-header";
import { Megaphone, Tag, HelpCircle, ArrowRight } from "lucide-react";
import type { ComponentType } from "react";

export const dynamic = "force-dynamic";

const sections: Array<{
  title: string;
  description: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  tint: string;
}> = [
  {
    title: "Announcements & Newsletters",
    description:
      "Create and manage community updates. Control drafts, audience targeting, and publishing schedule.",
    href: "/admin/content/announcements",
    icon: Megaphone,
    tint: "text-primary bg-primary/10",
  },
  {
    title: "Promotions",
    description: "Partner promotions with validity windows and category tagging.",
    href: "/admin/content/promotions",
    icon: Tag,
    tint: "text-amber-600 bg-amber-500/10",
  },
  {
    title: "FAQs",
    description: "Frequently asked questions. Organize by category and control order.",
    href: "/admin/content/faqs",
    icon: HelpCircle,
    tint: "text-violet-600 bg-violet-500/10",
  },
];

export default async function ContentHubPage() {
  await requireAdmin();

  return (
    <div>
      <AdminPageHeader
        title="Content management"
        description="Shape what residents see in Discover and Info Centre."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="group rounded-2xl bg-card border border-card-border p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-[transform,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring flex flex-col"
          >
            <div className={`p-2.5 rounded-xl ${section.tint} w-fit`}>
              <section.icon className="w-5 h-5" aria-hidden="true" />
            </div>
            <h2 className="text-base font-extrabold tracking-tight mt-4">{section.title}</h2>
            <p className="text-sm text-muted-foreground mt-1 flex-1">{section.description}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:text-primary/80">
              Manage
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
