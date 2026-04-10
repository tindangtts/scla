import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import announcementsRouter from "./announcements";
import promotionsRouter from "./promotions";
import invoicesRouter from "./invoices";
import walletRouter from "./wallet";
import ticketsRouter from "./tickets";
import facilitiesRouter from "./facilities";
import bookingsRouter from "./bookings";
import infoRouter from "./info";
import homeRouter from "./home";
import adminRouter from "./admin";
import pushRouter from "./push";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/announcements", announcementsRouter);
router.use("/promotions", promotionsRouter);
router.use("/invoices", invoicesRouter);
router.use(walletRouter);
router.use("/tickets", ticketsRouter);
router.use("/facilities", facilitiesRouter);
router.use("/bookings", bookingsRouter);
router.use(infoRouter);
router.use(homeRouter);
router.use("/push", pushRouter);
router.use("/admin", adminRouter);

export default router;
