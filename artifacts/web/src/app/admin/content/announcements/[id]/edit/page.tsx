import { requireAdmin } from "@/lib/auth";
import { getAnnouncementById } from "@/lib/queries/admin-content";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { updateAnnouncement } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditAnnouncementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const announcement = await getAnnouncementById(id);

  if (!announcement) {
    notFound();
  }

  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/content/announcements"
        className="text-sm text-muted-foreground hover:underline"
      >
        &larr; Back to Announcements
      </Link>

      <h1 className="text-2xl font-bold mt-2 mb-4">Edit Announcement</h1>

      <form action={updateAnnouncement} className="space-y-4">
        <input type="hidden" name="id" value={announcement.id} />

        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            defaultValue={announcement.title}
            required
          />
        </div>

        <div>
          <Label htmlFor="summary">Summary</Label>
          <Input
            id="summary"
            name="summary"
            defaultValue={announcement.summary}
            required
          />
        </div>

        <div>
          <Label htmlFor="content">Content</Label>
          <textarea
            id="content"
            name="content"
            required
            rows={6}
            defaultValue={announcement.content}
            className="w-full border rounded px-3 py-2 text-sm bg-background"
          />
        </div>

        <div>
          <Label htmlFor="type">Type</Label>
          <select
            id="type"
            name="type"
            defaultValue={announcement.type}
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
            defaultValue={announcement.targetAudience}
            className="w-full border rounded px-3 py-2 text-sm bg-background"
          >
            <option value="all">All</option>
            <option value="residents_only">Residents Only</option>
            <option value="guests_only">Guests Only</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isDraft"
            name="isDraft"
            defaultChecked={announcement.isDraft}
          />
          <Label htmlFor="isDraft">Save as Draft</Label>
        </div>

        <Button type="submit">Update Announcement</Button>
      </form>
    </div>
  );
}
