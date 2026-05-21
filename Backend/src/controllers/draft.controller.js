import { pool } from "../config/db.js";
import { asyncHandler } from "../middleware/errorHandler.js";

/**
 * Get draft by ID
 * GET /drafts/:draftId
 */
export const getDraft = asyncHandler(async (req, res) => {
  const { draftId } = req.params;

  if (!draftId || isNaN(draftId)) {
    return res.status(400).json({
      success: false,
      error_code: "INVALID_DRAFT_ID",
      message: "Invalid draft ID",
      details: {},
    });
  }

  const query = `
    SELECT *
    FROM actions
    WHERE id = $1
    AND action_type IN ('Auto-Reply', 'Draft')
  `;

  const result = await pool.query(query, [draftId]);

  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error_code: "DRAFT_NOT_FOUND",
      message: "Draft not found",
      details: { draft_id: draftId },
    });
  }

  res.status(200).json({
    success: true,
    data: result.rows[0],
  });
});

/**
 * Update draft content
 * PATCH /drafts/:draftId
 * Body: { proposed_content: "new reply text" }
 */
export const updateDraft = asyncHandler(async (req, res) => {
  const { draftId } = req.params;
  const { proposed_content } = req.body;

  if (!draftId || isNaN(draftId)) {
    return res.status(400).json({
      success: false,
      error_code: "INVALID_DRAFT_ID",
      message: "Invalid draft ID",
      details: {},
    });
  }

  if (!proposed_content || proposed_content.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error_code: "INVALID_CONTENT",
      message: "Draft content cannot be empty",
      details: {},
    });
  }

  const query = `
    UPDATE actions
    SET
      proposed_content = $1,
      updated_at = NOW()
    WHERE id = $2
    AND action_type IN ('Auto-Reply', 'Draft')
    AND is_approved = false
    RETURNING *
  `;

  const result = await pool.query(query, [proposed_content, draftId]);

  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error_code: "DRAFT_NOT_FOUND",
      message: "Draft not found or already approved",
      details: { draft_id: draftId },
    });
  }

  res.status(200).json({
    success: true,
    message: "Draft updated successfully",
    data: result.rows[0],
  });
});

/**
 * Approve and send draft
 * POST /drafts/:draftId/approve
 * Body: { approved_by: "user@example.com" }
 */
export const approveDraft = asyncHandler(async (req, res) => {
  const { draftId } = req.params;
  const { approved_by = "system" } = req.body;

  if (!draftId || isNaN(draftId)) {
    return res.status(400).json({
      success: false,
      error_code: "INVALID_DRAFT_ID",
      message: "Invalid draft ID",
      details: {},
    });
  }

  const query = `
    UPDATE actions
    SET
      is_approved = true,
      approved_by = $1,
      executed_at = NOW()
    WHERE id = $2
    AND action_type IN ('Auto-Reply', 'Draft')
    AND is_approved = false
    RETURNING *
  `;

  const result = await pool.query(query, [approved_by, draftId]);

  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error_code: "DRAFT_NOT_FOUND",
      message: "Draft not found or already approved",
      details: { draft_id: draftId },
    });
  }

  // Update email status to Replied
  const emailQuery = `
    UPDATE emails
    SET status = 'Replied'
    WHERE id = $1
  `;

  await pool.query(emailQuery, [result.rows[0].email_id]);

  res.status(200).json({
    success: true,
    message: "Draft approved and sent successfully",
    data: result.rows[0],
  });
});

/**
 * Reject draft
 * DELETE /drafts/:draftId
 */
export const rejectDraft = asyncHandler(async (req, res) => {
  const { draftId } = req.params;

  if (!draftId || isNaN(draftId)) {
    return res.status(400).json({
      success: false,
      error_code: "INVALID_DRAFT_ID",
      message: "Invalid draft ID",
      details: {},
    });
  }

  const query = `
    DELETE FROM actions
    WHERE id = $1
    AND action_type IN ('Auto-Reply', 'Draft')
    AND is_approved = false
    RETURNING id
  `;

  const result = await pool.query(query, [draftId]);

  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error_code: "DRAFT_NOT_FOUND",
      message: "Draft not found or already approved",
      details: { draft_id: draftId },
    });
  }

  res.status(200).json({
    success: true,
    message: "Draft rejected and deleted",
    data: { deleted_id: result.rows[0].id },
  });
});

/**
 * Get all drafts for an email
 * GET /drafts/email/:emailId
 */
export const getDraftsForEmail = asyncHandler(async (req, res) => {
  const { emailId } = req.params;

  if (!emailId || isNaN(emailId)) {
    return res.status(400).json({
      success: false,
      error_code: "INVALID_EMAIL_ID",
      message: "Invalid email ID",
      details: {},
    });
  }

  const query = `
    SELECT *
    FROM actions
    WHERE email_id = $1
    AND action_type IN ('Auto-Reply', 'Draft')
    ORDER BY created_at DESC
  `;

  const result = await pool.query(query, [emailId]);

  res.status(200).json({
    success: true,
    data: result.rows,
    count: result.rows.length,
  });
});
