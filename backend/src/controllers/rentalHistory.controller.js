const { RentalHistory } = require("../models/rentalHistory.model");
const { sendSuccess, sendError } = require("../utils/response");

// Get rental history for landlord
const getRentalHistory = async (req, res) => {
    try {
        const { landlordId, status } = req.query;

        if (!landlordId) {
            return sendError(res, "landlordId is required", null, 400);
        }

        // Check if user has permission
        if (req.user.role !== "admin" && req.user._id.toString() !== landlordId) {
            return sendError(res, "You do not have permission to view this history", null, 403);
        }

        const query = { landlordId };
        if (status) {
            query.status = status;
        }

        const history = await RentalHistory.find(query)
            .sort({ createdAt: -1 })
            .lean();

        return sendSuccess(res, "Rental history fetched successfully", { history });
    } catch (error) {
        console.error("Get rental history error:", error);
        return sendError(res, "Server error while fetching rental history", null, 500);
    }
};

// Get rental history by ID
const getRentalHistoryById = async (req, res) => {
    try {
        const history = await RentalHistory.findById(req.params.id);

        if (!history) {
            return sendError(res, "Rental history not found", null, 404);
        }

        // Check permission
        if (req.user.role !== "admin" && req.user._id.toString() !== history.landlordId.toString()) {
            return sendError(res, "You do not have permission to view this history", null, 403);
        }

        return sendSuccess(res, "Rental history fetched successfully", { history });
    } catch (error) {
        console.error("Get rental history by id error:", error);
        return sendError(res, "Server error while fetching rental history", null, 500);
    }
};

module.exports = {
    getRentalHistory,
    getRentalHistoryById,
};
