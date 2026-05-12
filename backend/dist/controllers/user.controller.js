"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserStatus = exports.getUserById = exports.getAllUsers = void 0;
const user_model_1 = require("../models/user.model");
const response_1 = require("../utils/response");
const getAllUsers = async (req, res) => {
    try {
        // Only Admin can access (handled by requireAdmin middleware)
        const users = await user_model_1.User.find().select("-password").sort({ createdAt: -1 });
        (0, response_1.sendSuccess)(res, "Lấy danh sách người dùng thành công", { users });
    }
    catch (error) {
        console.error("Get all users error:", error);
        (0, response_1.sendError)(res, "Lỗi máy chủ khi lấy danh sách người dùng", null, 500);
    }
};
exports.getAllUsers = getAllUsers;
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        // Check permissions: Admin can view all, User can only view themselves
        if (req.user?.role !== "admin" && req.user?._id.toString() !== id) {
            (0, response_1.sendError)(res, "Bạn không có quyền xem thông tin người dùng này", null, 403);
            return;
        }
        const user = await user_model_1.User.findById(id).select("-password");
        if (!user) {
            (0, response_1.sendError)(res, "Không tìm thấy người dùng", null, 404);
            return;
        }
        (0, response_1.sendSuccess)(res, "Lấy thông tin người dùng thành công", { user });
    }
    catch (error) {
        console.error("Get user by id error:", error);
        (0, response_1.sendError)(res, "Lỗi máy chủ khi lấy thông tin người dùng", null, 500);
    }
};
exports.getUserById = getUserById;
const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        // Validation
        if (!status || !["active", "blocked"].includes(status)) {
            (0, response_1.sendError)(res, "Trạng thái không hợp lệ. Chỉ chấp nhận 'active' hoặc 'blocked'", null, 400);
            return;
        }
        // Admin cannot block themselves
        if (req.user?._id.toString() === id) {
            (0, response_1.sendError)(res, "Bạn không thể tự thay đổi trạng thái của chính mình", null, 400);
            return;
        }
        const user = await user_model_1.User.findById(id);
        if (!user) {
            (0, response_1.sendError)(res, "Không tìm thấy người dùng", null, 404);
            return;
        }
        // Only Admin can access this route (handled by requireAdmin middleware)
        user.status = status;
        await user.save();
        const updatedUser = await user_model_1.User.findById(id).select("-password");
        (0, response_1.sendSuccess)(res, `Đã cập nhật trạng thái thành ${status}`, { user: updatedUser });
    }
    catch (error) {
        console.error("Update user status error:", error);
        (0, response_1.sendError)(res, "Lỗi máy chủ khi cập nhật trạng thái", null, 500);
    }
};
exports.updateUserStatus = updateUserStatus;
