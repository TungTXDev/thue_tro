const { Router } = require("express");
const {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  seedRooms,
  getSearchSuggestions,
  addTenant,
  removeTenant,
} = require("../controllers/room.controller");
const { requireAuth, requireAdmin, requireLandlord } = require("../middlewares/auth.middleware");
const { upload, handleMulterError } = require("../middlewares/upload.middleware");

const router = Router();

router.get("/", getRooms);
router.get("/suggestions", getSearchSuggestions);
router.get("/:id", getRoomById);
router.post("/seed", requireAuth, requireAdmin, seedRooms);
router.post("/", requireAuth, requireLandlord, upload.array("images", 5), handleMulterError, createRoom);
router.put("/:id", requireAuth, requireLandlord, upload.array("images", 5), handleMulterError, updateRoom);
router.delete("/:id", requireAuth, requireLandlord, deleteRoom);
router.post("/:id/tenant", requireAuth, requireLandlord, addTenant);
router.delete("/:id/tenant", requireAuth, requireLandlord, removeTenant);

module.exports = router;
