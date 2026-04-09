// controllers/ratingController.js
const Rating = require("../models/Rating");
const FoodMenu = require("../models/FoodMenu");
const { recalculateAnalytics } = require("../services/analyticsService");

// POST /api/rating
exports.submitRating = async (req, res, next) => {
  try {
    const { foodId, studentId, rating, comment } = req.body;

    const food = await FoodMenu.findById(foodId);
    if (!food) {
      return res.status(404).json({ success: false, message: "Food not found" });
    }

    const doc = await Rating.create({ foodId, studentId, rating, comment });

    // Recalculate analytics + maybe trigger SMS.
    const analytics = await recalculateAnalytics(foodId);

    res.status(201).json({ success: true, data: doc, analytics });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: "You have already rated this meal" });
    }
    next(err);
  }
};

// GET /api/rating/:foodId
exports.getRatingsForFood = async (req, res, next) => {
  try {
    const ratings = await Rating.find({ foodId: req.params.foodId }).sort({
      createdAt: -1,
    });
    res.json({ success: true, count: ratings.length, data: ratings });
  } catch (err) {
    next(err);
  }
};

// POST /api/rating/seed-demo
// Creates N demo ratings for a food item with random student IDs and ratings.
// Useful for quickly populating test data and verifying the SMS alert trigger.
exports.seedDemoRatings = async (req, res, next) => {
  try {
    const { foodId, count = 10, lowRatings = false } = req.body;

    if (!foodId) {
      return res.status(400).json({ success: false, message: "foodId is required" });
    }

    const food = await FoodMenu.findById(foodId);
    if (!food) {
      return res.status(404).json({ success: false, message: "Food not found" });
    }

    const created = [];
    const timestamp = Date.now();

    for (let i = 0; i < count; i++) {
      // Unique student ID per seed run — avoids duplicate-key conflicts.
      const studentId = `DEMO-${timestamp}-${String(i + 1).padStart(3, "0")}`;

      // If lowRatings=true, bias toward 1-2 stars to trigger the SMS alert.
      // Otherwise use the full 1-5 range.
      let rating;
      if (lowRatings) {
        rating = Math.random() < 0.8 ? Math.ceil(Math.random() * 2) : 3;
      } else {
        rating = Math.ceil(Math.random() * 5);
      }

      try {
        const doc = await Rating.create({
          foodId,
          studentId,
          rating,
          comment: lowRatings ? "Demo: low rating for SMS test" : "Demo rating",
        });
        created.push({ studentId: doc.studentId, rating: doc.rating });
      } catch (err) {
        if (err.code !== 11000) throw err; // skip duplicates, rethrow others
      }
    }

    const analytics = await recalculateAnalytics(foodId);

    res.status(201).json({
      success: true,
      message: `Created ${created.length} demo rating(s) for food ${foodId}`,
      created,
      analytics,
    });
  } catch (err) {
    next(err);
  }
};
