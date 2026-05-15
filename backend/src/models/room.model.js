const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    district: { type: String, required: true, trim: true },
    image: { type: String },
    description: { type: String },
    amenities: { type: [String], default: [] },
    // bedrooms: { type: Number, default: 1 },
    // bathrooms: { type: Number, default: 1 },
    // area: { type: Number, default: 25 }, // m²
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ownerName: { type: String },
    status: {
      type: String,
      enum: ["available", "hidden", "deleted"],
      default: "available",
    },
  },
  { timestamps: true }
);

const Room = mongoose.model("Room", roomSchema);

module.exports = { Room };
