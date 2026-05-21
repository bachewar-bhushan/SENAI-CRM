import {
  ingestAndClassifyEmailService,
  getJobStatusService,
} from "../services/ingest.service.js";

/**
 * Ingest and classify a new email
 * POST /api/ingest
 */
export const ingestEmail = async (req, res) => {
  try {
    const { thread_id, message_id, sender, subject, body, timestamp } =
      req.body;

    // Validate required fields
    if (!message_id || !sender || !body || !thread_id) {
      return res.status(400).json({
        success: false,
        error_code: "VALIDATION_ERROR",
        message:
          "Missing required fields: message_id, sender, body, thread_id",
        details: { received: Object.keys(req.body) },
      });
    }

    // Run ingestion with intelligence pipeline
    const result = await ingestAndClassifyEmailService(req.body);

    return res.status(200).json({
      success: true,
      data: result,
      job_id: result.id,
    });
  } catch (error) {
    console.error("Ingest error:", error);

    // Handle specific error cases
    if (error.message === "Duplicate message_id") {
      return res.status(409).json({
        success: false,
        error_code: "DUPLICATE_MESSAGE",
        message: "Email with this message_id already exists",
        details: { message_id: req.body.message_id },
      });
    }

    return res.status(500).json({
      success: false,
      error_code: "INGEST_ERROR",
      message: error.message || "Failed to ingest email",
      details: {},
    });
  }
};

/**
 * Get ingestion job status
 * GET /api/status/:jobId
 */
export const getJobStatus = async (req, res) => {
  try {
    const result = await getJobStatusService(req.params.jobId);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Status check error:", error);

    return res.status(500).json({
      success: false,
      error_code: "STATUS_CHECK_ERROR",
      message: "Failed to check job status",
      details: {},
    });
  }
};