// routes/foodRoutes.js
const express = require("express");
const { body } = require("express-validator");
const validate = require("../utils/validate");
const ctrl = require("../controllers/foodController");

const router = express.Router();

router.post(
  "/",
  [
    body("date").isISO8601().withMessage("date must be ISO8601"),
    body("mealType")
      .isIn(["Breakfast", "Lunch", "Dinner", "Snacks"])
      .withMessage("invalid mealType"),
    body("items")
      .isArray({ min: 1 })
      .withMessage("items must be a non-empty array"),
  ],
  validate,
  ctrl.addFood
);

router.get("/", ctrl.getFood);
router.get("/:id", ctrl.getFoodById);
router.delete("/:id", ctrl.deleteFood);

module.exports = router;
