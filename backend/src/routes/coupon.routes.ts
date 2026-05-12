import { Router } from "express";
import {
  getCoupons,
  createCoupon,
  applyCoupon,
  toggleCoupon,
  deleteCoupon,
} from "../controllers/coupon.controller";
import { requireAuth, requireAdmin, optionalAuth } from "../middlewares/auth.middleware";

const router = Router();

// Public routes (with optional auth)
router.post("/apply", optionalAuth, applyCoupon);

// Admin routes
router.use(requireAuth, requireAdmin);
router.get("/", getCoupons);
router.post("/", createCoupon);
router.patch("/:id/toggle", toggleCoupon);
router.delete("/:id", deleteCoupon);

export default router;
