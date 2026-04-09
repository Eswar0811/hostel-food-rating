// pages/HomePage.jsx
import React, { useEffect, useState } from "react";
import { analyticsApi } from "../services/api";
import MealCard from "../components/MealCard";

export default function HomePage() {
  const [overview, setOverview] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    analyticsApi
      .overview(12)
      .then((res) => setOverview(res.data || []))
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, []);

  const lowRated = overview.filter(
    (x) => x.analytics?.averageRating > 0 && x.analytics?.averageRating < 3
  );

  return (
    <div className="container">
      <h1>🍽️ Hostel Food Dashboard</h1>
      <p className="muted">Recent meals and student feedback</p>

      {lowRated.length > 0 && (
        <div className="alert-banner">
          ⚠️ {lowRated.length} recent meal(s) have an average rating below 3.0 —
          check the admin panel for details.
        </div>
      )}

      {loading && <p className="muted">Loading…</p>}
      {error && <div className="msg-error">{error}</div>}

      {!loading && overview.length === 0 && (
        <div className="card">
          <p className="muted">
            No meals added yet. Head to the Admin panel to add today's menu.
          </p>
        </div>
      )}

      <div className="grid">
        {overview.map((x) => (
          <MealCard key={x.food._id} food={x.food} analytics={x.analytics} />
        ))}
      </div>
    </div>
  );
}
