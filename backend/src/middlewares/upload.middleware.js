const multer = require("multer");
const { sendError } = require("../utils/response");

// Use memory storage for Cloudinary upload
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only JPEG, PNG and WebP are allowed."), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
    },
});

const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return sendError(res, "File size too large. Maximum 5MB allowed.", null, 400);
        }
        return sendError(res, `Upload error: ${err.message}`, null, 400);
    } else if (err) {
        return sendError(res, err.message, null, 400);
    }
    next();
};

module.exports = { upload, handleMulterError };
