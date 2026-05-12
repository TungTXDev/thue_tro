import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";
import { env } from "../config/env";
import { sendSuccess, sendError } from "../utils/response";

const generateToken = (id: string) => {
  return jwt.sign({ id }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as any,
  });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      sendError(res, "Vui lòng nhập đầy đủ tên, email và mật khẩu", null, 400);
      return;
    }

    if (password.length < 6) {
      sendError(res, "Mật khẩu phải có ít nhất 6 ký tự", null, 400);
      return;
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      sendError(res, "Email đã được sử dụng", null, 400);
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
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

    sendSuccess(res, "Đăng ký thành công", { user: userData, token }, 201);
  } catch (error) {
    console.error("Register error:", error);
    sendError(res, "Lỗi máy chủ khi đăng ký", null, 500);
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      sendError(res, "Vui lòng nhập email và mật khẩu", null, 400);
      return;
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user || !user.password) {
      sendError(res, "Email hoặc mật khẩu không chính xác", null, 401);
      return;
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      sendError(res, "Email hoặc mật khẩu không chính xác", null, 401);
      return;
    }

    if (user.status === "blocked") {
      sendError(res, "Tài khoản của bạn đã bị khóa", null, 403);
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

    sendSuccess(res, "Đăng nhập thành công", { user: userData, token });
  } catch (error) {
    console.error("Login error:", error);
    sendError(res, "Lỗi máy chủ khi đăng nhập", null, 500);
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    // req.user is already populated by requireAuth middleware
    if (!req.user) {
      sendError(res, "Không tìm thấy thông tin người dùng", null, 404);
      return;
    }

    sendSuccess(res, "Lấy thông tin thành công", { user: req.user });
  } catch (error) {
    console.error("Get me error:", error);
    sendError(res, "Lỗi máy chủ khi lấy thông tin", null, 500);
  }
};
