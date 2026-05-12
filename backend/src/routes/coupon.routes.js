"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const coupon_controller_1 = require("../controllers/coupon.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Public routes (with optional auth)
router.post("/apply", auth_middleware_1.optionalAuth, coupon_controller_1.applyCoupon);
// Admin routes
router.use(auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin);
router.get("/", coupon_controller_1.getCoupons);
router.post("/", coupon_controller_1.createCoupon);
router.patch("/:id/toggle", coupon_controller_1.toggleCoupon);
router.delete("/:id", coupon_controller_1.deleteCoupon);
exports.default = router;
