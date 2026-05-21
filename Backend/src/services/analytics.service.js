import { pool } from "../config/db.js";

/**
 * Get dashboard statistics
 */
export const getDashboardStatsService = async () => {
  const query = `
    SELECT
      COUNT(*) FILTER (WHERE status = 'Received') AS pending,
      COUNT(*) FILTER (WHERE status = 'Replied') AS replied,
      COUNT(*) FILTER (WHERE status = 'Escalated') AS escalated,
      COUNT(*) FILTER (WHERE urgency = 'Critical') AS critical,
      COUNT(*) FILTER (WHERE category = 'Spam') AS spam
    FROM emails
  `;

  const result = await pool.query(query);
  return result.rows[0] || {};
};

/**
 * Get sentiment trend for a sender (all emails, no date filter)
 */
export const getSentimentTrendService = async (queryParams) => {
  const { sender } = queryParams;

  const query = `
    SELECT
      DATE(timestamp) AS date,
      AVG(sentiment_score) AS average_sentiment,
      COUNT(*) AS email_count,
      sender
    FROM emails
    WHERE sender = $1
    GROUP BY DATE(timestamp), sender
    ORDER BY date ASC
  `;

  const result = await pool.query(query, [sender]);
  return result.rows;
};

/**
 * Get category breakdown
 */
export const getCategoryBreakdownService = async () => {
  const query = `
    SELECT
      category,
      COUNT(*) AS total
    FROM emails
    WHERE category IS NOT NULL
    GROUP BY category
    ORDER BY total DESC
  `;

  const result = await pool.query(query);
  return result.rows;
};

/**
 * Detect sentiment deterioration for a sender
 * Returns true if 3+ consecutive negative emails detected
 */
export const detectSentimentDeteriorationService = async (sender) => {
  try {
    const query = `
      SELECT
        id,
        sender,
        sentiment_score,
        timestamp,
        subject
      FROM emails
      WHERE sender = $1
      AND sentiment_score IS NOT NULL
      ORDER BY timestamp DESC
      LIMIT 3
    `;

    const result = await pool.query(query, [sender]);

    if (result.rows.length < 3) {
      return { deteriorating: false, reason: "Not enough emails" };
    }

    // Check if all 3 most recent emails are negative (score < -0.3)
    const allNegative = result.rows.every(
      (email) => email.sentiment_score < -0.3
    );

    if (allNegative) {
      return {
        deteriorating: true,
        reason: "3 consecutive negative emails",
        emails: result.rows.map((e) => ({
          id: e.id,
          sentiment: e.sentiment_score,
          timestamp: e.timestamp,
        })),
      };
    }

    return { deteriorating: false, reason: "Sentiment stable" };
  } catch (error) {
    console.error("Deterioration detection error:", error);
    return { deteriorating: false, error: error.message };
  }
};

/**
 * Get at-risk accounts (negative sentiment trend + unresolved threads) - all data
 */
export const getAtRiskAccountsService = async () => {
  const query = `
    SELECT
      c.email,
      c.name,
      c.company,
      COUNT(e.id) AS unresolved_count,
      AVG(e.sentiment_score) AS avg_sentiment,
      MAX(e.timestamp) AS last_email_date,
      COUNT(CASE WHEN e.sentiment_score < -0.3 THEN 1 END) AS negative_count
    FROM contacts c
    LEFT JOIN emails e ON c.email = e.sender AND e.status = 'Received'
    GROUP BY c.id, c.email, c.name, c.company
    HAVING
      COUNT(e.id) > 0
      AND (AVG(e.sentiment_score) < -0.3 OR COUNT(e.id) > 2)
    ORDER BY avg_sentiment ASC, unresolved_count DESC
    LIMIT 20
  `;

  const result = await pool.query(query);
  return result.rows;
};

/**
 * Get agent performance metrics - all data
 */
export const getAgentPerformanceService = async () => {
  const query = `
    SELECT
      COUNT(*) FILTER (WHERE action_type = 'Auto-Reply') AS auto_reply_count,
      COUNT(*) FILTER (WHERE action_type = 'Escalate') AS escalation_count,
      COUNT(*) FILTER (WHERE action_type = 'Ticket-Created') AS ticket_count,
      COUNT(*) FILTER (WHERE action_type = 'Legal-Flag') AS legal_flag_count,
      AVG(
        (SELECT confidence FROM emails WHERE emails.id = actions.email_id)
      ) AS avg_confidence,
      COUNT(*) AS total_actions
    FROM actions
  `;

  const result = await pool.query(query);

  if (result.rows.length === 0) {
    return {
      auto_reply_count: 0,
      escalation_count: 0,
      ticket_count: 0,
      legal_flag_count: 0,
      avg_confidence: 0,
      total_actions: 0,
    };
  }

  const stats = result.rows[0];
  const totalActions = stats.total_actions || 1;

  return {
    ...stats,
    auto_reply_rate: (
      ((stats.auto_reply_count || 0) / totalActions) *
      100
    ).toFixed(1),
    escalation_rate: (
      ((stats.escalation_count || 0) / totalActions) *
      100
    ).toFixed(1),
    avg_confidence: (stats.avg_confidence || 0).toFixed(2),
  };
};

/**
 * Get response time stats - all data
 */
export const getResponseTimeStatsService = async () => {
  const query = `
    SELECT
      EXTRACT(HOUR FROM timestamp) AS hour,
      COUNT(*) AS email_count,
      AVG(
        EXTRACT(EPOCH FROM (
          SELECT timestamp FROM emails e2
          WHERE e2.id IN (
            SELECT email_id FROM actions
            WHERE action_type = 'Auto-Reply'
          )
        ) - emails.timestamp) / 3600
      ) AS avg_response_hours
    FROM emails
    GROUP BY EXTRACT(HOUR FROM timestamp)
    ORDER BY hour ASC
  `;

  const result = await pool.query(query);
  return result.rows;
};

/**
 * Get all emails without date restrictions
 */
export const getAllEmailsService = async () => {
  const query = `
    SELECT
      e.id,
      e.message_id,
      e.thread_id,
      e.sender,
      e.subject,
      e.body,
      e.timestamp,
      e.status,
      e.category,
      e.urgency,
      e.sentiment_score,
      e.requires_human,
      e.confidence,
      e.raw_entities
    FROM emails e
    ORDER BY e.timestamp DESC
  `;

  const result = await pool.query(query);
  return result.rows;
};