// services/analyticsService.js
// Core rating math + SMS trigger logic. Kept separate so it's unit-testable.
const Rating = require("../models/Rating");
const Analytics = require("../models/Analytics");
const FoodMenu = require("../models/FoodMenu");
const { sendLowRatingAlert } = require("./smsService");

/**
 * Pure function: compute stats from an array of rating docs (or numbers).
 * Exported for unit testing.
 */
function computeStats(ratings) {
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;

  for (const r of ratings) {
    const value = typeof r === "number" ? r : r.rating;
    if (value >= 1 && value <= 5) {
      distribution[value] += 1;
      sum += value;
    }
  }

  const totalRatings = ratings.length;
  const averageRating = totalRatings > 0 ? sum / totalRatings : 0;

  return { averageRating, totalRatings, ratingDistribution: distribution };
}

/**
 * Pure function: should we fire an SMS alert?
 * Exported for unit testing.
 */
function shouldTriggerAlert({
  averageRating,
  totalRatings,
  threshold,
  minStudents,
  alreadySent,
}) {
  if (alreadySent) return false;
  if (totalRatings < minStudents) return false;
  return averageRating < threshold;
}

/**
 * Recalculate analytics for a given food menu entry, persist them,
 * and fire an SMS alert if conditions are met.
 */
async function recalculateAnalytics(foodId) {
  const ratings = await Rating.find({ foodId }).lean();
  const stats = computeStats(ratings);

  const existing = await Analytics.findOne({ foodId });
  const alreadySent = existing?.alertSent || false;

  const threshold = parseFloat(process.env.RATING_THRESHOLD || "3.0");
  const minStudents = parseInt(process.env.MIN_STUDENTS_THRESHOLD || "30", 10);

  const trigger = shouldTriggerAlert({
    ...stats,
    threshold,
    minStudents,
    alreadySent,
  });

  // Persist updated analytics.
  const updated = await Analytics.findOneAndUpdate(
    { foodId },
    {
      foodId,
      averageRating: stats.averageRating,
      totalRatings: stats.totalRatings,
      ratingDistribution: stats.ratingDistribution,
      lastUpdated: new Date(),
      ...(trigger ? { alertSent: true } : {}),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Fire SMS alert (non-blocking failure).
  if (trigger) {
    try {
      const food = await FoodMenu.findById(foodId).lean();
      if (food) {
        await sendLowRatingAlert({
          mealType: food.mealType,
          date: food.date,
          averageRating: stats.averageRating,
          totalRatings: stats.totalRatings,
        });
      }
    } catch (err) {
      console.error("SMS alert failed, rolling back alertSent flag:", err.message);
      // Roll back so the system retries on the next rating.
      await Analytics.findOneAndUpdate({ foodId }, { alertSent: false });
    }
  }

  return updated;
}

module.exports = {
  computeStats,
  shouldTriggerAlert,
  recalculateAnalytics,
};
