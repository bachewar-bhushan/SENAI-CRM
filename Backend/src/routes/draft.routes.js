import express from "express";

import {
  getDraft,
  updateDraft,
  approveDraft,
  rejectDraft,
  getDraftsForEmail,
} from "../controllers/draft.controller.js";

const router = express.Router();

// Get draft by ID
router.get("/:draftId", getDraft);

// Get all drafts for an email
router.get("/email/:emailId", getDraftsForEmail);

// Update draft content
router.patch("/:draftId", updateDraft);

// Approve and send draft
router.post("/:draftId/approve", approveDraft);

// Reject and delete draft
router.delete("/:draftId", rejectDraft);

export default router;
