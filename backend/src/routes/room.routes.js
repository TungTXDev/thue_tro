const { Router } = require("express");
const {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  seedRooms,
  getSearchSuggestions,
} = require("../controllers/room.controller");
const { requireAuth, requireAdmin, requireLandlord } = require("../middlewares/auth.middleware");

const router = Router();

router.get("/", getRooms);
router.get("/suggestions", getSearchSuggestions);
router.get("/:id", getRoomById);
router.post("/seed", requireAuth, requireAdmin, seedRooms);
router.post("/", requireAuth, requireLandlord, createRoom);
router.put("/:id", requireAuth, requireLandlord, updateRoom);
router.delete("/:id", requireAuth, requireLandlord, deleteRoom);

module.exports = router;
