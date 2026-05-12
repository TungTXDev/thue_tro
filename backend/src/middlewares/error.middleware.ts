import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("🔥 Error:", err.message || err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  
  sendError(res, message, process.env.NODE_ENV === "development" ? err.stack : null, statusCode);
};
