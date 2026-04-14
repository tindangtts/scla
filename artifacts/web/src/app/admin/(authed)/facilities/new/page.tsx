import { requireAdmin } from "@/lib/auth";
import { AdminPageHeader } from "@/components/layout/admin-page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createFacility } from "../actions";

export const dynamic = "force-dynamic";

const SELECT_CLASS =
  "w-full h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1";

export default async function NewFacilityPage() {
  await requireAdmin();

  return (
    <div className="max-w-2xl">
      <AdminPageHeader
        title="New facility"
        backHref="/admin/facilities"
        backLabel="Facilities"
      />

      <form
        action={createFacility}
        className="rounded-2xl bg-card border border-card-border p-6 shadow-sm space-y-5"
      >
        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="category">Category</Label>
          <select id="category" name="category" className={SELECT_CLASS}>
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
          <Textarea id="description" name="description" required rows={4} />
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
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="openingTime">Opening Time</Label>
            <Input id="openingTime" name="openingTime" type="time" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="closingTime">Closing Time</Label>
            <Input id="closingTime" name="closingTime" type="time" required />
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
          />
        </div>

        <label className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border bg-muted/40 cursor-pointer hover:bg-muted transition-colors">
          <input
            type="checkbox"
            id="isAvailable"
            name="isAvailable"
            defaultChecked={true}
            className="h-4 w-4 rounded border-input accent-primary"
          />
          <span>
            <span className="block text-sm font-bold">Available for booking</span>
            <span className="block text-xs text-muted-foreground">
              Residents can book this facility when available.
            </span>
          </span>
        </label>

        <Button type="submit" className="font-bold">
          Create facility
        </Button>
      </form>
    </div>
  );
}
