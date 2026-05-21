import { pool } from "../config/db.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import {
  dryRunAgentService,
  runAgentService,
} from "../services/agent.service.js";

/**
 * Dry-run agent (planning mode, no execution)
 * POST /agent/dry-run/:emailId
 */
export const dryRunAgent = asyncHandler(async (req, res) => {
  const { emailId } = req.params;

  if (!emailId || (emailId && emailId.trim().length === 0)) {
    return res.status(400).json({
      success: false,
      error_code: "INVALID_EMAIL_ID",
      message: "Invalid email ID provided",
      details: {},
    });
  }

  const result = await dryRunAgentService(emailId);

  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * Run agent (actual execution)
 * POST /agent/run/:emailId
 */
export const runAgent = asyncHandler(async (req, res) => {
  const { emailId } = req.params;

  if (!emailId || (emailId && emailId.trim().length === 0)) {
    return res.status(400).json({
      success: false,
      error_code: "INVALID_EMAIL_ID",
      message: "Invalid email ID provided",
      details: {},
    });
  }

  const result = await runAgentService(emailId, false);

  res.status(200).json({
    success: true,
    data: result,
  });
});

/**
 * Get demo emails for agent testing
 * GET /agent/demo-emails
 */
export const getDemoEmails = asyncHandler(async (req, res) => {
  const result = await pool.query(`
    SELECT
      id,
      message_id,
      subject,
      body,
      urgency,
      sender,
      category,
      sentiment_score,
      timestamp
    FROM emails
    WHERE status = 'Processed'
    ORDER BY timestamp DESC
    LIMIT 5
  `);

  const demoEmails = result.rows.map((row) => ({
    id: row.id,
    message_id: row.message_id,
    subject: row.subject,
    sender: row.sender,
    urgency: row.urgency,
    category: row.category,
    sentiment_score: row.sentiment_score,
    preview: row.body.substring(0, 60) + "...",
    timestamp: row.timestamp,
  }));

  res.status(200).json({
    success: true,
    data: demoEmails,
    count: demoEmails.length,
  });
});
