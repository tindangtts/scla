import { requireAdmin } from "@/lib/auth";
import { getStaffById } from "@/lib/queries/admin-staff";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/layout/admin-page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateStaff } from "../../actions";

export const dynamic = "force-dynamic";

const ROLES = [
  { value: "admin", label: "Admin" },
  { value: "content_manager", label: "Content manager" },
  { value: "ticket_handler", label: "Ticket handler" },
  { value: "booking_manager", label: "Booking manager" },
  { value: "user_verifier", label: "User verifier" },
];

export default async function EditStaffPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const staffMember = await getStaffById(id);
  if (!staffMember) notFound();

  return (
    <div className="max-w-xl">
      <AdminPageHeader
        title={`Edit ${staffMember.name}`}
        description={staffMember.email}
        backHref="/admin/staff"
        backLabel="Staff"
      />

      <form
        action={updateStaff}
        className="rounded-2xl bg-card border border-card-border p-6 shadow-sm space-y-5"
      >
        <input type="hidden" name="staffId" value={staffMember.id} />

        <div className="space-y-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" name="name" type="text" required defaultValue={staffMember.name} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="role">Role</Label>
          <select
            id="role"
            name="role"
            required
            defaultValue={staffMember.role}
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border bg-muted/40 cursor-pointer hover:bg-muted transition-colors">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            defaultChecked={staffMember.isActive}
            className="h-4 w-4 rounded border-input accent-primary"
          />
          <span>
            <span className="block text-sm font-bold">Active</span>
            <span className="block text-xs text-muted-foreground">
              Inactive accounts cannot sign in to the admin portal.
            </span>
          </span>
        </label>

        <Button type="submit" className="font-bold">
          Update staff
        </Button>
      </form>
    </div>
  );
}
