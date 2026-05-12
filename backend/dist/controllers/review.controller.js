"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReview = exports.getReviewsByRoomId = void 0;
const review_model_1 = require("../models/review.model");
const response_1 = require("../utils/response");
const getReviewsByRoomId = async (req, res) => {
    try {
        const { roomId } = req.params;
        const reviews = await review_model_1.Review.find({ roomId }).sort({ createdAt: -1 });
        (0, response_1.sendSuccess)(res, "Lấy danh sách đánh giá thành công", { reviews });
    }
    catch (error) {
        console.error("Get reviews error:", error);
        (0, response_1.sendError)(res, "Lỗi máy chủ khi lấy danh sách đánh giá", null, 500);
    }
};
exports.getReviewsByRoomId = getReviewsByRoomId;
const createReview = async (req, res) => {
    try {
        const { roomId, stars, content } = req.body;
        // Validation
        if (!roomId) {
            (0, response_1.sendError)(res, "Mã phòng (roomId) là bắt buộc", null, 400);
            return;
        }
        if (!stars || stars < 1 || stars > 5) {
            (0, response_1.sendError)(res, "Số sao phải từ 1 đến 5", null, 400);
            return;
        }
        if (!content) {
            (0, response_1.sendError)(res, "Nội dung đánh giá là bắt buộc", null, 400);
            return;
        }
        // Determine user info from optionalAuth
        let userId = undefined;
        let userName = "Khách hàng ẩn danh";
        if (req.user) {
            userId = req.user._id;
            userName = req.user.name;
        }
        const review = await review_model_1.Review.create({
            roomId,
            userId,
            userName,
            stars,
            content,
        });
        (0, response_1.sendSuccess)(res, "Đánh giá thành công", { review }, 201);
    }
    catch (error) {
        console.error("Create review error:", error);
        (0, response_1.sendError)(res, "Lỗi máy chủ khi tạo đánh giá", null, 500);
    }
};
exports.createReview = createReview;
