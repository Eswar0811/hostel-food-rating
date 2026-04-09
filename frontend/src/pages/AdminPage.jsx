// pages/AdminPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import { foodApi, analyticsApi, ratingApi } from "../services/api";
import { DistributionChart, TrendChart } from "../components/AnalyticsChart";

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snacks"];

export default function AdminPage() {
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [mealType, setMealType] = useState("Breakfast");
  const [itemsText, setItemsText] = useState("");
  const [msg, setMsg] = useState(null);

  const [overview, setOverview] = useState([]);
  const [selected, setSelected] = useState(null);

  // Individual student ratings for selected meal
  const [mealRatings, setMealRatings] = useState([]);
  const [loadingRatings, setLoadingRatings] = useState(false);

  // Seed demo state
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState(null);

  const loadOverview = useCallback(() => {
    analyticsApi
      .overview(15)
      .then((res) => {
        const data = res.data || [];
        setOverview(data);
        if (data.length > 0 && !selected) {
          setSelected(data[0]);
        }
      })
      .catch((err) => setMsg({ type: "error", text: err.message }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  // Fetch individual ratings whenever selected meal changes
  const fetchMealRatings = useCallback((foodId) => {
    if (!foodId) { setMealRatings([]); return; }
    setLoadingRatings(true);
    ratingApi
      .forFood(foodId)
      .then((res) => setMealRatings(res.data || []))
      .catch(() => setMealRatings([]))
      .finally(() => setLoadingRatings(false));
  }, []);

  useEffect(() => {
    if (selected?.food?._id) {
      fetchMealRatings(selected.food._id);
    } else {
      setMealRatings([]);
    }
  }, [selected, fetchMealRatings]);

  const handleAdd = async () => {
    setMsg(null);
    const items = itemsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (items.length === 0) {
      setMsg({ type: "error", text: "Add at least one item (comma separated)" });
      return;
    }
    try {
      await foodApi.create({ date, mealType, items });
      setMsg({ type: "success", text: "Menu added" });
      setItemsText("");
      loadOverview();
    } catch (err) {
      setMsg({
        type: "error",
        text: err.response?.data?.message || err.message,
      });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this meal? All ratings for it will be lost.")) return;
    try {
      await foodApi.remove(id);
      loadOverview();
      if (selected?.food._id === id) { setSelected(null); setMealRatings([]); }
    } catch (err) {
      setMsg({ type: "error", text: err.message });
    }
  };

  // Seed N demo ratings for the selected meal
  const handleSeedRatings = async (lowRatings) => {
    if (!selected?.food?._id) {
      setSeedMsg({ type: "error", text: "Select a meal first" });
      return;
    }
    setSeedMsg(null);
    setSeeding(true);
    try {
      const res = await ratingApi.seedDemo(selected.food._id, 10, lowRatings);
      setSeedMsg({
        type: "success",
        text: `Seeded ${res.created?.length ?? 0} demo ratings. Avg: ${res.analytics?.averageRating?.toFixed(2) ?? "?"}/5. ${res.analytics?.alertSent ? "SMS alert was sent!" : "No SMS alert triggered yet."}`,
      });
      // Refresh overview + individual ratings
      loadOverview();
      fetchMealRatings(selected.food._id);
    } catch (err) {
      setSeedMsg({ type: "error", text: err.response?.data?.message || err.message });
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="container">
      <h1>Admin Panel</h1>

      {/* Add meal form */}
      <div className="card">
        <h2>Add Today's Menu</h2>
        {msg && <div className={`msg-${msg.type}`}>{msg.text}</div>}

        <label>Date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

        <label>Meal type</label>
        <select value={mealType} onChange={(e) => setMealType(e.target.value)}>
          {MEAL_TYPES.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <label>Items (comma separated)</label>
        <input
          type="text"
          value={itemsText}
          onChange={(e) => setItemsText(e.target.value)}
          placeholder="Idli, Sambar, Coconut chutney"
        />

        <div style={{ marginTop: "1rem" }}>
          <button onClick={handleAdd}>Add Menu</button>
        </div>
      </div>

      {/* Recent meals list */}
      <div className="card">
        <h2>Recent Meals</h2>
        {overview.length === 0 ? (
          <p className="muted">No meals yet.</p>
        ) : (
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            {overview.map((x) => (
              <div
                key={x.food._id}
                style={{
                  padding: "0.5rem 0.75rem",
                  background:
                    selected?.food._id === x.food._id ? "var(--primary)" : "var(--card-2)",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: "0.85rem",
                }}
                onClick={() => { setSelected(x); setSeedMsg(null); }}
              >
                {new Date(x.food.date).toLocaleDateString()} &middot; {x.food.mealType}
                {x.analytics?.totalRatings > 0 && (
                  <span style={{ marginLeft: 8, opacity: 0.8 }}>
                    ({x.analytics.averageRating.toFixed(1)}★, {x.analytics.totalRatings} ratings)
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected meal details + analytics */}
      {selected && (
        <div className="card">
          <h2>
            {selected.food.mealType} &mdash;{" "}
            {new Date(selected.food.date).toLocaleDateString()}
          </h2>
          <p className="muted">{selected.food.items.join(", ")}</p>

          {selected.analytics && selected.analytics.totalRatings > 0 ? (
            <>
              <div className="stat">
                <span>Average rating</span>
                <span>{selected.analytics.averageRating.toFixed(2)} / 5</span>
              </div>
              <div className="stat">
                <span>Total ratings</span>
                <span>{selected.analytics.totalRatings}</span>
              </div>
              <div className="stat">
                <span>SMS alert sent</span>
                <span>{selected.analytics.alertSent ? "Yes — low rating alert fired" : "No"}</span>
              </div>
              <div style={{ marginTop: "1rem" }}>
                <DistributionChart distribution={selected.analytics.ratingDistribution} />
              </div>
            </>
          ) : (
            <p className="muted">No ratings yet for this meal.</p>
          )}

          {/* Seed demo ratings section */}
          <div style={{ marginTop: "1.25rem", padding: "1rem", background: "var(--card-2)", borderRadius: 8 }}>
            <strong>Seed Demo Ratings</strong>
            <p className="muted" style={{ margin: "0.3rem 0 0.75rem" }}>
              Quickly add 10 auto-generated student ratings for testing.
              "Low ratings" biases toward 1–2 stars to trigger the SMS alert
              (fires when avg &lt; 2.5 with at least 3 ratings).
            </p>
            {seedMsg && <div className={`msg-${seedMsg.type}`}>{seedMsg.text}</div>}
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <button onClick={() => handleSeedRatings(false)} disabled={seeding}>
                {seeding ? "Seeding…" : "Seed 10 Random Ratings"}
              </button>
              <button
                onClick={() => handleSeedRatings(true)}
                disabled={seeding}
                className="danger"
              >
                {seeding ? "Seeding…" : "Seed 10 Low Ratings (triggers SMS)"}
              </button>
            </div>
          </div>

          <div style={{ marginTop: "1rem" }}>
            <button className="danger" onClick={() => handleDelete(selected.food._id)}>
              Delete Meal
            </button>
          </div>
        </div>
      )}

      {/* Individual student ratings table */}
      {selected && (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ margin: 0 }}>Student Ratings</h2>
            <button
              onClick={() => fetchMealRatings(selected.food._id)}
              style={{ fontSize: "0.8rem", padding: "0.3rem 0.7rem" }}
            >
              Refresh
            </button>
          </div>

          {loadingRatings ? (
            <p className="muted">Loading…</p>
          ) : mealRatings.length === 0 ? (
            <p className="muted">No ratings recorded for this meal yet.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "0.75rem", fontSize: "0.88rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <th style={{ textAlign: "left", padding: "0.4rem 0.5rem" }}>#</th>
                  <th style={{ textAlign: "left", padding: "0.4rem 0.5rem" }}>Student ID</th>
                  <th style={{ textAlign: "center", padding: "0.4rem 0.5rem" }}>Rating</th>
                  <th style={{ textAlign: "left", padding: "0.4rem 0.5rem" }}>Comment</th>
                  <th style={{ textAlign: "right", padding: "0.4rem 0.5rem" }}>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {mealRatings.map((r, idx) => (
                  <tr key={r._id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "0.4rem 0.5rem", color: "var(--muted)" }}>{idx + 1}</td>
                    <td style={{ padding: "0.4rem 0.5rem" }}>{r.studentId}</td>
                    <td style={{ textAlign: "center", padding: "0.4rem 0.5rem" }}>
                      {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                    </td>
                    <td style={{ padding: "0.4rem 0.5rem", color: "var(--muted)" }}>
                      {r.comment || "—"}
                    </td>
                    <td style={{ textAlign: "right", padding: "0.4rem 0.5rem", color: "var(--muted)", whiteSpace: "nowrap" }}>
                      {new Date(r.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Rating trend across all meals */}
      {overview.length > 1 && (
        <div className="card">
          <h2>Rating Trend</h2>
          <TrendChart overview={overview} />
        </div>
      )}
    </div>
  );
}
