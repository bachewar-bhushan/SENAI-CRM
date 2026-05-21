import { pool } from "../config/db.js";

export const getThreadByEmailService =
  async (email) => {

    /*
      STEP 1
      Find threads
    */

    const threadQuery = `
      SELECT *
      FROM threads
      WHERE sender_email = $1
      ORDER BY last_updated_at DESC
    `;

    const threadResult =
      await pool.query(
        threadQuery,
        [email]
      );

    /*
      STEP 2
      Get emails for each thread
    */

    const threadsWithEmails =
      await Promise.all(
        threadResult.rows.map(
          async (thread) => {

            const emailsQuery = `
              SELECT *
              FROM emails
              WHERE thread_id = $1
              ORDER BY timestamp ASC
            `;

            const emailsResult =
              await pool.query(
                emailsQuery,
                [thread.id]
              );

            return {
              ...thread,
              emails:
                emailsResult.rows,
            };
          }
        )
      );

    return threadsWithEmails;
  };

export const respondToEmailService =
  async (emailId, replyData) => {

    const { message } = replyData;

    /*
      STEP 1
      Update email status
    */

    const updateQuery = `
      UPDATE emails
      SET status = 'Replied'
      WHERE id = $1
      RETURNING *
    `;

    const result =
      await pool.query(
        updateQuery,
        [emailId]
      );

    /*
      STEP 2
      Create action log
    */

    const actionQuery = `
      INSERT INTO actions (
        email_id,
        action_type,
        proposed_content,
        executed_at
      )
      VALUES (
        $1,
        'Auto-Reply',
        $2,
        NOW()
      )
    `;

    await pool.query(
      actionQuery,
      [emailId, message]
    );

    return {
      email: result.rows[0],
      reply: message,
    };
  };

export const getThreadActionsService =
  async (email) => {

    const query = `
      SELECT
        actions.*
      FROM actions

      JOIN emails
      ON actions.email_id = emails.id

      WHERE emails.sender = $1

      ORDER BY actions.executed_at DESC
    `;

    const result =
      await pool.query(
        query,
        [email]
      );

    return result.rows;
  };

export const getThreadSummaryService =
  async (email) => {

    const query = `
      SELECT
        subject,
        category,
        urgency,
        sentiment_score
      FROM emails

      WHERE sender = $1

      ORDER BY timestamp DESC
      LIMIT 5
    `;

    const result =
      await pool.query(
        query,
        [email]
      );

    return {
      email,
      recent_activity:
        result.rows,
    };
  };