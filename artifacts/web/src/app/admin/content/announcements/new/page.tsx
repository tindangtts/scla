import { requireAdmin } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { createAnnouncement } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewAnnouncementPage() {
  await requireAdmin();

  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/content/announcements"
        className="text-sm text-muted-foreground hover:underline"
      >
        &larr; Back to Announcements
      </Link>

      <h1 className="text-2xl font-bold mt-2 mb-4">New Announcement</h1>

      <form action={createAnnouncement} className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" required />
        </div>

        <div>
          <Label htmlFor="summary">Summary</Label>
          <Input id="summary" name="summary" required />
        </div>

        <div>
          <Label htmlFor="content">Content</Label>
          <textarea
            id="content"
            name="content"
            required
            rows={6}
            className="w-full border rounded px-3 py-2 text-sm bg-background"
          />
        </div>

        <div>
          <Label htmlFor="type">Type</Label>
          <select
            id="type"
            name="type"
            className="w-full border rounded px-3 py-2 text-sm bg-background"
          >
            <option value="announcement">Announcement</option>
            <option value="newsletter">Newsletter</option>
          </select>
        </div>

        <div>
          <Label htmlFor="targetAudience">Target Audience</Label>
          <select
            id="targetAudience"
            name="targetAudience"
            className="w-full border rounded px-3 py-2 text-sm bg-background"
          >
            <option value="all">All</option>
            <option value="residents_only">Residents Only</option>
            <option value="guests_only">Guests Only</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" id="isDraft" name="isDraft" />
          <Label htmlFor="isDraft">Save as Draft</Label>
        </div>

        <Button type="submit">Create Announcement</Button>
      </form>
    </div>
  );
}
