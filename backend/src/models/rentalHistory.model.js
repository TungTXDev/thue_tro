const mongoose = require("mongoose");

const rentalHistorySchema = new mongoose.Schema(
    {
        roomId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Room",
            required: true,
        },
        roomTitle: {
            type: String,
            required: true,
        },
        landlordId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        tenantName: {
            type: String,
            required: true,
        },
        tenantEmail: {
            type: String,
            required: true,
        },
        tenantPhone: {
            type: String,
            required: true,
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
        },
        actualEndDate: {
            type: Date, // Ngày thực tế trả phòng
        },
        price: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ["active", "completed"],
            default: "active",
        },
    },
    {
        timestamps: true,
    }
);

const RentalHistory = mongoose.model("RentalHistory", rentalHistorySchema);

module.exports = { RentalHistory };
