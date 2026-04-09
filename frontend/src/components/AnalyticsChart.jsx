// components/AnalyticsChart.jsx
// Bar chart for rating distribution using react-chartjs-2.
import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

export function DistributionChart({ distribution }) {
  const data = {
    labels: ["1★", "2★", "3★", "4★", "5★"],
    datasets: [
      {
        label: "Number of ratings",
        data: [1, 2, 3, 4, 5].map((k) => distribution?.[k] || 0),
        backgroundColor: [
          "#ef4444",
          "#f97316",
          "#f59e0b",
          "#84cc16",
          "#10b981",
        ],
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
  };
  return <Bar data={data} options={options} />;
}

export function TrendChart({ overview }) {
  // overview: [{ food, analytics }]
  const sorted = [...overview].sort(
    (a, b) => new Date(a.food.date) - new Date(b.food.date)
  );
  const data = {
    labels: sorted.map(
      (x) =>
        `${new Date(x.food.date).toLocaleDateString()} ${x.food.mealType[0]}`
    ),
    datasets: [
      {
        label: "Average rating",
        data: sorted.map((x) => x.analytics?.averageRating || 0),
        borderColor: "#6366f1",
        backgroundColor: "rgba(99, 102, 241, 0.2)",
        tension: 0.3,
      },
    ],
  };
  const options = {
    responsive: true,
    scales: { y: { min: 0, max: 5 } },
  };
  return <Line data={data} options={options} />;
}
