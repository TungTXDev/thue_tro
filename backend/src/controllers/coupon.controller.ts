import { Request, Response } from "express";
import { Coupon } from "../models/coupon.model";
import { sendSuccess, sendError } from "../utils/response";

export const getCoupons = async (req: Request, res: Response): Promise<void> => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    sendSuccess(res, "Lấy danh sách mã giảm giá thành công", { coupons });
  } catch (error) {
    console.error("Get coupons error:", error);
    sendError(res, "Lỗi máy chủ khi lấy danh sách mã giảm giá", null, 500);
  }
};

export const createCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, value } = req.body;

    if (!code || !value || value <= 0) {
      sendError(res, "Vui lòng nhập mã hợp lệ và giá trị lớn hơn 0", null, 400);
      return;
    }

    const upperCode = code.toUpperCase();

    const existingCoupon = await Coupon.findOne({ code: upperCode });
    if (existingCoupon) {
      sendError(res, "Mã giảm giá đã tồn tại", null, 400);
      return;
    }

    const coupon = await Coupon.create({
      code: upperCode,
      value,
      active: true,
    });

    sendSuccess(res, "Tạo mã giảm giá thành công", { coupon }, 201);
  } catch (error) {
    console.error("Create coupon error:", error);
    sendError(res, "Lỗi máy chủ khi tạo mã giảm giá", null, 500);
  }
};

export const applyCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, roomPrice } = req.body;

    if (!code || !roomPrice) {
      sendError(res, "Thiếu mã giảm giá hoặc giá phòng", null, 400);
      return;
    }

    const upperCode = code.toUpperCase();
    const coupon = await Coupon.findOne({ code: upperCode });

    if (!coupon) {
      sendError(res, "Mã giảm giá không tồn tại", null, 404);
      return;
    }

    if (!coupon.active) {
      sendError(res, "Mã giảm giá đã hết hạn hoặc không hoạt động", null, 400);
      return;
    }

    let finalPrice = roomPrice - coupon.value;
    if (finalPrice < 0) finalPrice = 0;

    let userName = "Khách hàng ẩn danh";
    if (req.user) {
      userName = req.user.name;
    }

    sendSuccess(res, "Áp dụng mã giảm giá thành công", {
      discount: coupon.value,
      finalPrice,
      userName,
    });
  } catch (error) {
    console.error("Apply coupon error:", error);
    sendError(res, "Lỗi máy chủ khi áp dụng mã giảm giá", null, 500);
  }
};

export const toggleCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findById(id);

    if (!coupon) {
      sendError(res, "Mã giảm giá không tồn tại", null, 404);
      return;
    }

    coupon.active = !coupon.active;
    await coupon.save();

    sendSuccess(res, `Đã ${coupon.active ? 'bật' : 'tắt'} mã giảm giá`, { coupon });
  } catch (error) {
    console.error("Toggle coupon error:", error);
    sendError(res, "Lỗi máy chủ khi thay đổi trạng thái mã giảm giá", null, 500);
  }
};

export const deleteCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);

    if (!coupon) {
      sendError(res, "Mã giảm giá không tồn tại", null, 404);
      return;
    }

    sendSuccess(res, "Xóa mã giảm giá thành công", { coupon });
  } catch (error) {
    console.error("Delete coupon error:", error);
    sendError(res, "Lỗi máy chủ khi xóa mã giảm giá", null, 500);
  }
};
