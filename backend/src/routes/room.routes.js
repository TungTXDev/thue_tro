"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const room_controller_1 = require("../controllers/room.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Public routes
router.get("/", room_controller_1.getRooms);
router.get("/:id", room_controller_1.getRoomById);
// Admin routes
router.post("/seed", auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin, room_controller_1.seedRooms);
router.post("/", auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin, room_controller_1.createRoom);
router.put("/:id", auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin, room_controller_1.updateRoom);
router.delete("/:id", auth_middleware_1.requireAuth, auth_middleware_1.requireAdmin, room_controller_1.deleteRoom);
exports.default = router;
