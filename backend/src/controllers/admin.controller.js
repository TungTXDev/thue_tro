"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRevenue = exports.getDashboardStats = void 0;
const order_model_1 = require("../models/order.model");
const room_model_1 = require("../models/room.model");
const coupon_model_1 = require("../models/coupon.model");
const response_1 = require("../utils/response");
const getDashboardStats = async (req, res) => {
    try {
        const totalOrders = await order_model_1.Order.countDocuments();
        const totalRooms = await room_model_1.Room.countDocuments({ status: { $ne: "deleted" } });
        const totalCoupons = await coupon_model_1.Coupon.countDocuments();
        // Calculate total revenue
        const orders = await order_model_1.Order.find();
        const totalRevenue = orders.reduce((sum, order) => sum + (order.pricePaid || 0), 0);
        // Get recent orders
        const recentOrders = await order_model_1.Order.find().sort({ createdAt: -1 }).limit(5);
        (0, response_1.sendSuccess)(res, "Lấy thống kê dashboard thành công", {
            totalRevenue,
            totalOrders,
            totalRooms,
            totalCoupons,
            recentOrders,
        });
    }
    catch (error) {
        console.error("Get dashboard stats error:", error);
        (0, response_1.sendError)(res, "Lỗi máy chủ khi lấy thống kê dashboard", null, 500);
    }
};
exports.getDashboardStats = getDashboardStats;
const getRevenue = async (req, res) => {
    try {
        const orders = await order_model_1.Order.find();
        const totalRevenue = orders.reduce((sum, order) => sum + (order.pricePaid || 0), 0);
        // Optionally group by date (simple approach)
        const revenueByDate = {};
        orders.forEach(order => {
            const dateStr = order.createdAt.toISOString().split('T')[0];
            if (!revenueByDate[dateStr])
                revenueByDate[dateStr] = 0;
            revenueByDate[dateStr] += order.pricePaid || 0;
        });
        (0, response_1.sendSuccess)(res, "Lấy doanh thu thành công", {
            totalRevenue,
            revenueByDate,
        });
    }
    catch (error) {
        console.error("Get revenue error:", error);
        (0, response_1.sendError)(res, "Lỗi máy chủ khi lấy doanh thu", null, 500);
    }
};
exports.getRevenue = getRevenue;
