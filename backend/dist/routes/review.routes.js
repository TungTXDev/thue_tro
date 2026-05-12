"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const review_controller_1 = require("../controllers/review.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Public route to get reviews for a room
router.get("/room/:roomId", review_controller_1.getReviewsByRoomId);
// Create review (auth is optional)
router.post("/", auth_middleware_1.optionalAuth, review_controller_1.createReview);
exports.default = router;
