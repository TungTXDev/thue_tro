const { Router } = require("express");
const { createOrder, getOrders, clearOrders } = require("../controllers/order.controller");
const { requireAuth, requireAdmin, requireLandlord, optionalAuth } = require("../middlewares/auth.middleware");

const router = Router();

router.post("/", optionalAuth, createOrder);
router.get("/", requireAuth, requireLandlord, getOrders);
router.delete("/clear", requireAuth, requireAdmin, clearOrders);

module.exports = router;
