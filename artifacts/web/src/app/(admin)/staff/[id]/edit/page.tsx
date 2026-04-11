import { requireAdmin } from "@/lib/auth";
import { getStaffById } from "@/lib/queries/admin-staff";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { updateStaff } from "../../actions";

export const dynamic = "force-dynamic";

const ROLES = [
  { value: "admin", label: "Admin" },
  { value: "content_manager", label: "Content Manager" },
  { value: "ticket_handler", label: "Ticket Handler" },
  { value: "booking_manager", label: "Booking Manager" },
  { value: "user_verifier", label: "User Verifier" },
];

export default async function EditStaffPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const staffMember = await getStaffById(id);

  if (!staffMember) {
    notFound();
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/staff" className="text-blue-600 hover:underline text-sm">
          &larr; Back to Staff
        </Link>
        <h2 className="text-2xl font-bold">Edit Staff: {staffMember.name}</h2>
      </div>

      <form action={updateStaff} className="max-w-md space-y-4">
        <input type="hidden" name="staffId" value={staffMember.id} />

        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            name="name"
            required
            defaultValue={staffMember.name}
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Role</label>
          <select
            name="role"
            required
            defaultValue={staffMember.role}
            className="w-full px-3 py-2 border rounded-md text-sm"
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isActive"
            id="isActive"
            defaultChecked={staffMember.isActive}
            className="rounded"
          />
          <label htmlFor="isActive" className="text-sm font-medium">
            Active
          </label>
        </div>

        <Button type="submit">Update Staff</Button>
      </form>
    </div>
  );
}
