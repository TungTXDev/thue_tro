import { Request, Response } from "express";
import { Review } from "../models/review.model";
import { sendSuccess, sendError } from "../utils/response";

export const getReviewsByRoomId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { roomId } = req.params;
    
    const reviews = await Review.find({ roomId }).sort({ createdAt: -1 });
    
    sendSuccess(res, "Lấy danh sách đánh giá thành công", { reviews });
  } catch (error) {
    console.error("Get reviews error:", error);
    sendError(res, "Lỗi máy chủ khi lấy danh sách đánh giá", null, 500);
  }
};

export const createReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { roomId, stars, content } = req.body;

    // Validation
    if (!roomId) {
      sendError(res, "Mã phòng (roomId) là bắt buộc", null, 400);
      return;
    }
    if (!stars || stars < 1 || stars > 5) {
      sendError(res, "Số sao phải từ 1 đến 5", null, 400);
      return;
    }
    if (!content) {
      sendError(res, "Nội dung đánh giá là bắt buộc", null, 400);
      return;
    }

    // Determine user info from optionalAuth
    let userId: any = undefined;
    let userName = "Khách hàng ẩn danh";

    if (req.user) {
      userId = req.user._id;
      userName = req.user.name;
    }

    const review = await Review.create({
      roomId,
      userId,
      userName,
      stars,
      content,
    });

    sendSuccess(res, "Đánh giá thành công", { review }, 201);
  } catch (error) {
    console.error("Create review error:", error);
    sendError(res, "Lỗi máy chủ khi tạo đánh giá", null, 500);
  }
};
