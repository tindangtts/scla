import { Router } from "express";
import * as jwt from "../lib/jwt.js";

const router = Router();

function requireAuth(req: any, res: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return null;
  return jwt.verify(authHeader.slice(7));
}

router.get("/wallet", async (req, res) => {
  const payload = requireAuth(req, res);
  if (!payload) return res.status(401).json({ error: "unauthorized" });

  return res.json({
    balance: 1250000,
    transactions: [
      { id: "wt1", type: "credit", amount: 500000, description: "Refund - Overpayment April", date: "2026-04-01T10:00:00Z", balance: 1250000 },
      { id: "wt2", type: "debit", amount: 250000, description: "Applied to Invoice INV-2026-03-001", date: "2026-03-15T09:30:00Z", balance: 750000 },
      { id: "wt3", type: "credit", amount: 1000000, description: "Payment via KBZPay", date: "2026-03-01T11:00:00Z", balance: 1000000 },
    ],
  });
});

router.get("/deposit", async (req, res) => {
  const payload = requireAuth(req, res);
  if (!payload) return res.status(401).json({ error: "unauthorized" });

  return res.json({
    balance: 5000000,
    transactions: [
      { id: "dt1", type: "credit", amount: 5000000, description: "Initial security deposit - City Loft A-12-03", date: "2023-01-15T08:00:00Z" },
    ],
  });
});

export default router;
