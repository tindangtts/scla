import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendBillOverdueEmail(
  to: string,
  userName: string,
  invoiceNumber: string,
  amount: number,
) {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not configured, skipping email");
    return;
  }

  await resend.emails.send({
    from: "Star City Living <noreply@starcityliving.com>",
    to,
    subject: `Bill Overdue: ${invoiceNumber}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1e40af;">Bill Payment Reminder</h2>
        <p>Dear ${userName},</p>
        <p>Your invoice <strong>${invoiceNumber}</strong> for <strong>MMK ${amount.toLocaleString()}</strong> is overdue. Please log in to make payment.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://starcityliving.com"}/bills"
           style="display: inline-block; margin-top: 16px; padding: 10px 20px; background: #1e40af; color: white; text-decoration: none; border-radius: 6px;">
          View Bills
        </a>
        <p style="margin-top: 24px; color: #6b7280; font-size: 12px;">Star City Living Management</p>
      </div>
    `,
  });
}

export async function sendTicketUpdateEmail(
  to: string,
  userName: string,
  ticketNumber: string,
  newStatus: string,
) {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not configured, skipping email");
    return;
  }

  await resend.emails.send({
    from: "Star City Living <noreply@starcityliving.com>",
    to,
    subject: `Ticket Update: ${ticketNumber}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1e40af;">Ticket Status Update</h2>
        <p>Dear ${userName},</p>
        <p>Your ticket <strong>${ticketNumber}</strong> status has been updated to <strong>${newStatus}</strong>.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://starcityliving.com"}/star-assist"
           style="display: inline-block; margin-top: 16px; padding: 10px 20px; background: #1e40af; color: white; text-decoration: none; border-radius: 6px;">
          View Tickets
        </a>
        <p style="margin-top: 24px; color: #6b7280; font-size: 12px;">Star City Living Management</p>
      </div>
    `,
  });
}
