"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const order_controller_1 = require("../controllers/order.controller");
const coupon_controller_1 = require("../controllers/coupon.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// All admin routes require auth and admin role
router.use(auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin);
router.get("/dashboard", admin_controller_1.getDashboardStats);
router.get("/revenue", admin_controller_1.getRevenue);
router.get("/orders", order_controller_1.getOrders);
router.get("/coupons", coupon_controller_1.getCoupons);
exports.default = router;
