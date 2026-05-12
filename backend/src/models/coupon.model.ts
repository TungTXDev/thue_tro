import mongoose, { Schema, Document } from "mongoose";

export interface ICoupon extends Document {
  code: string;
  value: number;
  active: boolean;
  expiryDate?: Date;
  usageLimit?: number;
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    value: { type: Number, required: true },
    active: { type: Boolean, default: true },
    expiryDate: { type: Date },
    usageLimit: { type: Number },
  },
  { timestamps: true }
);

export const Coupon = mongoose.model<ICoupon>("Coupon", couponSchema);
