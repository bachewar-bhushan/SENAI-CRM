import { pool } from "../config/db.js";

/**
 * Get audit logs for an entity
 * Queries the actions table which tracks all significant changes
 */
export const getAuditLogsService = async (entityType, entityId) => {
  let query;

  if (entityType === "email") {
    query = `
      SELECT
        id,
        email_id,
        action_type,
        description,
        created_by,
        created_at,
        proposed_content,
        is_approved,
        approved_by
      FROM actions
      WHERE email_id = $1
      ORDER BY created_at DESC
    `;
  } else if (entityType === "thread") {
    query = `
      SELECT
        a.id,
        a.email_id,
        a.action_type,
        a.description,
        a.created_by,
        a.created_at,
        a.proposed_content,
        a.is_approved,
        a.approved_by
      FROM actions a
      JOIN emails e ON a.email_id = e.id
      WHERE e.thread_id = $1
      ORDER BY a.created_at DESC
    `;
  } else if (entityType === "contact") {
    query = `
      SELECT
        a.id,
        a.email_id,
        a.action_type,
        a.description,
        a.created_by,
        a.created_at,
        a.proposed_content,
        a.is_approved,
        a.approved_by
      FROM actions a
      JOIN emails e ON a.email_id = e.id
      WHERE e.sender = (SELECT email FROM contacts WHERE id = $1)
      ORDER BY a.created_at DESC
    `;
  } else if (entityType === "action") {
    query = `
      SELECT
        id,
        email_id,
        action_type,
        description,
        created_by,
        created_at,
        proposed_content,
        is_approved,
        approved_by
      FROM actions
      WHERE id = $1
      ORDER BY created_at DESC
    `;
  }

  const result = await pool.query(query, [entityId]);
  return result.rows;
};
