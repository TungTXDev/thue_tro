const jwt = require("jsonwebtoken");
const { User } = require("../models/user.model");
const { env } = require("../config/env");
const { sendError } = require("../utils/response");

const getBearerToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return authHeader.split(" ")[1];
};

const loadUserFromToken = async (token) => {
  const decoded = jwt.verify(token, env.JWT_SECRET);
  return User.findById(decoded.id).select("-password");
};

const requireAuth = async (req, res, next) => {
  try {
    const token = getBearerToken(req);
    if (!token) {
      return sendError(res, "Please log in to continue", null, 401);
    }

    const user = await loadUserFromToken(token);
    if (!user) {
      return sendError(res, "User does not exist", null, 401);
    }

    if (user.status === "blocked") {
      return sendError(res, "Your account has been blocked", null, 403);
    }

    req.user = user;
    return next();
  } catch (error) {
    return sendError(res, "Invalid or expired token", null, 401);
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = getBearerToken(req);
    if (token) {
      const user = await loadUserFromToken(token);
      if (user && user.status !== "blocked") req.user = user;
    }
  } catch (error) {
    // Optional auth intentionally ignores invalid tokens.
  }

  return next();
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return sendError(res, "You do not have permission to perform this action", null, 403);
  }
  return next();
};

const requireLandlord = (req, res, next) => {
  if (!req.user || !["landlord", "admin"].includes(req.user.role)) {
    return sendError(res, "You do not have permission to perform this action", null, 403);
  }
  return next();
};

module.exports = { requireAuth, optionalAuth, requireAdmin, requireLandlord };
