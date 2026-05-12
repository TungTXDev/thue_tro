const { Coupon } = require("../models/coupon.model");
const { sendSuccess, sendError } = require("../utils/response");

const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return sendSuccess(res, "Coupons fetched successfully", { coupons });
  } catch (error) {
    console.error("Get coupons error:", error);
    return sendError(res, "Server error while fetching coupons", null, 500);
  }
};

const createCoupon = async (req, res) => {
  try {
    const { code, value, usageLimit, expiryDate } = req.body;
    const discountValue = Number(value);

    if (!code || !discountValue || discountValue <= 0) {
      return sendError(res, "Please enter a valid code and discount value", null, 400);
    }

    const upperCode = code.toUpperCase();
    const existingCoupon = await Coupon.findOne({ code: upperCode });
    if (existingCoupon) {
      return sendError(res, "Coupon already exists", null, 400);
    }

    const coupon = await Coupon.create({
      code: upperCode,
      value: discountValue,
      usageLimit,
      expiryDate,
      active: true,
    });

    return sendSuccess(res, "Coupon created successfully", { coupon }, 201);
  } catch (error) {
    console.error("Create coupon error:", error);
    return sendError(res, "Server error while creating coupon", null, 500);
  }
};

const applyCoupon = async (req, res) => {
  try {
    const { code, roomPrice } = req.body;
    const price = Number(roomPrice);

    if (!code || !price) {
      return sendError(res, "Coupon code and room price are required", null, 400);
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (!coupon) {
      return sendError(res, "Coupon does not exist", null, 404);
    }

    if (!coupon.active || (coupon.expiryDate && coupon.expiryDate < new Date())) {
      return sendError(res, "Coupon is expired or inactive", null, 400);
    }

    const finalPrice = Math.max(price - coupon.value, 0);
    return sendSuccess(res, "Coupon applied successfully", {
      discount: coupon.value,
      finalPrice,
      userName: req.user ? req.user.name : "Guest",
    });
  } catch (error) {
    console.error("Apply coupon error:", error);
    return sendError(res, "Server error while applying coupon", null, 500);
  }
};

const toggleCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return sendError(res, "Coupon not found", null, 404);
    }

    coupon.active = !coupon.active;
    await coupon.save();

    return sendSuccess(res, "Coupon status updated successfully", { coupon });
  } catch (error) {
    console.error("Toggle coupon error:", error);
    return sendError(res, "Server error while updating coupon status", null, 500);
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return sendError(res, "Coupon not found", null, 404);
    }

    return sendSuccess(res, "Coupon deleted successfully", { coupon });
  } catch (error) {
    console.error("Delete coupon error:", error);
    return sendError(res, "Server error while deleting coupon", null, 500);
  }
};

module.exports = { getCoupons, createCoupon, applyCoupon, toggleCoupon, deleteCoupon };
