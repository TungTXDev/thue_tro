import mongoose, { Schema, Document } from "mongoose";

export interface IRoom extends Document {
  title: string;
  category: string;
  price: number;
  district: string;
  image?: string;
  description?: string;
  amenities?: string[];
  status: "available" | "hidden" | "deleted";
  createdAt: Date;
  updatedAt: Date;
}

const roomSchema = new Schema(
  {
    title: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    district: { type: String, required: true },
    image: { type: String },
    description: { type: String },
    amenities: { type: [String] },
    status: { 
      type: String, 
      enum: ["available", "hidden", "deleted"], 
      default: "available" 
    },
  },
  { timestamps: true }
);

export const Room = mongoose.model<IRoom>("Room", roomSchema);
