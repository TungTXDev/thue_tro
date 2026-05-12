"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearOrders = exports.getOrders = exports.createOrder = void 0;
const order_model_1 = require("../models/order.model");
const response_1 = require("../utils/response");
const createOrder = async (req, res) => {
    try {
        const { roomId, roomName, originalPrice, discount, couponCode, pricePaid, paymentMethod, } = req.body;
        if (!roomName || originalPrice === undefined || pricePaid === undefined || !paymentMethod) {
            (0, response_1.sendError)(res, "Thiếu thông tin bắt buộc để tạo đơn hàng", null, 400);
            return;
        }
        let userId = undefined;
        let userName = "Khách hàng ẩn danh";
        if (req.user) {
            userId = req.user._id;
            userName = req.user.name;
        }
        const order = await order_model_1.Order.create({
            userId,
            userName,
            roomId,
            roomName,
            originalPrice,
            discount,
            couponCode,
            pricePaid,
            paymentMethod,
            status: "pending", // Default status, could be success depending on payment method
        });
        (0, response_1.sendSuccess)(res, "Tạo đơn hàng thành công", { order }, 201);
    }
    catch (error) {
        console.error("Create order error:", error);
        (0, response_1.sendError)(res, "Lỗi máy chủ khi tạo đơn hàng", null, 500);
    }
};
exports.createOrder = createOrder;
const getOrders = async (req, res) => {
    try {
        const orders = await order_model_1.Order.find().sort({ createdAt: -1 });
        (0, response_1.sendSuccess)(res, "Lấy danh sách đơn hàng thành công", { orders });
    }
    catch (error) {
        console.error("Get orders error:", error);
        (0, response_1.sendError)(res, "Lỗi máy chủ khi lấy danh sách đơn hàng", null, 500);
    }
};
exports.getOrders = getOrders;
const clearOrders = async (req, res) => {
    try {
        await order_model_1.Order.deleteMany({});
        (0, response_1.sendSuccess)(res, "Đã xóa toàn bộ lịch sử đơn hàng thành công", null);
    }
    catch (error) {
        console.error("Clear orders error:", error);
        (0, response_1.sendError)(res, "Lỗi máy chủ khi xóa lịch sử đơn hàng", null, 500);
    }
};
exports.clearOrders = clearOrders;
