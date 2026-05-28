import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import customersRouter from "./customers";
import servicesRouter from "./services";
import bookingsRouter from "./bookings";
import itemsRouter from "./items";
import paymentsRouter from "./payments";
import notificationsRouter from "./notifications";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(customersRouter);
router.use(servicesRouter);
router.use(bookingsRouter);
router.use(itemsRouter);
router.use(paymentsRouter);
router.use(notificationsRouter);
router.use(dashboardRouter);

export default router;
