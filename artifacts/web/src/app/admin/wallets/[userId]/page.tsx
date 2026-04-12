import { requireAdmin } from "@/lib/auth";
import { getResidentWalletDetail } from "@/lib/queries/admin-wallets";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { adjustWallet } from "../actions";

export const dynamic = "force-dynamic";

export default async function WalletDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  await requireAdmin();
  const { userId } = await params;
  const { user, balance, recentTransactions } = await getResidentWalletDetail(userId);

  if (!user) {
    notFound();
  }

  const formattedBalance = parseFloat(balance).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/wallets" className="text-blue-600 hover:underline text-sm">
          &larr; Back to Wallets
        </Link>
        <h2 className="text-2xl font-bold">Wallet: {user.name}</h2>
      </div>

      <p className="text-sm text-muted-foreground mb-4">{user.email}</p>

      {/* Balance Card */}
      <div className="border rounded-lg p-6 mb-6">
        <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
        <p className="text-3xl font-bold">{formattedBalance} MMK</p>
      </div>

      {/* Adjustment Form */}
      <div className="border rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Adjust Wallet</h3>
        <form action={adjustWallet} className="space-y-4">
          <input type="hidden" name="userId" value={userId} />

          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select name="type" required className="w-full px-3 py-2 border rounded-md text-sm">
              <option value="credit">Credit</option>
              <option value="debit">Debit</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Amount</label>
            <input
              type="number"
              name="amount"
              required
              step="0.01"
              min="0.01"
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <input
              type="text"
              name="description"
              required
              placeholder="e.g. Monthly allowance, Penalty charge"
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Reason (optional)</label>
            <input
              type="text"
              name="reason"
              placeholder="Internal note"
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>

          <Button type="submit">Submit Adjustment</Button>
        </form>
      </div>

      {/* Recent Transactions */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
        {recentTransactions.length === 0 ? (
          <p className="text-muted-foreground">No transactions found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2 px-3 font-medium">Date</th>
                  <th className="py-2 px-3 font-medium">Type</th>
                  <th className="py-2 px-3 font-medium">Amount</th>
                  <th className="py-2 px-3 font-medium">Description</th>
                  <th className="py-2 px-3 font-medium">Reason</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((tx) => (
                  <tr key={tx.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-3 whitespace-nowrap">{tx.createdAt.toLocaleString()}</td>
                    <td className="py-2 px-3">
                      <Badge variant={tx.type === "credit" ? "default" : "destructive"}>
                        {tx.type === "credit" ? "Credit" : "Debit"}
                      </Badge>
                    </td>
                    <td className="py-2 px-3">
                      {parseFloat(tx.amount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="py-2 px-3">{tx.description}</td>
                    <td className="py-2 px-3">{tx.reason || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
