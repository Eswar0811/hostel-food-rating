// controllers/foodController.js
const FoodMenu = require("../models/FoodMenu");
const Analytics = require("../models/Analytics");

// POST /api/food
exports.addFood = async (req, res, next) => {
  try {
    const { date, mealType, items } = req.body;
    const food = await FoodMenu.create({ date, mealType, items });
    // Initialize empty analytics document so dashboards don't 404.
    await Analytics.create({ foodId: food._id });
    res.status(201).json({ success: true, data: food });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: "Menu for this date & meal already exists" });
    }
    next(err);
  }
};

// GET /api/food?date=YYYY-MM-DD
exports.getFood = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.date) {
      const start = new Date(req.query.date);
      const end = new Date(req.query.date);
      end.setDate(end.getDate() + 1);
      filter.date = { $gte: start, $lt: end };
    }
    const foods = await FoodMenu.find(filter).sort({ date: -1, mealType: 1 });
    res.json({ success: true, count: foods.length, data: foods });
  } catch (err) {
    next(err);
  }
};

// GET /api/food/:id
exports.getFoodById = async (req, res, next) => {
  try {
    const food = await FoodMenu.findById(req.params.id);
    if (!food) {
      return res.status(404).json({ success: false, message: "Food not found" });
    }
    res.json({ success: true, data: food });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/food/:id
exports.deleteFood = async (req, res, next) => {
  try {
    const food = await FoodMenu.findByIdAndDelete(req.params.id);
    if (!food) {
      return res.status(404).json({ success: false, message: "Food not found" });
    }
    await Analytics.deleteOne({ foodId: food._id });
    res.json({ success: true, message: "Food deleted" });
  } catch (err) {
    next(err);
  }
};
