const { Router } = require("express");
const {
  getCoupons,
  createCoupon,
  applyCoupon,
  toggleCoupon,
  deleteCoupon,
} = require("../controllers/coupon.controller");
const { requireAuth, requireAdmin, optionalAuth } = require("../middlewares/auth.middleware");

const router = Router();

router.post("/apply", optionalAuth, applyCoupon);

router.use(requireAuth, requireAdmin);
router.get("/", getCoupons);
router.post("/", createCoupon);
router.patch("/:id/toggle", toggleCoupon);
router.delete("/:id", deleteCoupon);

module.exports = router;
