import express from "express";

import {
  getDashboardStats,
  getSentimentTrend,
  getCategoryBreakdown,
  getAllEmails,
} from "../controllers/analytics.controller.js";

const router = express.Router();

router.get("/dashboard/stats", getDashboardStats);

router.get("/sentiment-trend", getSentimentTrend);

router.get("/category-breakdown", getCategoryBreakdown);

router.get("/all-emails", getAllEmails);

export default router;