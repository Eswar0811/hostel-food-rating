// routes/ratingRoutes.js
const express = require("express");
const { body } = require("express-validator");
const validate = require("../utils/validate");
const ctrl = require("../controllers/ratingController");

const router = express.Router();

// POST /api/rating — student submits a real rating
router.post(
  "/",
  [
    body("foodId").isMongoId().withMessage("invalid foodId"),
    body("studentId").isString().trim().notEmpty().withMessage("studentId required"),
    body("rating").isInt({ min: 1, max: 5 }).withMessage("rating must be 1–5"),
    body("comment").optional().isString().isLength({ max: 500 }),
  ],
  validate,
  ctrl.submitRating
);

// POST /api/rating/seed-demo — bulk-create demo ratings for testing
// Must be defined BEFORE the /:foodId GET route to avoid route conflicts.
router.post("/seed-demo", ctrl.seedDemoRatings);

// GET /api/rating/:foodId — get all ratings for a meal
router.get("/:foodId", ctrl.getRatingsForFood);

module.exports = router;
