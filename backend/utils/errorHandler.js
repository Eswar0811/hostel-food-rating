// utils/errorHandler.js
// Central error handler — keeps controllers clean.
module.exports = function errorHandler(err, req, res, next) {
  console.error("💥 Error:", err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || "Internal server error",
  });
};
