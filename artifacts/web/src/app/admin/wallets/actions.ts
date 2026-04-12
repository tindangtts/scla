"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { walletTransactionsTable, auditLogsTable } from "@workspace/db/schema";

export async function adjustWallet(formData: FormData) {
  const { staff } = await requireAdmin();

  const userId = formData.get("userId") as string;
  const type = formData.get("type") as "credit" | "debit";
  const amountStr = formData.get("amount") as string;
  const description = formData.get("description") as string;
  const reason = (formData.get("reason") as string) || null;

  if (!userId || !type || !amountStr || !description) return;
  if (type !== "credit" && type !== "debit") return;

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) return;

  await db.insert(walletTransactionsTable).values({
    userId,
    type,
    amount: amountStr,
    description,
    reason,
    category: "admin_adjustment",
    reference: `ADJ-${Date.now()}`,
  });

  await db.insert(auditLogsTable).values({
    actorId: staff.id,
    actorEmail: staff.email,
    action: "wallet_adjust",
    targetType: "user",
    targetId: userId,
    metadata: { type, amount: amountStr, description, reason },
  });

  revalidatePath(`/admin/wallets/${userId}`);
}
