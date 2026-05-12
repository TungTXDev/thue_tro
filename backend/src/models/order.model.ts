import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  userId?: mongoose.Types.ObjectId;
  userName: string;
  roomId?: mongoose.Types.ObjectId;
  roomName: string;
  originalPrice: number;
  discount: number;
  couponCode?: string;
  pricePaid: number;
  paymentMethod: "cash" | "qr";
  status: "success" | "pending" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" }, // Optional
    userName: { type: String, required: true },
    roomId: { type: Schema.Types.ObjectId, ref: "Room" }, // Optional
    roomName: { type: String, required: true },
    originalPrice: { type: Number, required: true },
    discount: { type: Number, required: true, default: 0 },
    couponCode: { type: String },
    pricePaid: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["cash", "qr"], required: true },
    status: {
      type: String,
      enum: ["success", "pending", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const Order = mongoose.model<IOrder>("Order", orderSchema);
