const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String },
    role: {
      type: String,
      enum: ["user", "landlord", "admin"],
      default: "user",
    },
    phone: { type: String, trim: true },
    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active",
    },
    bookmarkedRooms: [{ type: mongoose.Schema.Types.ObjectId, ref: "Room" }],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = { User };
