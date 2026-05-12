"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const env_1 = require("./config/env");
const response_1 = require("./utils/response");
const error_middleware_1 = require("./middlewares/error.middleware");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const room_routes_1 = __importDefault(require("./routes/room.routes"));
const review_routes_1 = __importDefault(require("./routes/review.routes"));
const coupon_routes_1 = __importDefault(require("./routes/coupon.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const app = (0, express_1.default)();
// Middlewares
app.use(express_1.default.json());
const allowedOrigins = [
    env_1.env.CLIENT_URL,
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "http://localhost:5173",
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
}));
// Routes
app.get("/api/health", (req, res) => {
    (0, response_1.sendSuccess)(res, "Backend is running", { status: "OK" });
});
app.use("/api/auth", auth_routes_1.default);
app.use("/api/users", user_routes_1.default);
app.use("/api/rooms", room_routes_1.default);
app.use("/api/reviews", review_routes_1.default);
app.use("/api/coupons", coupon_routes_1.default);
app.use("/api/orders", order_routes_1.default);
app.use("/api/admin", admin_routes_1.default);
// 404 Route
app.use((req, res) => {
    (0, response_1.sendError)(res, "Route not found", null, 404);
});
// Error Middleware
app.use(error_middleware_1.errorHandler);
exports.default = app;
