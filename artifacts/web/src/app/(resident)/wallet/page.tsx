import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { usersTable } from "@workspace/db/schema";
import { walletTransactionsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { getWalletBalance, getWalletTransactions } from "@/lib/queries/wallet";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

function formatMMK(amount: string | number) {
  return Number(amount).toLocaleString() + " MMK";
}

export default async function WalletPage() {
  const user = await requireAuth();

  const dbUsers = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, user.email!))
    .limit(1);

  const dbUser = dbUsers[0];
  if (!dbUser) {
    return (
      <div className="p-4">
        <p className="text-muted-foreground">User account not found.</p>
      </div>
    );
  }

  const balance = await getWalletBalance(dbUser.id);
  const transactions = await getWalletTransactions(dbUser.id);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Wallet</h2>

      {/* Balance Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Current Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{formatMMK(balance)}</p>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No transactions yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {transactions.map((tx) => (
                <li
                  key={tx.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        tx.type === "credit" ? "default" : "destructive"
                      }
                      className={
                        tx.type === "credit"
                          ? "bg-green-100 text-green-800 hover:bg-green-100"
                          : ""
                      }
                    >
                      {tx.type}
                    </Badge>
                    <span
                      className={`text-sm font-semibold ${tx.type === "credit" ? "text-green-600" : "text-red-600"}`}
                    >
                      {tx.type === "credit" ? "+" : "-"}
                      {formatMMK(tx.amount)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
