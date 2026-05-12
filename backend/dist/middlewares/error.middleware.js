const { sendError } = require("../utils/response");

const errorHandler = (err, req, res, next) => {
  console.error("Error:", err.message || err);
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const details = process.env.NODE_ENV === "development" ? err.stack : null;
  return sendError(res, message, details, statusCode);
};

module.exports = { errorHandler };
