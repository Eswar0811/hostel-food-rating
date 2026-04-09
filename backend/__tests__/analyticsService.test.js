// __tests__/analyticsService.test.js
// Unit tests for the pure functions in analyticsService.
const {
  computeStats,
  shouldTriggerAlert,
} = require("../services/analyticsService");

describe("computeStats", () => {
  test("returns zeros for empty input", () => {
    const s = computeStats([]);
    expect(s.totalRatings).toBe(0);
    expect(s.averageRating).toBe(0);
    expect(s.ratingDistribution).toEqual({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  });

  test("computes average and distribution correctly", () => {
    const s = computeStats([{ rating: 5 }, { rating: 3 }, { rating: 4 }, { rating: 3 }]);
    expect(s.totalRatings).toBe(4);
    expect(s.averageRating).toBe(3.75);
    expect(s.ratingDistribution).toEqual({ 1: 0, 2: 0, 3: 2, 4: 1, 5: 1 });
  });

  test("accepts raw numbers too", () => {
    const s = computeStats([1, 2, 3, 4, 5]);
    expect(s.averageRating).toBe(3);
    expect(s.totalRatings).toBe(5);
  });

  test("ignores out-of-range values", () => {
    const s = computeStats([0, 6, 3, 4]);
    expect(s.totalRatings).toBe(4); // count is array length
    expect(s.ratingDistribution[3]).toBe(1);
    expect(s.ratingDistribution[4]).toBe(1);
  });
});

describe("shouldTriggerAlert", () => {
  const base = { threshold: 3.0, minStudents: 30, alreadySent: false };

  test("triggers when avg below threshold and enough students", () => {
    expect(
      shouldTriggerAlert({ ...base, averageRating: 2.7, totalRatings: 42 })
    ).toBe(true);
  });

  test("does NOT trigger if too few students", () => {
    expect(
      shouldTriggerAlert({ ...base, averageRating: 2.0, totalRatings: 5 })
    ).toBe(false);
  });

  test("does NOT trigger if average is acceptable", () => {
    expect(
      shouldTriggerAlert({ ...base, averageRating: 4.1, totalRatings: 100 })
    ).toBe(false);
  });

  test("does NOT trigger if alert already sent", () => {
    expect(
      shouldTriggerAlert({
        ...base,
        averageRating: 2.0,
        totalRatings: 100,
        alreadySent: true,
      })
    ).toBe(false);
  });

  test("edge: exactly at threshold does NOT trigger", () => {
    expect(
      shouldTriggerAlert({ ...base, averageRating: 3.0, totalRatings: 50 })
    ).toBe(false);
  });

  test("edge: exactly at minStudents counts as enough", () => {
    expect(
      shouldTriggerAlert({ ...base, averageRating: 2.5, totalRatings: 30 })
    ).toBe(true);
  });
});
