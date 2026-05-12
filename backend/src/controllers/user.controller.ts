import { Request, Response } from "express";
import { User } from "../models/user.model";
import { sendSuccess, sendError } from "../utils/response";

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    // Only Admin can access (handled by requireAdmin middleware)
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    sendSuccess(res, "Lấy danh sách người dùng thành công", { users });
  } catch (error) {
    console.error("Get all users error:", error);
    sendError(res, "Lỗi máy chủ khi lấy danh sách người dùng", null, 500);
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Check permissions: Admin can view all, User can only view themselves
    if (req.user?.role !== "admin" && req.user?._id.toString() !== id) {
      sendError(res, "Bạn không có quyền xem thông tin người dùng này", null, 403);
      return;
    }

    const user = await User.findById(id).select("-password");
    if (!user) {
      sendError(res, "Không tìm thấy người dùng", null, 404);
      return;
    }

    sendSuccess(res, "Lấy thông tin người dùng thành công", { user });
  } catch (error) {
    console.error("Get user by id error:", error);
    sendError(res, "Lỗi máy chủ khi lấy thông tin người dùng", null, 500);
  }
};

export const updateUserStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validation
    if (!status || !["active", "blocked"].includes(status)) {
      sendError(res, "Trạng thái không hợp lệ. Chỉ chấp nhận 'active' hoặc 'blocked'", null, 400);
      return;
    }

    // Admin cannot block themselves
    if (req.user?._id.toString() === id) {
      sendError(res, "Bạn không thể tự thay đổi trạng thái của chính mình", null, 400);
      return;
    }

    const user = await User.findById(id);
    if (!user) {
      sendError(res, "Không tìm thấy người dùng", null, 404);
      return;
    }

    // Only Admin can access this route (handled by requireAdmin middleware)
    user.status = status as "active" | "blocked";
    await user.save();

    const updatedUser = await User.findById(id).select("-password");

    sendSuccess(res, `Đã cập nhật trạng thái thành ${status}`, { user: updatedUser });
  } catch (error) {
    console.error("Update user status error:", error);
    sendError(res, "Lỗi máy chủ khi cập nhật trạng thái", null, 500);
  }
};
