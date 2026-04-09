// models/FoodMenu.js
// Represents a single meal entry added by the admin.
const mongoose = require("mongoose");

const foodMenuSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      index: true,
    },
    mealType: {
      type: String,
      enum: ["Breakfast", "Lunch", "Dinner", "Snacks"],
      required: true,
    },
    items: {
      type: [String],
      required: true,
      validate: (v) => Array.isArray(v) && v.length > 0,
    },
  },
  { timestamps: true }
);

// A given date+mealType combo should be unique — one menu per meal per day.
foodMenuSchema.index({ date: 1, mealType: 1 }, { unique: true });

module.exports = mongoose.model("FoodMenu", foodMenuSchema);
