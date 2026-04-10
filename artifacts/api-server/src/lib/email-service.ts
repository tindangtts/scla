import { Resend } from "resend";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger.js";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_ADDRESS = process.env.EMAIL_FROM ?? "SCLA <notifications@starcity.com.mm>";

let resend: Resend | null = null;
if (RESEND_API_KEY) {
  resend = new Resend(RESEND_API_KEY);
}

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!resend) {
    logger.warn("RESEND_API_KEY not configured — email skipped");
    return;
  }
  try {
    await resend.emails.send({ from: FROM_ADDRESS, to, subject, html });
  } catch (err) {
    logger.error({ err, to, subject }, "Failed to send email");
  }
}

// ─── Email helpers ─────────────────────────────────────────────────────────────

function sclaEmailTemplate(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0d9488,#0f766e);padding:24px 32px;">
            <h1 style="margin:0;color:#fff;font-size:20px;font-weight:700;letter-spacing:-0.3px;">
              Star City Living
            </h1>
            <p style="margin:4px 0 0;color:rgba(255,255,255,0.75);font-size:13px;">Resident Notification</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            ${bodyHtml}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f1f5f9;padding:16px 32px;border-top:1px solid #e2e8f0;">
            <p style="margin:0;font-size:12px;color:#94a3b8;">
              You received this email because you are a registered resident of StarCity Estate.
              To opt out of email notifications, visit your profile settings in the SCLA app.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/**
 * Send ticket status change email to the ticket owner.
 * Checks emailNotifications opt-out before sending.
 */
export async function sendTicketStatusEmail(
  userId: string,
  ticketNumber: string,
  ticketTitle: string,
  newStatus: string
): Promise<void> {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user || !user.emailNotifications) return;

  const statusLabel: Record<string, string> = {
    completed: "Completed",
    closed: "Closed",
    in_progress: "In Progress",
  };
  const label = statusLabel[newStatus] ?? newStatus;

  const bodyHtml = `
    <h2 style="margin:0 0 8px;font-size:18px;color:#0f172a;">Ticket Update: ${label}</h2>
    <p style="margin:0 0 16px;color:#475569;font-size:15px;">
      Your maintenance ticket has been updated.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:8px;padding:16px;margin-bottom:24px;">
      <tr><td style="padding:4px 0;"><span style="color:#94a3b8;font-size:13px;">Ticket Number</span></td><td style="padding:4px 0;text-align:right;font-weight:600;color:#0f172a;font-size:13px;">${ticketNumber}</td></tr>
      <tr><td style="padding:4px 0;"><span style="color:#94a3b8;font-size:13px;">Title</span></td><td style="padding:4px 0;text-align:right;font-weight:600;color:#0f172a;font-size:13px;">${ticketTitle}</td></tr>
      <tr><td style="padding:4px 0;"><span style="color:#94a3b8;font-size:13px;">Status</span></td><td style="padding:4px 0;text-align:right;"><span style="background:#d1fae5;color:#065f46;font-weight:700;font-size:12px;padding:2px 8px;border-radius:4px;">${label}</span></td></tr>
    </table>
    <p style="margin:0;color:#475569;font-size:14px;">Log in to the SCLA app to view full details and chat with our maintenance team.</p>
  `;

  await sendEmail(
    user.email,
    `[SCLA] Ticket ${ticketNumber} — ${label}`,
    sclaEmailTemplate(`Ticket Update: ${ticketNumber}`, bodyHtml)
  );
}

/**
 * Send bill overdue email to a resident.
 * Call this from an invoice overdue check (scheduled or triggered).
 * Checks emailNotifications opt-out before sending.
 */
export async function sendBillOverdueEmail(
  userId: string,
  invoiceNumber: string,
  amountDue: string,
  dueDate: string
): Promise<void> {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user || !user.emailNotifications) return;

  const bodyHtml = `
    <h2 style="margin:0 0 8px;font-size:18px;color:#dc2626;">Invoice Overdue</h2>
    <p style="margin:0 0 16px;color:#475569;font-size:15px;">
      You have an overdue invoice that requires your attention.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;border-radius:8px;border:1px solid #fecaca;padding:16px;margin-bottom:24px;">
      <tr><td style="padding:4px 0;"><span style="color:#94a3b8;font-size:13px;">Invoice</span></td><td style="padding:4px 0;text-align:right;font-weight:600;color:#0f172a;font-size:13px;">${invoiceNumber}</td></tr>
      <tr><td style="padding:4px 0;"><span style="color:#94a3b8;font-size:13px;">Amount Due</span></td><td style="padding:4px 0;text-align:right;font-weight:700;color:#dc2626;font-size:14px;">MMK ${amountDue}</td></tr>
      <tr><td style="padding:4px 0;"><span style="color:#94a3b8;font-size:13px;">Due Date</span></td><td style="padding:4px 0;text-align:right;font-weight:600;color:#dc2626;font-size:13px;">${dueDate}</td></tr>
    </table>
    <p style="margin:0;color:#475569;font-size:14px;">Please log in to the SCLA app to pay your invoice and avoid late fees.</p>
  `;

  await sendEmail(
    user.email,
    `[SCLA] Invoice ${invoiceNumber} — Payment Overdue`,
    sclaEmailTemplate(`Invoice Overdue: ${invoiceNumber}`, bodyHtml)
  );
}
