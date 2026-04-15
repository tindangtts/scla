import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getFacilityById } from "@/lib/queries/admin-facilities";
import { AdminPageHeader } from "@/components/layout/admin-page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateFacility } from "../../actions";

export const dynamic = "force-dynamic";

const SELECT_CLASS =
  "w-full h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1";

export default async function EditFacilityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const facility = await getFacilityById(id);
  if (!facility) notFound();

  return (
    <div className="max-w-2xl">
      <AdminPageHeader
        title="Edit Facility"
        backHref="/admin/facilities"
        backLabel="Facilities"
      />

      <form
        action={updateFacility}
        className="rounded-2xl bg-card border border-card-border p-6 shadow-sm space-y-5"
      >
        <input type="hidden" name="id" value={facility.id} />

        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" defaultValue={facility.name} required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            name="category"
            defaultValue={facility.category}
            className={SELECT_CLASS}
          >
            <option value="swimming_pool">Swimming Pool</option>
            <option value="tennis_court">Tennis Court</option>
            <option value="basketball_court">Basketball Court</option>
            <option value="gym">Gym</option>
            <option value="badminton_court">Badminton Court</option>
            <option value="function_room">Function Room</option>
            <option value="squash_court">Squash Court</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            required
            rows={4}
            defaultValue={facility.description}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="memberRate">Member Rate (MMK)</Label>
            <Input
              id="memberRate"
              name="memberRate"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={facility.memberRate}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nonMemberRate">Non-member Rate (MMK)</Label>
            <Input
              id="nonMemberRate"
              name="nonMemberRate"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={facility.nonMemberRate}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="openingTime">Opening Time</Label>
            <Input
              id="openingTime"
              name="openingTime"
              type="time"
              required
              defaultValue={facility.openingTime.substring(0, 5)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="closingTime">Closing Time</Label>
            <Input
              id="closingTime"
              name="closingTime"
              type="time"
              required
              defaultValue={facility.closingTime.substring(0, 5)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="maxCapacity">Max Capacity</Label>
          <Input
            id="maxCapacity"
            name="maxCapacity"
            type="number"
            min="1"
            required
            defaultValue={facility.maxCapacity}
          />
        </div>

        <label className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border bg-muted/40 cursor-pointer hover:bg-muted transition-colors">
          <input
            type="checkbox"
            id="isAvailable"
            name="isAvailable"
            defaultChecked={facility.isAvailable}
            className="h-4 w-4 rounded border-input accent-primary"
          />
          <span className="block text-sm font-bold">Available for booking</span>
        </label>

        <div className="flex items-center gap-3">
          <Button type="submit" className="font-bold">
            Save
          </Button>
          <Link
            href="/admin/facilities"
            className="inline-flex items-center justify-center h-10 px-4 rounded-md border border-input bg-background text-sm font-bold hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
