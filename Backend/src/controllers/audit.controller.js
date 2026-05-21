import { asyncHandler } from "../middleware/errorHandler.js";
import { getAuditLogsService } from "../services/audit.service.js";

/**
 * Get audit logs for an entity
 * GET /audit/:entityType/:entityId
 * entityType: "email" | "contact" | "thread" | "action"
 * entityId: numeric ID
 */
export const getAuditLogs = asyncHandler(async (req, res) => {
  const { entityType, entityId } = req.params;

  if (!entityType || !entityId || isNaN(entityId)) {
    return res.status(400).json({
      success: false,
      error_code: "INVALID_PARAMS",
      message: "Invalid entity type or ID",
      details: { entityType, entityId },
    });
  }

  const validTypes = ["email", "contact", "thread", "action"];
  if (!validTypes.includes(entityType)) {
    return res.status(400).json({
      success: false,
      error_code: "INVALID_ENTITY_TYPE",
      message: `Entity type must be one of: ${validTypes.join(", ")}`,
      details: { entityType },
    });
  }

  const logs = await getAuditLogsService(entityType, entityId);

  res.status(200).json({
    success: true,
    data: logs,
    count: logs.length,
  });
});
