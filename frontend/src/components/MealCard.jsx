// components/MealCard.jsx
import React from "react";
import StarRating from "./StarRating";

export default function MealCard({ food, analytics }) {
  const date = new Date(food.date).toLocaleDateString();
  return (
    <div className="meal-card">
      <div className="meal-type">{food.mealType}</div>
      <div className="muted" style={{ fontSize: "0.8rem" }}>{date}</div>
      <ul>
        {food.items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
      {analytics && analytics.totalRatings > 0 ? (
        <div>
          <StarRating value={Math.round(analytics.averageRating)} readonly />
          <div className="muted" style={{ fontSize: "0.8rem" }}>
            {analytics.averageRating.toFixed(2)} avg · {analytics.totalRatings} ratings
          </div>
        </div>
      ) : (
        <div className="muted" style={{ fontSize: "0.8rem" }}>No ratings yet</div>
      )}
    </div>
  );
}
