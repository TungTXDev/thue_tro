import { Request, Response } from "express";
import { Order } from "../models/order.model";
import { Room } from "../models/room.model";
import { Coupon } from "../models/coupon.model";
import { sendSuccess, sendError } from "../utils/response";

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalRooms = await Room.countDocuments({ status: { $ne: "deleted" } });
    const totalCoupons = await Coupon.countDocuments();

    // Calculate total revenue
    const orders = await Order.find();
    const totalRevenue = orders.reduce((sum, order) => sum + (order.pricePaid || 0), 0);

    // Get recent orders
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5);

    sendSuccess(res, "Lấy thống kê dashboard thành công", {
      totalRevenue,
      totalOrders,
      totalRooms,
      totalCoupons,
      recentOrders,
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    sendError(res, "Lỗi máy chủ khi lấy thống kê dashboard", null, 500);
  }
};

export const getRevenue = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await Order.find();
    const totalRevenue = orders.reduce((sum, order) => sum + (order.pricePaid || 0), 0);

    // Optionally group by date (simple approach)
    const revenueByDate: Record<string, number> = {};
    orders.forEach(order => {
      const dateStr = order.createdAt.toISOString().split('T')[0];
      if (!revenueByDate[dateStr]) revenueByDate[dateStr] = 0;
      revenueByDate[dateStr] += order.pricePaid || 0;
    });

    sendSuccess(res, "Lấy doanh thu thành công", {
      totalRevenue,
      revenueByDate,
    });
  } catch (error) {
    console.error("Get revenue error:", error);
    sendError(res, "Lỗi máy chủ khi lấy doanh thu", null, 500);
  }
};
