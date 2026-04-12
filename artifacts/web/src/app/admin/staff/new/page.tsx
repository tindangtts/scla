import { requireAdmin } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createStaff } from "../actions";

export const dynamic = "force-dynamic";

const ROLES = [
  { value: "admin", label: "Admin" },
  { value: "content_manager", label: "Content Manager" },
  { value: "ticket_handler", label: "Ticket Handler" },
  { value: "booking_manager", label: "Booking Manager" },
  { value: "user_verifier", label: "User Verifier" },
];

export default async function NewStaffPage() {
  await requireAdmin();

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/staff" className="text-blue-600 hover:underline text-sm">
          &larr; Back to Staff
        </Link>
        <h2 className="text-2xl font-bold">New Staff Member</h2>
      </div>

      <form action={createStaff} className="max-w-md space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            name="name"
            required
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            required
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            name="password"
            required
            minLength={6}
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Role</label>
          <select
            name="role"
            required
            className="w-full px-3 py-2 border rounded-md text-sm"
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <Button type="submit">Create Staff</Button>
      </form>
    </div>
  );
}
