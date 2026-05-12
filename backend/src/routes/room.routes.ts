import { Router } from "express";
import {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  seedRooms,
} from "../controllers/room.controller";
import { requireAuth, requireAdmin } from "../middlewares/auth.middleware";

const router = Router();

// Public routes
router.get("/", getRooms);
router.get("/:id", getRoomById);

// Admin routes
router.post("/seed", requireAuth, requireAdmin, seedRooms);
router.post("/", requireAuth, requireAdmin, createRoom);
router.put("/:id", requireAuth, requireAdmin, updateRoom);
router.delete("/:id", requireAuth, requireAdmin, deleteRoom);

export default router;
