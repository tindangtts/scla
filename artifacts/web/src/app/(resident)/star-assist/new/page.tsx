import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TicketForm } from "./ticket-form";

export default function NewTicketPage() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">New Star Assist Ticket</h1>
      <Card>
        <CardHeader>
          <CardTitle>Submit a Maintenance Request</CardTitle>
        </CardHeader>
        <CardContent>
          <TicketForm />
        </CardContent>
      </Card>
    </div>
  );
}
