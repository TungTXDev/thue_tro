const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    userName: { type: String, required: true },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
    roomName: { type: String, required: true },
    landlordId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    originalPrice: { type: Number, required: true, min: 0 },
    discount: { type: Number, required: true, default: 0, min: 0 },
    couponCode: { type: String },
    pricePaid: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ["cash", "qr"], required: true },
    status: {
      type: String,
      enum: ["success", "pending", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = { Order };
