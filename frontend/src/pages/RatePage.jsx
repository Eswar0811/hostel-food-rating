// pages/RatePage.jsx
import React, { useEffect, useState, useCallback } from "react";
import { foodApi, ratingApi } from "../services/api";
import StarRating from "../components/StarRating";

function randomStudentId() {
  const prefix = "STU";
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 6; i++) suffix += chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}-${suffix}`;
}

export default function RatePage() {
  const [foods, setFoods] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [studentId, setStudentId] = useState(
    () => localStorage.getItem("studentId") || ""
  );
  const [msg, setMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Ratings already submitted for the selected food
  const [existingRatings, setExistingRatings] = useState([]);
  const [loadingRatings, setLoadingRatings] = useState(false);

  useEffect(() => {
    foodApi
      .list()
      .then((res) => setFoods(res.data || []))
      .catch((err) => setMsg({ type: "error", text: err.message }));
  }, []);

  // Fetch ratings whenever selected food changes
  const fetchRatings = useCallback((foodId) => {
    if (!foodId) { setExistingRatings([]); return; }
    setLoadingRatings(true);
    ratingApi
      .forFood(foodId)
      .then((res) => setExistingRatings(res.data || []))
      .catch(() => setExistingRatings([]))
      .finally(() => setLoadingRatings(false));
  }, []);

  useEffect(() => {
    fetchRatings(selectedId);
  }, [selectedId, fetchRatings]);

  const handleAutoFill = () => {
    const newId = randomStudentId();
    setStudentId(newId);
    // Auto-select first (most recent) food if none selected
    if (!selectedId && foods.length > 0) {
      setSelectedId(foods[0]._id);
    }
    // Random rating between 1 and 5
    setRating(Math.ceil(Math.random() * 5));
    setComment("Auto-filled demo rating");
    setMsg(null);
  };

  const handleSubmit = async () => {
    setMsg(null);

    if (!studentId.trim()) {
      setMsg({ type: "error", text: "Please enter your student ID" });
      return;
    }
    if (!selectedId) {
      setMsg({ type: "error", text: "Please select a meal" });
      return;
    }
    if (rating < 1) {
      setMsg({ type: "error", text: "Please give a rating" });
      return;
    }

    setSubmitting(true);
    try {
      localStorage.setItem("studentId", studentId);
      await ratingApi.submit({
        foodId: selectedId,
        studentId: studentId.trim(),
        rating,
        comment: comment.trim(),
      });
      setMsg({ type: "success", text: "Rating submitted. Thank you!" });
      setRating(0);
      setComment("");
      // Refresh the ratings list so the new entry shows up immediately
      fetchRatings(selectedId);
    } catch (err) {
      setMsg({
        type: "error",
        text: err.response?.data?.message || err.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating =
    existingRatings.length > 0
      ? (existingRatings.reduce((s, r) => s + r.rating, 0) / existingRatings.length).toFixed(2)
      : null;

  return (
    <div className="container">
      <h1>Rate Your Meal</h1>
      <p className="muted">Your feedback helps improve hostel food</p>

      <div className="card">
        {msg && <div className={`msg-${msg.type}`}>{msg.text}</div>}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <strong>Fill in your rating below</strong>
          <button
            onClick={handleAutoFill}
            style={{ fontSize: "0.8rem", padding: "0.3rem 0.7rem" }}
            title="Generate a random student ID and auto-select a meal for quick testing"
          >
            Auto-fill Demo
          </button>
        </div>

        <label>Student ID</label>
        <input
          type="text"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          placeholder="e.g. 21CS1234  (or click Auto-fill Demo)"
        />

        <label>Select meal</label>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
        >
          <option value="">— Choose a meal —</option>
          {foods.map((f) => (
            <option key={f._id} value={f._id}>
              {new Date(f.date).toLocaleDateString()} &middot; {f.mealType} &middot;{" "}
              {f.items.slice(0, 2).join(", ")}
              {f.items.length > 2 ? "…" : ""}
            </option>
          ))}
        </select>

        <label>Your rating</label>
        <StarRating value={rating} onChange={setRating} />

        <label>Comment (optional)</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={500}
          placeholder="Anything you want the kitchen to know?"
        />

        <div style={{ marginTop: "1rem" }}>
          <button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting…" : "Submit Rating"}
          </button>
        </div>
      </div>

      {/* Existing ratings for the selected food */}
      {selectedId && (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ margin: 0 }}>
              Ratings for this meal
              {avgRating && (
                <span style={{ marginLeft: "0.75rem", color: "var(--primary)", fontSize: "1rem" }}>
                  avg {avgRating} / 5
                </span>
              )}
            </h2>
            <button
              onClick={() => fetchRatings(selectedId)}
              style={{ fontSize: "0.8rem", padding: "0.3rem 0.7rem" }}
            >
              Refresh
            </button>
          </div>

          {loadingRatings ? (
            <p className="muted">Loading…</p>
          ) : existingRatings.length === 0 ? (
            <p className="muted">No ratings yet for this meal.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "0.75rem", fontSize: "0.9rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  <th style={{ textAlign: "left", padding: "0.4rem 0.5rem" }}>Student ID</th>
                  <th style={{ textAlign: "center", padding: "0.4rem 0.5rem" }}>Rating</th>
                  <th style={{ textAlign: "left", padding: "0.4rem 0.5rem" }}>Comment</th>
                  <th style={{ textAlign: "right", padding: "0.4rem 0.5rem" }}>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {existingRatings.map((r) => (
                  <tr key={r._id} style={{ borderBottom: "1px solid var(--border)" }}>
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
    </div>
  );
}
