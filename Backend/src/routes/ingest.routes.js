import express from "express";

import {
  ingestEmail,
  getJobStatus,
} from "../controllers/ingest.controller.js";

const router = express.Router();

router.post("/ingest", ingestEmail);

router.get("/status/:jobId", getJobStatus);

export default router;