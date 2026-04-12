"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { usersTable, invoicesTable, walletTransactionsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { getWalletBalance } from "@/lib/queries/wallet";

export async function payInvoice(
  prevState: { error?: string; success?: boolean; paymentMethod?: string; sessionId?: string },
  formData: FormData,
): Promise<{ error?: string; success?: boolean; paymentMethod?: string; sessionId?: string }> {
  const invoiceId = formData.get("invoiceId") as string;
  const paymentMethod = formData.get("paymentMethod") as string;
  if (!invoiceId) {
    return { error: "Invoice ID is required." };
  }

  const user = await requireAuth();

  const dbUsers = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, user.email!))
    .limit(1);

  const dbUser = dbUsers[0];
  if (!dbUser) {
    return { error: "User not found." };
  }

  // Fetch the invoice
  const invoices = await db
    .select()
    .from(invoicesTable)
    .where(and(eq(invoicesTable.id, invoiceId), eq(invoicesTable.userId, dbUser.id)))
    .limit(1);

  const invoice = invoices[0];
  if (!invoice) {
    return { error: "Invoice not found." };
  }

  if (invoice.status === "paid") {
    return { error: "This invoice has already been paid." };
  }

  // Compute wallet balance
  const balanceStr = await getWalletBalance(dbUser.id);
  const balance = Number(balanceStr);

  // Compute remaining amount
  const remainingAmount = Number(invoice.totalAmount) - Number(invoice.paidAmount);

  if (balance < remainingAmount) {
    return { error: "Insufficient wallet balance" };
  }

  // Create debit wallet transaction
  await db.insert(walletTransactionsTable).values({
    userId: dbUser.id,
    type: "debit",
    amount: remainingAmount.toFixed(2),
    description: "Payment for invoice " + invoice.invoiceNumber,
    reference: invoice.id,
    category: "payment",
  });

  // Update invoice to paid
  await db
    .update(invoicesTable)
    .set({
      paidAmount: invoice.totalAmount,
      status: "paid",
    })
    .where(eq(invoicesTable.id, invoiceId));

  revalidatePath("/bills");
  revalidatePath("/bills/" + invoiceId);
  revalidatePath("/wallet");
  revalidatePath("/");

  const sessionId = crypto.randomUUID();
  return { success: true, paymentMethod: paymentMethod || undefined, sessionId };
}
