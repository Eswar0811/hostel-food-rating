// server.js
// Express entry point. Wires up middleware, routes, and starts the server.
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const connectDB = require("./config/db");
const errorHandler = require("./utils/errorHandler");

const foodRoutes = require("./routes/foodRoutes");
const ratingRoutes = require("./routes/ratingRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

const app = express();

// ---------- Middleware ----------
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "*",
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

// ---------- Health check ----------
app.get("/api/health", (req, res) => {
  res.json({ success: true, status: "ok", time: new Date().toISOString() });
});

// ---------- Routes ----------
app.use("/api/food", foodRoutes);
app.use("/api/rating", ratingRoutes);
app.use("/api/analytics", analyticsRoutes);

// ---------- 404 + error handler ----------
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});
app.use(errorHandler);

// ---------- Start ----------
const PORT = process.env.PORT || 5000;

// Only connect + listen when run directly (so tests can import `app` without side effects).
if (require.main === module) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  });
}

module.exports = app;
