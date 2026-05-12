"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCoupon = exports.toggleCoupon = exports.applyCoupon = exports.createCoupon = exports.getCoupons = void 0;
const coupon_model_1 = require("../models/coupon.model");
const response_1 = require("../utils/response");
const getCoupons = async (req, res) => {
    try {
        const coupons = await coupon_model_1.Coupon.find().sort({ createdAt: -1 });
        (0, response_1.sendSuccess)(res, "Lấy danh sách mã giảm giá thành công", { coupons });
    }
    catch (error) {
        console.error("Get coupons error:", error);
        (0, response_1.sendError)(res, "Lỗi máy chủ khi lấy danh sách mã giảm giá", null, 500);
    }
};
exports.getCoupons = getCoupons;
const createCoupon = async (req, res) => {
    try {
        const { code, value } = req.body;
        if (!code || !value || value <= 0) {
            (0, response_1.sendError)(res, "Vui lòng nhập mã hợp lệ và giá trị lớn hơn 0", null, 400);
            return;
        }
        const upperCode = code.toUpperCase();
        const existingCoupon = await coupon_model_1.Coupon.findOne({ code: upperCode });
        if (existingCoupon) {
            (0, response_1.sendError)(res, "Mã giảm giá đã tồn tại", null, 400);
            return;
        }
        const coupon = await coupon_model_1.Coupon.create({
            code: upperCode,
            value,
            active: true,
        });
        (0, response_1.sendSuccess)(res, "Tạo mã giảm giá thành công", { coupon }, 201);
    }
    catch (error) {
        console.error("Create coupon error:", error);
        (0, response_1.sendError)(res, "Lỗi máy chủ khi tạo mã giảm giá", null, 500);
    }
};
exports.createCoupon = createCoupon;
const applyCoupon = async (req, res) => {
    try {
        const { code, roomPrice } = req.body;
        if (!code || !roomPrice) {
            (0, response_1.sendError)(res, "Thiếu mã giảm giá hoặc giá phòng", null, 400);
            return;
        }
        const upperCode = code.toUpperCase();
        const coupon = await coupon_model_1.Coupon.findOne({ code: upperCode });
        if (!coupon) {
            (0, response_1.sendError)(res, "Mã giảm giá không tồn tại", null, 404);
            return;
        }
        if (!coupon.active) {
            (0, response_1.sendError)(res, "Mã giảm giá đã hết hạn hoặc không hoạt động", null, 400);
            return;
        }
        let finalPrice = roomPrice - coupon.value;
        if (finalPrice < 0)
            finalPrice = 0;
        let userName = "Khách hàng ẩn danh";
        if (req.user) {
            userName = req.user.name;
        }
        (0, response_1.sendSuccess)(res, "Áp dụng mã giảm giá thành công", {
            discount: coupon.value,
            finalPrice,
            userName,
        });
    }
    catch (error) {
        console.error("Apply coupon error:", error);
        (0, response_1.sendError)(res, "Lỗi máy chủ khi áp dụng mã giảm giá", null, 500);
    }
};
exports.applyCoupon = applyCoupon;
const toggleCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const coupon = await coupon_model_1.Coupon.findById(id);
        if (!coupon) {
            (0, response_1.sendError)(res, "Mã giảm giá không tồn tại", null, 404);
            return;
        }
        coupon.active = !coupon.active;
        await coupon.save();
        (0, response_1.sendSuccess)(res, `Đã ${coupon.active ? 'bật' : 'tắt'} mã giảm giá`, { coupon });
    }
    catch (error) {
        console.error("Toggle coupon error:", error);
        (0, response_1.sendError)(res, "Lỗi máy chủ khi thay đổi trạng thái mã giảm giá", null, 500);
    }
};
exports.toggleCoupon = toggleCoupon;
const deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const coupon = await coupon_model_1.Coupon.findByIdAndDelete(id);
        if (!coupon) {
            (0, response_1.sendError)(res, "Mã giảm giá không tồn tại", null, 404);
            return;
        }
        (0, response_1.sendSuccess)(res, "Xóa mã giảm giá thành công", { coupon });
    }
    catch (error) {
        console.error("Delete coupon error:", error);
        (0, response_1.sendError)(res, "Lỗi máy chủ khi xóa mã giảm giá", null, 500);
    }
};
exports.deleteCoupon = deleteCoupon;
