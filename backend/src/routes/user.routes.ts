import { Router } from "express";
import { getAllUsers, getUserById, updateUserStatus } from "../controllers/user.controller";
import { requireAuth, requireAdmin } from "../middlewares/auth.middleware";

const router = Router();

// All user routes require authentication
router.use(requireAuth);

router.get("/", requireAdmin, getAllUsers);
router.get("/:id", getUserById);
router.patch("/:id/status", requireAdmin, updateUserStatus);

export default router;
