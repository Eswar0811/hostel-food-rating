// routes/analyticsRoutes.js
const express = require("express");
const ctrl = require("../controllers/analyticsController");

const router = express.Router();

router.get("/", ctrl.getOverview);
router.get("/:foodId", ctrl.getAnalytics);

module.exports = router;
