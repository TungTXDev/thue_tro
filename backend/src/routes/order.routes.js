"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controller_1 = require("../controllers/order.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Public route (optional auth)
router.post("/", auth_middleware_1.optionalAuth, order_controller_1.createOrder);
// Admin routes
router.use(auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin);
router.get("/", order_controller_1.getOrders);
router.delete("/clear", order_controller_1.clearOrders);
exports.default = router;
