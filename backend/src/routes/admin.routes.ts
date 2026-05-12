import { Router } from "express";
import { getDashboardStats, getRevenue } from "../controllers/admin.controller";
import { getOrders } from "../controllers/order.controller";
import { getCoupons } from "../controllers/coupon.controller";
import { requireAuth, requireAdmin } from "../middlewares/auth.middleware";

const router = Router();

// All admin routes require auth and admin role
router.use(requireAuth, requireAdmin);

router.get("/dashboard", getDashboardStats);
router.get("/revenue", getRevenue);
router.get("/orders", getOrders);
router.get("/coupons", getCoupons);

export default router;
