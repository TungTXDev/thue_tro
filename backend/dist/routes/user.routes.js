"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// All user routes require authentication
router.use(auth_middleware_1.requireAuth);
router.get("/", auth_middleware_1.requireAdmin, user_controller_1.getAllUsers);
router.get("/:id", user_controller_1.getUserById);
router.patch("/:id/status", auth_middleware_1.requireAdmin, user_controller_1.updateUserStatus);
exports.default = router;
