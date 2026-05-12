import { Request, Response } from "express";
import { Order } from "../models/order.model";
import { sendSuccess, sendError } from "../utils/response";

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      roomId,
      roomName,
      originalPrice,
      discount,
      couponCode,
      pricePaid,
      paymentMethod,
    } = req.body;

    if (!roomName || originalPrice === undefined || pricePaid === undefined || !paymentMethod) {
      sendError(res, "Thiếu thông tin bắt buộc để tạo đơn hàng", null, 400);
      return;
    }

    let userId = undefined;
    let userName = "Khách hàng ẩn danh";

    if (req.user) {
      userId = req.user._id;
      userName = req.user.name;
    }

    const order = await Order.create({
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

    sendSuccess(res, "Tạo đơn hàng thành công", { order }, 201);
  } catch (error) {
    console.error("Create order error:", error);
    sendError(res, "Lỗi máy chủ khi tạo đơn hàng", null, 500);
  }
};

export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    sendSuccess(res, "Lấy danh sách đơn hàng thành công", { orders });
  } catch (error) {
    console.error("Get orders error:", error);
    sendError(res, "Lỗi máy chủ khi lấy danh sách đơn hàng", null, 500);
  }
};

export const clearOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    await Order.deleteMany({});
    sendSuccess(res, "Đã xóa toàn bộ lịch sử đơn hàng thành công", null);
  } catch (error) {
    console.error("Clear orders error:", error);
    sendError(res, "Lỗi máy chủ khi xóa lịch sử đơn hàng", null, 500);
  }
};
