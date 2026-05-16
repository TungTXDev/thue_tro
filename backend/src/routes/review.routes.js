const { Router } = require("express");
const { getReviewsByRoomId, createReview, updateReview, deleteReview } = require("../controllers/review.controller");
const { optionalAuth } = require("../middlewares/auth.middleware");

const router = Router();

router.get("/room/:roomId", getReviewsByRoomId);
router.post("/", optionalAuth, createReview);
router.put("/:id", optionalAuth, updateReview);
router.delete("/:id", optionalAuth, deleteReview);

module.exports = router;
