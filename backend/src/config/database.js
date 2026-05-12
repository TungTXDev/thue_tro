const mongoose = require("mongoose");
const { env } = require("./env");

const connectDatabase = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};

module.exports = { connectDatabase };
