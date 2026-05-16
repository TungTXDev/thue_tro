const { Router } = require("express");
const { getAllUsers, getUserById, updateUserStatus, toggleBookmark, getBookmarkedRooms, getUserByEmail } = require("../controllers/user.controller");
const { requireAuth, requireAdmin } = require("../middlewares/auth.middleware");

const router = Router();

router.use(requireAuth);
router.get("/", requireAdmin, getAllUsers);
router.get("/search/email", getUserByEmail);
router.get("/:id", getUserById);
router.patch("/:id/status", requireAdmin, updateUserStatus);
router.post("/bookmarks/:roomId", toggleBookmark);
router.get("/bookmarks/list/all", getBookmarkedRooms);

module.exports = router;
