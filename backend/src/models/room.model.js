const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    district: { type: String, required: true, trim: true },
    image: { type: String }, // Main image (backward compatible)
    images: { type: [String], default: [] }, // Multiple images array
    description: { type: String },
    amenities: { type: [String], default: [] },
    // bedrooms: { type: Number, default: 1 },
    // bathrooms: { type: Number, default: 1 },
    // area: { type: Number, default: 25 }, // m²
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ownerName: { type: String },
    tenant: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      name: { type: String },
      email: { type: String },
      phone: { type: String },
      startDate: { type: Date },
      endDate: { type: Date },
    },
    status: {
      type: String,
      enum: ["available", "rented", "hidden", "deleted"],
      default: "available",
    },
  },
  { timestamps: true }
);

const Room = mongoose.model("Room", roomSchema);

module.exports = { Room };
