import { requireAdmin } from "@/lib/auth";
import { getAnnouncements } from "@/lib/queries/admin-content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { deleteAnnouncement } from "./actions";

export const dynamic = "force-dynamic";

export default async function AnnouncementsPage() {
  await requireAdmin();
  const announcements = await getAnnouncements();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Announcements</h1>
        <Link href="/admin/content/announcements/new">
          <Button size="sm">New Announcement</Button>
        </Link>
      </div>

      {announcements.length === 0 ? (
        <p className="text-muted-foreground">No announcements yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="p-2">Title</th>
                <th className="p-2">Type</th>
                <th className="p-2">Audience</th>
                <th className="p-2">Draft</th>
                <th className="p-2">Published</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {announcements.map((a) => (
                <tr key={a.id} className="border-b hover:bg-muted/50">
                  <td className="p-2 max-w-xs truncate">{a.title}</td>
                  <td className="p-2">
                    <Badge variant="outline">
                      {a.type === "newsletter" ? "Newsletter" : "Announcement"}
                    </Badge>
                  </td>
                  <td className="p-2 capitalize">
                    {a.targetAudience.replace(/_/g, " ")}
                  </td>
                  <td className="p-2">
                    {a.isDraft ? (
                      <Badge variant="secondary" className="text-yellow-600">
                        Draft
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-green-600">
                        Published
                      </Badge>
                    )}
                  </td>
                  <td className="p-2">
                    {a.publishedAt.toLocaleDateString()}
                  </td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <Link href={`/admin/content/announcements/${a.id}/edit`}>
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </Link>
                      <form action={deleteAnnouncement}>
                        <input type="hidden" name="id" value={a.id} />
                        <Button
                          type="submit"
                          size="sm"
                          variant="destructive"
                        >
                          Delete
                        </Button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
