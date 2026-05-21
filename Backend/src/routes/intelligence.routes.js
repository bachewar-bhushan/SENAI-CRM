import express from "express";

import {
  getReputationData,
  getReputationSummary,
} from "../controllers/intelligence.controller.js";

const router = express.Router();

// Get reputation for a specific company
router.get("/reputation", getReputationData);

// Get reputation summary dashboard
router.get("/summary", getReputationSummary);

export default router;
