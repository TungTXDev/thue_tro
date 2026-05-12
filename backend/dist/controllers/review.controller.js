const { Review } = require("../models/review.model");
const { sendSuccess, sendError } = require("../utils/response");

const getReviewsByRoomId = async (req, res) => {
  try {
    const reviews = await Review.find({ roomId: req.params.roomId }).sort({ createdAt: -1 });
    return sendSuccess(res, "Reviews fetched successfully", { reviews });
  } catch (error) {
    console.error("Get reviews error:", error);
    return sendError(res, "Server error while fetching reviews", null, 500);
  }
};

const createReview = async (req, res) => {
  try {
    const { roomId, stars, content } = req.body;

    if (!roomId) return sendError(res, "roomId is required", null, 400);
    if (!stars || stars < 1 || stars > 5) return sendError(res, "stars must be from 1 to 5", null, 400);
    if (!content) return sendError(res, "Review content is required", null, 400);

    const review = await Review.create({
      roomId,
      userId: req.user ? req.user._id : undefined,
      userName: req.user ? req.user.name : "Guest",
      stars,
      content,
    });

    return sendSuccess(res, "Review created successfully", { review }, 201);
  } catch (error) {
    console.error("Create review error:", error);
    return sendError(res, "Server error while creating review", null, 500);
  }
};

module.exports = { getReviewsByRoomId, createReview };
