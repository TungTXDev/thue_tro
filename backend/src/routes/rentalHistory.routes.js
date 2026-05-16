const { Router } = require("express");
const { requireAuth } = require("../middlewares/auth.middleware");
const {
    getRentalHistory,
    getRentalHistoryById,
} = require("../controllers/rentalHistory.controller");

const router = Router();

// Get all rental history of current user
router.get("/", requireAuth, getRentalHistory);

// Get rental history detail by id
router.get("/:id", requireAuth, getRentalHistoryById);

module.exports = router;