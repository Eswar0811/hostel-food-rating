// components/StarRating.jsx
// Reusable star rating input. Set `readonly` for display-only mode.
import React from "react";

export default function StarRating({ value, onChange, readonly = false }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className={`star-row ${readonly ? "readonly" : ""}`}>
      {stars.map((s) => (
        <span
          key={s}
          className={`star ${s <= value ? "active" : ""}`}
          onClick={() => !readonly && onChange && onChange(s)}
          role={readonly ? "img" : "button"}
          aria-label={`${s} star${s > 1 ? "s" : ""}`}
        >
          ★
        </span>
      ))}
    </div>
  );
}
