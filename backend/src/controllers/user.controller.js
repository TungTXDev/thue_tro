const { User } = require("../models/user.model");
const { Room } = require("../models/room.model");
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

const toggleBookmark = async (req, res) => {
  try {
    const userId = req.user._id;
    const { roomId } = req.params;

    const room = await Room.findById(roomId);
    if (!room) {
      return sendError(res, "Room not found", null, 404);
    }

    const user = await User.findById(userId);
    const bookmarkIndex = user.bookmarkedRooms.indexOf(roomId);

    if (bookmarkIndex > -1) {
      user.bookmarkedRooms.splice(bookmarkIndex, 1);
      await user.save();
      return sendSuccess(res, "Room removed from bookmarks", {
        bookmarked: false,
        bookmarkedRooms: user.bookmarkedRooms
      });
    } else {
      user.bookmarkedRooms.push(roomId);
      await user.save();
      return sendSuccess(res, "Room added to bookmarks", {
        bookmarked: true,
        bookmarkedRooms: user.bookmarkedRooms
      });
    }
  } catch (error) {
    console.error("Toggle bookmark error:", error);
    return sendError(res, "Server error while toggling bookmark", null, 500);
  }
};

const getBookmarkedRooms = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate({
      path: 'bookmarkedRooms',
      match: { status: 'available' }
    });

    if (!user) {
      return sendError(res, "User not found", null, 404);
    }

    return sendSuccess(res, "Bookmarked rooms fetched successfully", {
      rooms: user.bookmarkedRooms
    });
  } catch (error) {
    console.error("Get bookmarked rooms error:", error);
    return sendError(res, "Server error while fetching bookmarked rooms", null, 500);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserStatus,
  toggleBookmark,
  getBookmarkedRooms
};


const getUserByEmail = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return sendError(res, "Email is required", null, 400);
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("-password");

    if (!user) {
      return sendError(res, "User not found", null, 404);
    }

    return sendSuccess(res, "User found", { user });
  } catch (error) {
    console.error("Get user by email error:", error);
    return sendError(res, "Server error while fetching user", null, 500);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserStatus,
  toggleBookmark,
  getBookmarkedRooms,
  getUserByEmail
};
