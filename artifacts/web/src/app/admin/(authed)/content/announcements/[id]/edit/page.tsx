import { requireAdmin } from "@/lib/auth";
import { getAnnouncementById } from "@/lib/queries/admin-content";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/layout/admin-page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  if (!announcement) notFound();

  return (
    <div className="max-w-2xl">
      <AdminPageHeader
        title="Edit announcement"
        backHref="/admin/content/announcements"
        backLabel="Announcements"
      />

      <form
        action={updateAnnouncement}
        className="rounded-2xl bg-card border border-card-border p-6 shadow-sm space-y-5"
      >
        <input type="hidden" name="id" value={announcement.id} />

        <div className="space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" defaultValue={announcement.title} required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="summary">Summary</Label>
          <Input id="summary" name="summary" defaultValue={announcement.summary} required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            name="content"
            required
            rows={8}
            defaultValue={announcement.content}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="type">Type</Label>
            <select
              id="type"
              name="type"
              defaultValue={announcement.type}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
            >
              <option value="announcement">Announcement</option>
              <option value="newsletter">Newsletter</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="targetAudience">Audience</Label>
            <select
              id="targetAudience"
              name="targetAudience"
              defaultValue={announcement.targetAudience}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
            >
              <option value="all">Everyone</option>
              <option value="residents_only">Residents only</option>
              <option value="guests_only">Guests only</option>
            </select>
          </div>
        </div>

        <label className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border bg-muted/40 cursor-pointer hover:bg-muted transition-colors">
          <input
            type="checkbox"
            id="isDraft"
            name="isDraft"
            defaultChecked={announcement.isDraft}
            className="h-4 w-4 rounded border-input accent-primary"
          />
          <span className="block text-sm font-bold">Save as draft</span>
        </label>

        <Button type="submit" className="font-bold">
          Update announcement
        </Button>
      </form>
    </div>
  );
}
