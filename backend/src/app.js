const express = require("express");
const cors = require("cors");
const { env } = require("./config/env");
const { sendSuccess, sendError } = require("./utils/response");
const { errorHandler } = require("./middlewares/error.middleware");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const roomRoutes = require("./routes/room.routes");
const reviewRoutes = require("./routes/review.routes");
const couponRoutes = require("./routes/coupon.routes");
const orderRoutes = require("./routes/order.routes");
const adminRoutes = require("./routes/admin.routes");
const rentalHistoryRoutes = require("./routes/rentalHistory.routes");

const app = express();

app.use(express.json());

const allowedOrigins = [
  env.CLIENT_URL,
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.get("/api/health", (req, res) => {
  return sendSuccess(res, "Backend is running", { status: "OK" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/rental-history", rentalHistoryRoutes);

app.use((req, res) => {
  return sendError(res, "Route not found", null, 404);
});

app.use(errorHandler);

module.exports = app;
