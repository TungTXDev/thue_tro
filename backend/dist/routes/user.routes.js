const { Router } = require("express");
const { getAllUsers, getUserById, updateUserStatus } = require("../controllers/user.controller");
const { requireAuth, requireAdmin } = require("../middlewares/auth.middleware");

const router = Router();

router.use(requireAuth);
router.get("/", requireAdmin, getAllUsers);
router.get("/:id", getUserById);
router.patch("/:id/status", requireAdmin, updateUserStatus);

module.exports = router;
