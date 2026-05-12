"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../models/user.model");
const env_1 = require("../config/env");
const response_1 = require("../utils/response");
const generateToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, env_1.env.JWT_SECRET, {
        expiresIn: env_1.env.JWT_EXPIRES_IN,
    });
};
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        // Validation
        if (!name || !email || !password) {
            (0, response_1.sendError)(res, "Vui lòng nhập đầy đủ tên, email và mật khẩu", null, 400);
            return;
        }
        if (password.length < 6) {
            (0, response_1.sendError)(res, "Mật khẩu phải có ít nhất 6 ký tự", null, 400);
            return;
        }
        // Check if user exists
        const existingUser = await user_model_1.User.findOne({ email });
        if (existingUser) {
            (0, response_1.sendError)(res, "Email đã được sử dụng", null, 400);
            return;
        }
        // Hash password
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        // Create user
        const user = await user_model_1.User.create({
            name,
            email,
            password: hashedPassword,
            role: "user", // Default role
        });
        // Generate token
        const token = generateToken(user._id.toString());
        // Prepare response data (exclude password)
        const userData = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            createdAt: user.createdAt,
        };
        (0, response_1.sendSuccess)(res, "Đăng ký thành công", { user: userData, token }, 201);
    }
    catch (error) {
        console.error("Register error:", error);
        (0, response_1.sendError)(res, "Lỗi máy chủ khi đăng ký", null, 500);
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            (0, response_1.sendError)(res, "Vui lòng nhập email và mật khẩu", null, 400);
            return;
        }
        // Find user
        const user = await user_model_1.User.findOne({ email });
        if (!user || !user.password) {
            (0, response_1.sendError)(res, "Email hoặc mật khẩu không chính xác", null, 401);
            return;
        }
        // Check password
        const isMatch = await bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            (0, response_1.sendError)(res, "Email hoặc mật khẩu không chính xác", null, 401);
            return;
        }
        if (user.status === "blocked") {
            (0, response_1.sendError)(res, "Tài khoản của bạn đã bị khóa", null, 403);
            return;
        }
        // Generate token
        const token = generateToken(user._id.toString());
        const userData = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            createdAt: user.createdAt,
        };
        (0, response_1.sendSuccess)(res, "Đăng nhập thành công", { user: userData, token });
    }
    catch (error) {
        console.error("Login error:", error);
        (0, response_1.sendError)(res, "Lỗi máy chủ khi đăng nhập", null, 500);
    }
};
exports.login = login;
const getMe = async (req, res) => {
    try {
        // req.user is already populated by requireAuth middleware
        if (!req.user) {
            (0, response_1.sendError)(res, "Không tìm thấy thông tin người dùng", null, 404);
            return;
        }
        (0, response_1.sendSuccess)(res, "Lấy thông tin thành công", { user: req.user });
    }
    catch (error) {
        console.error("Get me error:", error);
        (0, response_1.sendError)(res, "Lỗi máy chủ khi lấy thông tin", null, 500);
    }
};
exports.getMe = getMe;
