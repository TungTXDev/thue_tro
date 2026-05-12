import { Router } from "express";
import {
  createOrder,
  getOrders,
  clearOrders,
} from "../controllers/order.controller";
import { requireAuth, requireAdmin, optionalAuth } from "../middlewares/auth.middleware";

const router = Router();

// Public route (optional auth)
router.post("/", optionalAuth, createOrder);

// Admin routes
router.use(requireAuth, requireAdmin);
router.get("/", getOrders);
router.delete("/clear", clearOrders);

export default router;
