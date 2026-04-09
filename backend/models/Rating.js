// models/Rating.js
// A single student's rating for a specific food menu entry.
const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
  {
    foodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FoodMenu",
      required: true,
      index: true,
    },
    studentId: {
      type: String,
      required: true,
      trim: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
  },
  { timestamps: true }
);

// Prevent duplicate ratings: one rating per student per meal.
ratingSchema.index({ foodId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model("Rating", ratingSchema);
