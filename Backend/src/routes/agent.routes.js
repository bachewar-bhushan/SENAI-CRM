import express from "express";

import {
  dryRunAgent,
  runAgent,
  getDemoEmails,
} from "../controllers/agent.controller.js";

const router = express.Router();

// Get demo emails for testing
router.get("/demo-emails", getDemoEmails);

// Dry-run agent (planning mode)
router.post("/dry-run/:emailId", dryRunAgent);

// Run agent (execute)
router.post("/run/:emailId", runAgent);

export default router;
