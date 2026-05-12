const { Router } = require("express");
const { getReviewsByRoomId, createReview } = require("../controllers/review.controller");
const { optionalAuth } = require("../middlewares/auth.middleware");

const router = Router();

router.get("/room/:roomId", getReviewsByRoomId);
router.post("/", optionalAuth, createReview);

module.exports = router;
