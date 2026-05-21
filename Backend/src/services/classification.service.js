import {
  generateStructuredResponseService,
} from "./llm.service.js";

/**
 * Classification System Prompt
 * Instructs LLM to return consistent JSON structure
 */
const CLASSIFICATION_SYSTEM_PROMPT = `You are an expert customer support AI classifier. Analyze the provided email and return a structured JSON response with these exact fields:

{
  "category": "Complaint|Inquiry|Bug Report|Feature Request|Compliance|Legal|Billing|Spam|Internal|Other",
  "sentiment": "Positive|Neutral|Negative|Mixed",
  "sentiment_score": number between -1.0 and 1.0,
  "urgency": "Critical|High|Medium|Low",
  "requires_human": boolean,
  "escalation_reason": "reason string or null",
  "suggested_reply": "draft reply string or null",
  "confidence": number between 0.0 and 1.0,
  "detected_entities": {
    "order_ids": [],
    "ticket_ids": [],
    "monetary_amounts": [],
    "deadlines": [],
    "products_mentioned": []
  },
  "rag_sources_cited": []
}

Rules:
- If urgency = Critical, set requires_human = true and suggested_reply = null
- If confidence < 0.70, force requires_human = true
- Sentiment range: -1.0 (very negative) to +1.0 (very positive)
- Extract any identifiable entities (amounts, dates, product names, IDs)
- Ensure suggested_reply is professional and empathetic
- If escalation_reason is not needed, set it to null`;

/**
 * Build user prompt with email context, thread history, and RAG results
 */
function buildClassificationPrompt(email, threadHistory = [], ragChunks = []) {
  let prompt = `Analyze this email:\n\n`;

  // Add email details
  prompt += `From: ${email.sender}\n`;
  prompt += `Subject: ${email.subject}\n`;
  prompt += `Timestamp: ${email.timestamp}\n`;
  prompt += `Body:\n${email.body}\n\n`;

  // Add thread context
  if (threadHistory && threadHistory.length > 0) {
    prompt += `--- Thread History (${threadHistory.length} emails) ---\n`;
    threadHistory.forEach((msg, idx) => {
      prompt += `[${idx + 1}] From: ${msg.sender} | ${new Date(
        msg.timestamp
      ).toLocaleDateString()}\n`;
      prompt += `Subject: ${msg.subject}\n`;
      prompt += `${msg.body.substring(0, 200)}...\n\n`;
    });
  }

  // Add RAG context
  if (ragChunks && ragChunks.length > 0) {
    prompt += `--- Relevant Policy Context (from Knowledge Base) ---\n`;
    ragChunks.forEach((chunk, idx) => {
      prompt += `[Policy: ${chunk.source_doc} | Similarity: ${chunk.similarity_score}]\n`;
      prompt += `${chunk.chunk_text.substring(0, 300)}...\n\n`;
    });
  }

  return prompt;
}

/**
 * Classify email with LLM
 * Returns structured classification result
 */
export const classifyEmailService = async (
  email,
  threadHistory = [],
  ragChunks = []
) => {
  try {
    // Validate input
    if (!email || !email.sender || !email.body) {
      throw new Error("Invalid email: missing required fields");
    }

    // Build classification prompt
    const userPrompt = buildClassificationPrompt(email, threadHistory, ragChunks);

    // Call LLM with structured output
    const classification = await generateStructuredResponseService(
      CLASSIFICATION_SYSTEM_PROMPT,
      userPrompt
    );

    // Validate response structure
    validateClassificationResponse(classification);

    // Apply post-processing rules
    const enrichedClassification = applyClassificationRules(classification);

    return enrichedClassification;
  } catch (error) {
    console.error("Classification service error:", error);

    // Return default classification on error
    return getDefaultClassification(error.message);
  }
};

/**
 * Validate classification response has all required fields
 */
function validateClassificationResponse(classification) {
  const requiredFields = [
    "category",
    "sentiment",
    "sentiment_score",
    "urgency",
    "requires_human",
    "confidence",
    "detected_entities",
  ];

  for (const field of requiredFields) {
    if (!(field in classification)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  // Validate enum values
  const validCategories = [
    "Complaint",
    "Inquiry",
    "Bug Report",
    "Feature Request",
    "Compliance",
    "Legal",
    "Billing",
    "Spam",
    "Internal",
    "Other",
  ];

  if (!validCategories.includes(classification.category)) {
    throw new Error(`Invalid category: ${classification.category}`);
  }

  // Validate numeric ranges
  if (
    classification.sentiment_score < -1.0 ||
    classification.sentiment_score > 1.0
  ) {
    throw new Error("sentiment_score must be between -1.0 and 1.0");
  }

  if (
    classification.confidence < 0.0 ||
    classification.confidence > 1.0
  ) {
    throw new Error("confidence must be between 0.0 and 1.0");
  }
}

/**
 * Apply post-processing rules to classification
 * - If confidence < 0.70, force requires_human = true
 * - If urgency = Critical, force requires_human = true + no suggested reply
 * - Normalize sentiment values
 */
function applyClassificationRules(classification) {
  const result = { ...classification };

  // Rule 1: Low confidence → always require human
  if (result.confidence < 0.70) {
    result.requires_human = true;
    result.escalation_reason =
      result.escalation_reason ||
      "Low confidence classification - requires human review";
  }

  // Rule 2: Critical urgency → always require human, no auto-reply
  if (result.urgency === "Critical") {
    result.requires_human = true;
    result.suggested_reply = null;
  }

  // Rule 3: Ensure entities are arrays
  if (!result.detected_entities) {
    result.detected_entities = {
      order_ids: [],
      ticket_ids: [],
      monetary_amounts: [],
      deadlines: [],
      products_mentioned: [],
    };
  }

  // Rule 4: Clamp sentiment score
  result.sentiment_score = Math.max(
    -1.0,
    Math.min(1.0, result.sentiment_score)
  );

  // Rule 5: Map sentiment
  if (result.sentiment_score > 0.3) {
    result.sentiment = "Positive";
  } else if (result.sentiment_score > -0.3) {
    result.sentiment = "Neutral";
  } else if (result.sentiment_score < -0.6) {
    result.sentiment = "Negative";
  } else {
    result.sentiment = "Mixed";
  }

  return result;
}

/**
 * Return default classification on error
 * Conservative: mark for human review
 */
function getDefaultClassification(errorMessage = "") {
  return {
    category: "Other",
    sentiment: "Neutral",
    sentiment_score: 0,
    urgency: "Medium",
    requires_human: true,
    escalation_reason: `Classification error: ${errorMessage}. Requires human review.`,
    suggested_reply: null,
    confidence: 0.3,
    detected_entities: {
      order_ids: [],
      ticket_ids: [],
      monetary_amounts: [],
      deadlines: [],
      products_mentioned: [],
    },
    rag_sources_cited: [],
  };
}

/**
 * Classify multiple emails (batch processing)
 */
export const classifyEmailsService = async (emails) => {
  const results = [];

  for (const email of emails) {
    const classification = await classifyEmailService(email);
    results.push({
      email_id: email.id,
      message_id: email.message_id,
      classification,
    });
  }

  return results;
};

/**
 * Get sentiment description for UI
 */
export const getSentimentDescription = (score) => {
  if (score >= 0.7) return { label: "Very Positive", color: "green" };
  if (score >= 0.3) return { label: "Positive", color: "lightgreen" };
  if (score >= -0.3) return { label: "Neutral", color: "gray" };
  if (score >= -0.7) return { label: "Negative", color: "orange" };
  return { label: "Very Negative", color: "red" };
};

/**
 * Get urgency color for UI
 */
export const getUrgencyColor = (urgency) => {
  switch (urgency) {
    case "Critical":
      return "red";
    case "High":
      return "orange";
    case "Medium":
      return "blue";
    case "Low":
      return "gray";
    default:
      return "gray";
  }
};
