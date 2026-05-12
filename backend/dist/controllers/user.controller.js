const { User } = require("../models/user.model");
const { sendSuccess, sendError } = require("../utils/response");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return sendSuccess(res, "Users fetched successfully", { users });
  } catch (error) {
    console.error("Get all users error:", error);
    return sendError(res, "Server error while fetching users", null, 500);
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const isSelf = req.user && req.user._id.toString() === id;
    const isAdmin = req.user && req.user.role === "admin";

    if (!isAdmin && !isSelf) {
      return sendError(res, "You do not have permission to view this user", null, 403);
    }

    const user = await User.findById(id).select("-password");
    if (!user) {
      return sendError(res, "User not found", null, 404);
    }

    return sendSuccess(res, "User fetched successfully", { user });
  } catch (error) {
    console.error("Get user by id error:", error);
    return sendError(res, "Server error while fetching user", null, 500);
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "blocked"].includes(status)) {
      return sendError(res, "Invalid status", null, 400);
    }

    if (req.user && req.user._id.toString() === id) {
      return sendError(res, "You cannot update your own status", null, 400);
    }

    const user = await User.findByIdAndUpdate(id, { status }, { new: true }).select("-password");
    if (!user) {
      return sendError(res, "User not found", null, 404);
    }

    return sendSuccess(res, "User status updated successfully", { user });
  } catch (error) {
    console.error("Update user status error:", error);
    return sendError(res, "Server error while updating user status", null, 500);
  }
};

module.exports = { getAllUsers, getUserById, updateUserStatus };
