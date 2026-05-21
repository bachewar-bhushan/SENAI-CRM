import express from "express";

import {
  getThreadByEmail,
  respondToEmail,
  getThreadActions,
  getThreadSummary,
} from "../controllers/thread.controller.js";

const router = express.Router();

// Get full thread by email
router.get("/:email", getThreadByEmail);

// Get thread summary
router.get("/summary/:email", getThreadSummary);

// Get thread actions/audit log
router.get("/actions/:email", getThreadActions);

// Send reply to email
router.post("/respond/:emailId", respondToEmail);

export default router;
