// controllers/analyticsController.js
const Analytics = require("../models/Analytics");
const FoodMenu = require("../models/FoodMenu");

// GET /api/analytics/:foodId
exports.getAnalytics = async (req, res, next) => {
  try {
    const analytics = await Analytics.findOne({ foodId: req.params.foodId }).populate(
      "foodId"
    );
    if (!analytics) {
      return res
        .status(404)
        .json({ success: false, message: "No analytics for this meal yet" });
    }
    res.json({ success: true, data: analytics });
  } catch (err) {
    next(err);
  }
};

// GET /api/analytics
// Overview: recent meals with their analytics (for admin dashboard charts).
exports.getOverview = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit || "10", 10);
    const foods = await FoodMenu.find().sort({ date: -1 }).limit(limit);
    const foodIds = foods.map((f) => f._id);
    const analytics = await Analytics.find({ foodId: { $in: foodIds } });

    const map = new Map(analytics.map((a) => [a.foodId.toString(), a]));
    const combined = foods.map((f) => ({
      food: f,
      analytics: map.get(f._id.toString()) || null,
    }));

    res.json({ success: true, count: combined.length, data: combined });
  } catch (err) {
    next(err);
  }
};
