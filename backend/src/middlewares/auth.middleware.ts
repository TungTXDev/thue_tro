import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User, IUser } from "../models/user.model";
import { env } from "../config/env";
import { sendError } from "../utils/response";

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      sendError(res, "Vui lòng đăng nhập để tiếp tục", null, 401);
      return;
    }

    const token = authHeader.split(" ")[1];
    
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string };
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        sendError(res, "Người dùng không tồn tại", null, 401);
        return;
      }

      if (user.status === "blocked") {
        sendError(res, "Tài khoản của bạn đã bị khóa", null, 403);
        return;
      }

      req.user = user;
      next();
    } catch (error) {
      sendError(res, "Token không hợp lệ hoặc đã hết hạn", null, 401);
      return;
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    sendError(res, "Lỗi xác thực", null, 500);
  }
};

export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string };
        const user = await User.findById(decoded.id).select("-password");
        if (user && user.status !== "blocked") {
          req.user = user;
        }
      } catch (error) {
        // Ignore token errors for optional auth
      }
    }
  } catch (error) {
    // Ignore errors for optional auth
  } finally {
    next();
  }
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role !== "admin") {
    sendError(res, "Bạn không có quyền thực hiện hành động này", null, 403);
    return;
  }
  next();
};

export const requireLandlord = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || (req.user.role !== "landlord" && req.user.role !== "admin")) {
    sendError(res, "Bạn không có quyền thực hiện hành động này", null, 403);
    return;
  }
  next();
};
