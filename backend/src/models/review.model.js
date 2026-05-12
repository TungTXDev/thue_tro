const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    userName: { type: String, required: true },
    stars: { type: Number, required: true, min: 1, max: 5 },
    content: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const Review = mongoose.model("Review", reviewSchema);

module.exports = { Review };
