import { Router } from "express";
import { getReviewsByRoomId, createReview } from "../controllers/review.controller";
import { optionalAuth } from "../middlewares/auth.middleware";

const router = Router();

// Public route to get reviews for a room
router.get("/room/:roomId", getReviewsByRoomId);

// Create review (auth is optional)
router.post("/", optionalAuth, createReview);

export default router;
