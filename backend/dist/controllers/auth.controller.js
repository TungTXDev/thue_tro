const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models/user.model");
const { env } = require("../config/env");
const { sendSuccess, sendError } = require("../utils/response");

const toUserResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status,
  createdAt: user.createdAt,
});

const generateToken = (id) => {
  return jwt.sign({ id }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
};

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return sendError(res, "Please enter name, email, and password", null, 400);
    }

    if (password.length < 6) {
      return sendError(res, "Password must be at least 6 characters", null, 400);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, "Email is already in use", null, 400);
    }

    const normalizedRole = role === "landlord" ? "landlord" : "user";
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: normalizedRole,
    });

    const token = generateToken(user._id.toString());
    return sendSuccess(res, "Registered successfully", { user: toUserResponse(user), token }, 201);
  } catch (error) {
    console.error("Register error:", error);
    return sendError(res, "Server error while registering", null, 500);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, "Please enter email and password", null, 400);
    }

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return sendError(res, "Email or password is incorrect", null, 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError(res, "Email or password is incorrect", null, 401);
    }

    if (user.status === "blocked") {
      return sendError(res, "Your account has been blocked", null, 403);
    }

    const token = generateToken(user._id.toString());
    return sendSuccess(res, "Logged in successfully", { user: toUserResponse(user), token });
  } catch (error) {
    console.error("Login error:", error);
    return sendError(res, "Server error while logging in", null, 500);
  }
};

const getMe = async (req, res) => {
  if (!req.user) {
    return sendError(res, "User not found", null, 404);
  }

  return sendSuccess(res, "User fetched successfully", { user: req.user });
};

module.exports = { register, login, getMe };
