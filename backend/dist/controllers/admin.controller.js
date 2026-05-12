const { Order } = require("../models/order.model");
const { Room } = require("../models/room.model");
const { Coupon } = require("../models/coupon.model");
const { User } = require("../models/user.model");
const { sendSuccess, sendError } = require("../utils/response");

const getDashboardStats = async (req, res) => {
  try {
    const [totalOrders, totalRooms, totalCoupons, totalUsers, orders, recentOrders] = await Promise.all([
      Order.countDocuments(),
      Room.countDocuments({ status: { $ne: "deleted" } }),
      Coupon.countDocuments(),
      User.countDocuments(),
      Order.find(),
      Order.find().sort({ createdAt: -1 }).limit(5),
    ]);

    const totalRevenue = orders.reduce((sum, order) => sum + (order.pricePaid || 0), 0);

    return sendSuccess(res, "Dashboard stats fetched successfully", {
      totalRevenue,
      totalOrders,
      totalRooms,
      totalCoupons,
      totalUsers,
      recentOrders,
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    return sendError(res, "Server error while fetching dashboard stats", null, 500);
  }
};

const getRevenue = async (req, res) => {
  try {
    const orders = await Order.find();
    const totalRevenue = orders.reduce((sum, order) => sum + (order.pricePaid || 0), 0);
    const revenueByDate = {};

    orders.forEach((order) => {
      const date = order.createdAt.toISOString().split("T")[0];
      revenueByDate[date] = (revenueByDate[date] || 0) + (order.pricePaid || 0);
    });

    return sendSuccess(res, "Revenue fetched successfully", { totalRevenue, revenueByDate });
  } catch (error) {
    console.error("Get revenue error:", error);
    return sendError(res, "Server error while fetching revenue", null, 500);
  }
};

module.exports = { getDashboardStats, getRevenue };
