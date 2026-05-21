import express from "express";

import { getAuditLogs } from "../controllers/audit.controller.js";

const router = express.Router();

// Get audit logs for an entity
router.get("/:entityType/:entityId", getAuditLogs);

export default router;
