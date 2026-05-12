const { Router } = require("express");
const { getDashboardStats, getRevenue } = require("../controllers/admin.controller");
const { getOrders } = require("../controllers/order.controller");
const { getCoupons } = require("../controllers/coupon.controller");
const { requireAuth, requireAdmin } = require("../middlewares/auth.middleware");

const router = Router();

router.use(requireAuth, requireAdmin);
router.get("/dashboard", getDashboardStats);
router.get("/revenue", getRevenue);
router.get("/orders", getOrders);
router.get("/coupons", getCoupons);

module.exports = router;
