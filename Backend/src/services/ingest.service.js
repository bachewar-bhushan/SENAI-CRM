import { pool } from "../config/db.js";
import {
  classifyHeuristicService,
  getHeuristicActionService,
} from "./heuristic.service.js";
import {
  classifyEmailService,
} from "./classification.service.js";
import {
  searchKnowledgeBaseService,
} from "./rag.service.js";

/**
 * Basic email ingestion (backwards compatible)
 */
export const ingestEmailService = async (emailData) => {
  const {
    thread_id,
    message_id,
    sender,
    subject,
    body,
    timestamp,
  } = emailData;

  // STEP 1: Check duplicate message_id
  const existingEmailQuery = `
    SELECT id FROM emails WHERE message_id = $1
  `;

  const existingEmail = await pool.query(
    existingEmailQuery,
    [message_id]
  );

  if (existingEmail.rows.length > 0) {
    throw new Error("Duplicate message_id");
  }

  // STEP 2: Find or create thread
  const threadQuery = `
    SELECT id FROM threads WHERE thread_id = $1
  `;

  const existingThread = await pool.query(threadQuery, [thread_id]);

  let dbThreadId;

  if (existingThread.rows.length === 0) {
    const createThreadQuery = `
      INSERT INTO threads (
        thread_id,
        subject,
        sender_email,
        first_seen_at,
        last_updated_at
      )
      VALUES ($1, $2, $3, NOW(), NOW())
      RETURNING id
    `;

    const newThread = await pool.query(createThreadQuery, [
      thread_id,
      subject,
      sender,
    ]);

    dbThreadId = newThread.rows[0].id;
  } else {
    dbThreadId = existingThread.rows[0].id;
  }

  // STEP 3: Insert email with basic fields
  const insertEmailQuery = `
    INSERT INTO emails (
      thread_id,
      message_id,
      sender,
      subject,
      body,
      timestamp,
      status
    )
    VALUES (
      $1, $2, $3, $4, $5, $6, 'Received'
    )
    RETURNING *
  `;

  const insertedEmail = await pool.query(insertEmailQuery, [
    dbThreadId,
    message_id,
    sender,
    subject,
    body,
    timestamp,
  ]);

  return insertedEmail.rows[0];
};

/**
 * Enhanced ingestion with intelligence pipeline
 * Runs heuristic filter + LLM classification + updates email record
 */
export const ingestAndClassifyEmailService = async (emailData) => {
  try {
    // Step 1: Basic ingestion
    const email = await ingestEmailService(emailData);

    // Step 2: Heuristic classification (fast, <10ms)
    const heuristics = classifyHeuristicService({
      sender: email.sender,
      subject: email.subject,
      body: email.body,
    });

    // Step 3: Get quick heuristic action
    const heuristicAction = getHeuristicActionService(heuristics);

    // Step 4: If heuristic says skip LLM, update email and return
    if (heuristicAction.skipLLM) {
      const updateQuery = `
        UPDATE emails
        SET
          category = $1,
          urgency = $2,
          requires_human = $3,
          status = 'Processed',
          confidence = $4
        WHERE id = $5
        RETURNING *
      `;

      const updated = await pool.query(updateQuery, [
        heuristicAction.category,
        heuristicAction.urgency,
        heuristicAction.requires_human,
        0.95, // High confidence from heuristics
        email.id,
      ]);

      return updated.rows[0];
    }

    // Step 5: Get thread history for context
    const threadQuery = `
      SELECT *
      FROM emails
      WHERE thread_id = $1
      AND id != $2
      ORDER BY timestamp ASC
      LIMIT 5
    `;

    const threadResult = await pool.query(threadQuery, [
      email.thread_id,
      email.id,
    ]);

    // Step 6: Get RAG context
    const ragChunks = await searchKnowledgeBaseService(
      `${email.subject} ${email.body.substring(0, 200)}`
    );

    // Step 7: LLM classification
    const classification = await classifyEmailService(
      email,
      threadResult.rows,
      ragChunks
    );

    // Step 8: Update email with classification results
    const updateQuery = `
      UPDATE emails
      SET
        category = $1,
        sentiment_score = $2,
        urgency = $3,
        requires_human = $4,
        confidence = $5,
        raw_entities = $6,
        status = 'Processed'
      WHERE id = $7
      RETURNING *
    `;

    const updated = await pool.query(updateQuery, [
      classification.category,
      classification.sentiment_score,
      classification.urgency,
      classification.requires_human,
      classification.confidence,
      JSON.stringify(classification.detected_entities),
      email.id,
    ]);

    // Step 9: Upsert contact record
    await upsertContactService(email.sender, {
      last_email_sentiment: classification.sentiment_score,
      last_contact_at: email.timestamp,
    });

    return updated.rows[0];
  } catch (error) {
    console.error(
      "Ingest and classify error:",
      error
    );
    throw error;
  }
};

/**
 * Upsert contact record (create if not exists)
 */
export const upsertContactService = async (
  email,
  updates = {}
) => {
  const upsertQuery = `
    INSERT INTO contacts (
      email,
      last_contact_at,
      created_at
    )
    VALUES ($1, COALESCE($2, NOW()), NOW())
    ON CONFLICT (email) DO UPDATE SET
      last_contact_at = COALESCE($2, contacts.last_contact_at)
    RETURNING *
  `;

  const result = await pool.query(upsertQuery, [
    email,
    updates.last_contact_at,
  ]);

  return result.rows[0];
};

/**
 * Get job status
 */
export const getJobStatusService = async (jobId) => {
  const query = `
    SELECT id, status, created_at
    FROM emails
    WHERE id = $1
  `;

  const result = await pool.query(query, [jobId]);

  if (result.rows.length === 0) {
    return {
      jobId,
      status: "not_found",
      message: "Email not found",
    };
  }

  const email = result.rows[0];
  return {
    jobId,
    status:
      email.status === "Received"
        ? "processing"
        : email.status.toLowerCase(),
    message: `Email status: ${email.status}`,
    created_at: email.created_at,
  };
};