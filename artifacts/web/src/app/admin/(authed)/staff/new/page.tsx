import { requireAdmin } from "@/lib/auth";
import { AdminPageHeader } from "@/components/layout/admin-page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createStaff } from "../actions";

export const dynamic = "force-dynamic";

const ROLES = [
  { value: "admin", label: "Admin" },
  { value: "content_manager", label: "Content manager" },
  { value: "ticket_handler", label: "Ticket handler" },
  { value: "booking_manager", label: "Booking manager" },
  { value: "user_verifier", label: "User verifier" },
];

export default async function NewStaffPage() {
  await requireAdmin();

  return (
    <div className="max-w-xl">
      <AdminPageHeader
        title="New staff member"
        backHref="/admin/staff"
        backLabel="Staff"
      />

      <form
        action={createStaff}
        className="rounded-2xl bg-card border border-card-border p-6 shadow-sm space-y-5"
      >
        <div className="space-y-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" name="name" type="text" autoComplete="name" required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="role">Role</Label>
          <select
            id="role"
            name="role"
            required
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <Button type="submit" className="font-bold">
          Create staff
        </Button>
      </form>
    </div>
  );
}
