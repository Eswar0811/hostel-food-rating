// utils/validate.js
// Middleware that short-circuits the request if express-validator found errors.
const { validationResult } = require("express-validator");

module.exports = function validate(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  return res.status(400).json({
    success: false,
    message: "Validation failed",
    errors: errors.array().map((e) => ({ field: e.path, msg: e.msg })),
  });
};
