import express, { Application, Request, Response } from "express";
import cors from "cors";
import { env } from "./config/env";
import { sendSuccess, sendError } from "./utils/response";
import { errorHandler } from "./middlewares/error.middleware";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import roomRoutes from "./routes/room.routes";
import reviewRoutes from "./routes/review.routes";
import couponRoutes from "./routes/coupon.routes";
import orderRoutes from "./routes/order.routes";
import adminRoutes from "./routes/admin.routes";

const app: Application = express();

// Middlewares
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
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Routes
app.get("/api/health", (req: Request, res: Response) => {
  sendSuccess(res, "Backend is running", { status: "OK" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

// 404 Route
app.use((req: Request, res: Response) => {
  sendError(res, "Route not found", null, 404);
});

// Error Middleware
app.use(errorHandler);

export default app;
