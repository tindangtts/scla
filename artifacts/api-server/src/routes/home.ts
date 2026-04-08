import { Router } from "express";
import { db } from "@workspace/db";
import { invoicesTable, ticketsTable, announcementsTable, promotionsTable, notificationsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import * as jwt from "../lib/jwt.js";

const router = Router();

function getAuth(req: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return null;
  return jwt.verify(authHeader.slice(7));
}

router.get("/home-summary", async (req, res) => {
  const payload = getAuth(req);

  const [latestAnnouncement] = await db.select().from(announcementsTable)
    .orderBy(desc(announcementsTable.publishedAt)).limit(1);

  const [recentPromotion] = await db.select().from(promotionsTable)
    .orderBy(desc(promotionsTable.validFrom)).limit(1);

  if (!payload) {
    return res.json({
      userType: "guest",
      outstandingBalance: null,
      unpaidInvoiceCount: null,
      openTicketCount: 0,
      unitNumber: null,
      developmentName: null,
      walletBalance: null,
      latestAnnouncement: latestAnnouncement ? {
        id: latestAnnouncement.id,
        title: latestAnnouncement.title,
        content: latestAnnouncement.content,
        summary: latestAnnouncement.summary,
        type: latestAnnouncement.type,
        imageUrl: latestAnnouncement.imageUrl ?? null,
        publishedAt: latestAnnouncement.publishedAt.toISOString(),
        isPinned: latestAnnouncement.isPinned,
      } : null,
      recentPromotion: recentPromotion ? {
        id: recentPromotion.id,
        title: recentPromotion.title,
        description: recentPromotion.description,
        category: recentPromotion.category,
        imageUrl: recentPromotion.imageUrl ?? null,
        validFrom: recentPromotion.validFrom.toISOString(),
        validUntil: recentPromotion.validUntil?.toISOString() ?? null,
        isActive: recentPromotion.isActive,
        partnerName: recentPromotion.partnerName,
      } : null,
    });
  }

  const invoices = await db.select().from(invoicesTable).where(eq(invoicesTable.userId, payload.userId));
  const unpaidInvoices = invoices.filter(i => i.status === "unpaid" || i.status === "partially_paid");
  const outstandingBalance = unpaidInvoices.reduce((sum, i) =>
    sum + parseFloat(i.totalAmount as string) - parseFloat(i.paidAmount as string), 0);

  const tickets = await db.select().from(ticketsTable).where(eq(ticketsTable.userId, payload.userId));
  const openTickets = tickets.filter(t => t.status === "open" || t.status === "in_progress");

  return res.json({
    userType: "resident",
    outstandingBalance,
    unpaidInvoiceCount: unpaidInvoices.length,
    openTicketCount: openTickets.length,
    unitNumber: null,
    developmentName: null,
    walletBalance: 1250000,
    latestAnnouncement: latestAnnouncement ? {
      id: latestAnnouncement.id,
      title: latestAnnouncement.title,
      content: latestAnnouncement.content,
      summary: latestAnnouncement.summary,
      type: latestAnnouncement.type,
      imageUrl: latestAnnouncement.imageUrl ?? null,
      publishedAt: latestAnnouncement.publishedAt.toISOString(),
      isPinned: latestAnnouncement.isPinned,
    } : null,
    recentPromotion: recentPromotion ? {
      id: recentPromotion.id,
      title: recentPromotion.title,
      description: recentPromotion.description,
      category: recentPromotion.category,
      imageUrl: recentPromotion.imageUrl ?? null,
      validFrom: recentPromotion.validFrom.toISOString(),
      validUntil: recentPromotion.validUntil?.toISOString() ?? null,
      isActive: recentPromotion.isActive,
      partnerName: recentPromotion.partnerName,
    } : null,
  });
});

router.get("/notifications", async (req, res) => {
  const payload = getAuth(req);
  if (!payload) return res.json([]);

  const notifications = await db.select().from(notificationsTable)
    .where(eq(notificationsTable.userId, payload.userId))
    .orderBy(desc(notificationsTable.createdAt))
    .limit(20);

  return res.json(notifications.map(n => ({
    id: n.id,
    title: n.title,
    body: n.body,
    type: n.type,
    isRead: n.isRead,
    relatedId: n.relatedId ?? null,
    createdAt: n.createdAt.toISOString(),
  })));
});

export default router;
