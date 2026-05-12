"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireLandlord = exports.requireAdmin = exports.optionalAuth = exports.requireAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../models/user.model");
const env_1 = require("../config/env");
const response_1 = require("../utils/response");
const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            (0, response_1.sendError)(res, "Vui lòng đăng nhập để tiếp tục", null, 401);
            return;
        }
        const token = authHeader.split(" ")[1];
        try {
            const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
            const user = await user_model_1.User.findById(decoded.id).select("-password");
            if (!user) {
                (0, response_1.sendError)(res, "Người dùng không tồn tại", null, 401);
                return;
            }
            if (user.status === "blocked") {
                (0, response_1.sendError)(res, "Tài khoản của bạn đã bị khóa", null, 403);
                return;
            }
            req.user = user;
            next();
        }
        catch (error) {
            (0, response_1.sendError)(res, "Token không hợp lệ hoặc đã hết hạn", null, 401);
            return;
        }
    }
    catch (error) {
        console.error("Auth middleware error:", error);
        (0, response_1.sendError)(res, "Lỗi xác thực", null, 500);
    }
};
exports.requireAuth = requireAuth;
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.split(" ")[1];
            try {
                const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
                const user = await user_model_1.User.findById(decoded.id).select("-password");
                if (user && user.status !== "blocked") {
                    req.user = user;
                }
            }
            catch (error) {
                // Ignore token errors for optional auth
            }
        }
    }
    catch (error) {
        // Ignore errors for optional auth
    }
    finally {
        next();
    }
};
exports.optionalAuth = optionalAuth;
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        (0, response_1.sendError)(res, "Bạn không có quyền thực hiện hành động này", null, 403);
        return;
    }
    next();
};
exports.requireAdmin = requireAdmin;
const requireLandlord = (req, res, next) => {
    if (!req.user || (req.user.role !== "landlord" && req.user.role !== "admin")) {
        (0, response_1.sendError)(res, "Bạn không có quyền thực hiện hành động này", null, 403);
        return;
    }
    next();
};
exports.requireLandlord = requireLandlord;
