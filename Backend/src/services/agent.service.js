import { pool } from "../config/db.js";
import { generateReplyService } from "./llm.service.js";
import { searchKnowledgeBaseService } from "./rag.service.js";
import {
  detectSentimentDeteriorationService,
} from "./analytics.service.js";

/**
 * Agent Tool Implementations
 * Each tool returns { success, data, observation }
 */

// Tool 1: Search Knowledge Base
async function tool_search_knowledge_base(query) {
  try {
    const chunks = await searchKnowledgeBaseService(query);
    return {
      success: true,
      observation: `Found ${chunks.length} KB chunks. Sources: ${chunks
        .map((c) => c.source_doc)
        .join(", ")}`,
      data: chunks,
    };
  } catch (error) {
    return {
      success: false,
      observation: `KB search failed: ${error.message}`,
      data: [],
    };
  }
}

// Tool 2: Get Thread History
async function tool_get_thread_history(senderEmail) {
  try {
    const query = `
      SELECT *
      FROM emails
      WHERE sender = $1
      ORDER BY timestamp ASC
      LIMIT 10
    `;
    const result = await pool.query(query, [senderEmail]);
    return {
      success: true,
      observation: `Retrieved ${result.rows.length} emails from sender`,
      data: result.rows,
    };
  } catch (error) {
    return {
      success: false,
      observation: `Failed to get thread history: ${error.message}`,
      data: [],
    };
  }
}

// Tool 3: Get Contact Profile
async function tool_get_contact_profile(email) {
  try {
    const query = `
      SELECT *
      FROM contacts
      WHERE email = $1
    `;
    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      return {
        success: true,
        observation: "Contact not found in system (first-time contact)",
        data: null,
      };
    }

    const contact = result.rows[0];
    return {
      success: true,
      observation: `Contact: ${contact.name} | Company: ${contact.company} | Status: ${contact.status}`,
      data: contact,
    };
  } catch (error) {
    return {
      success: false,
      observation: `Profile lookup failed: ${error.message}`,
      data: null,
    };
  }
}

// Tool 4: Check Account Status
async function tool_check_account_status(email) {
  try {
    const result = await tool_get_contact_profile(email);
    const contact = result.data;

    if (!contact) {
      return {
        success: true,
        observation: "No account history found",
        data: { status: "new", account_value: 0 },
      };
    }

    return {
      success: true,
      observation: `Account Value: $${contact.account_value || 0} | Churn Risk: ${
        contact.churn_risk_score || 0
      }/10`,
      data: {
        status: contact.status,
        account_value: contact.account_value,
        churn_risk: contact.churn_risk_score,
      },
    };
  } catch (error) {
    return {
      success: false,
      observation: `Account status check failed: ${error.message}`,
      data: null,
    };
  }
}

// Tool 5: Draft Reply
async function tool_draft_reply(context, tone = "professional") {
  try {
    const reply = await generateReplyService(context, tone);
    return {
      success: true,
      observation: `Generated ${tone} reply (${reply.length} chars)`,
      data: { reply, tone },
    };
  } catch (error) {
    return {
      success: false,
      observation: `Reply generation failed: ${error.message}`,
      data: null,
    };
  }
}

// Tool 6: Escalate to Human
async function tool_escalate_to_human(emailId, reason, priority) {
  try {
    const query = `
      INSERT INTO actions (
        email_id,
        action_type,
        agent_reasoning_log,
        executed_at
      )
      VALUES ($1, $2, $3, NOW())
      RETURNING *
    `;

    const actionLog = {
      reason,
      priority,
      escalated_at: new Date().toISOString(),
    };

    const result = await pool.query(query, [
      emailId,
      "Escalate",
      JSON.stringify(actionLog),
    ]);

    // Update email status
    await pool.query("UPDATE emails SET status = $1 WHERE id = $2", [
      "Escalated",
      emailId,
    ]);

    return {
      success: true,
      observation: `Escalated to human (Priority: ${priority})`,
      data: result.rows[0],
    };
  } catch (error) {
    return {
      success: false,
      observation: `Escalation failed: ${error.message}`,
      data: null,
    };
  }
}

// Tool 7: Create Internal Ticket
async function tool_create_internal_ticket(title, body, assignee) {
  try {
    const query = `
      INSERT INTO actions (
        action_type,
        proposed_content,
        agent_reasoning_log,
        executed_at
      )
      VALUES ($1, $2, $3, NOW())
      RETURNING *
    `;

    const ticketData = { title, body, assignee, created_at: new Date().toISOString() };

    const result = await pool.query(query, [
      "Ticket-Created",
      body,
      JSON.stringify(ticketData),
    ]);

    return {
      success: true,
      observation: `Created ticket: "${title}" (assigned to ${assignee})`,
      data: result.rows[0],
    };
  } catch (error) {
    return {
      success: false,
      observation: `Ticket creation failed: ${error.message}`,
      data: null,
    };
  }
}

// Tool 8: Flag for Legal
async function tool_flag_for_legal(emailId, issueType) {
  try {
    const query = `
      INSERT INTO actions (
        email_id,
        action_type,
        agent_reasoning_log,
        executed_at
      )
      VALUES ($1, $2, $3, NOW())
      RETURNING *
    `;

    const legalData = {
      issue_type: issueType,
      flagged_at: new Date().toISOString(),
    };

    const result = await pool.query(query, [
      emailId,
      "Legal-Flag",
      JSON.stringify(legalData),
    ]);

    return {
      success: true,
      observation: `Flagged for legal review (${issueType})`,
      data: result.rows[0],
    };
  } catch (error) {
    return {
      success: false,
      observation: `Legal flag failed: ${error.message}`,
      data: null,
    };
  }
}

// Tool 9: Scrape Public Sentiment
async function tool_scrape_public_sentiment(companyName) {
  try {
    // Check cache first
    const cacheQuery = `
      SELECT *
      FROM web_intelligence_cache
      WHERE target_entity ILIKE $1
      AND expires_at > NOW()
      ORDER BY scraped_at DESC
      LIMIT 1
    `;

    const cacheResult = await pool.query(cacheQuery, [`%${companyName}%`]);

    if (cacheResult.rows.length > 0) {
      const cached = cacheResult.rows[0];
      return {
        success: true,
        observation: `G2/Trustpilot: ${cached.scraped_data.rating} stars (cached)`,
        data: cached.scraped_data,
      };
    }

    // Fallback: return placeholder (real scraping would go here)
    return {
      success: true,
      observation: `Public sentiment lookup (no cached data available)`,
      data: {
        rating: "N/A",
        review_count: 0,
        common_themes: ["No data"],
      },
    };
  } catch (error) {
    return {
      success: false,
      observation: `Sentiment scrape failed: ${error.message}`,
      data: null,
    };
  }
}

/**
 * Map tool name to function
 */
const AGENT_TOOLS = {
  search_knowledge_base: tool_search_knowledge_base,
  get_thread_history: tool_get_thread_history,
  get_contact_profile: tool_get_contact_profile,
  check_account_status: tool_check_account_status,
  draft_reply: tool_draft_reply,
  escalate_to_human: tool_escalate_to_human,
  create_internal_ticket: tool_create_internal_ticket,
  flag_for_legal: tool_flag_for_legal,
  scrape_public_sentiment: tool_scrape_public_sentiment,
};

/**
 * Special Scenario Detectors
 */

function detectGDPR(email) {
  const text = `${email.subject} ${email.body}`.toLowerCase();
  return (
    text.includes("gdpr") ||
    text.includes("article 20") ||
    text.includes("data portability") ||
    text.includes("right to erasure") ||
    text.includes("data export")
  );
}

function detectRansomware(email) {
  const text = `${email.subject} ${email.body}`.toLowerCase();
  return (
    (text.includes("ransomware") || text.includes("btc") || text.includes("bitcoin")) &&
    (text.includes("exfiltrated") || text.includes("dark web") || text.includes("publish"))
  );
}

function detectChatbotMisinformation(email) {
  const text = `${email.subject} ${email.body}`.toLowerCase();
  return (
    text.includes("chatbot") ||
    text.includes("ai told me") ||
    text.includes("bot said")
  );
}

/**
 * Main Agent ReAct Loop
 */
export const runAgentService = async (emailId, dryRun = false) => {
  try {
    // Step 1: Fetch email
    const emailQuery = `SELECT * FROM emails WHERE id = $1`;
    const emailResult = await pool.query(emailQuery, [emailId]);

    if (emailResult.rows.length === 0) {
      throw new Error("Email not found");
    }

    const email = emailResult.rows[0];
    const reasoningTrace = [];

    // Step 2: Check special scenarios (hard rules, no LLM needed)

    // GDPR Request
    if (detectGDPR(email)) {
      reasoningTrace.push({
        thought: "GDPR data portability request detected",
        action: "flag_for_legal",
        tool_args: { emailId, issueType: "GDPR_ARTICLE_20" },
        observation: "Flagged for compliance team",
      });

      if (!dryRun) {
        await tool_flag_for_legal(emailId, "GDPR_ARTICLE_20");
        await tool_create_internal_ticket(
          `GDPR Data Request from ${email.sender}`,
          `Formal GDPR Article 20 data portability request. Must fulfill within 30 days.`,
          "compliance"
        );
      }

      reasoningTrace.push({
        thought: "Created compliance ticket for 30-day fulfillment",
        action: "escalate_to_human",
        tool_args: { priority: "P0" },
        observation: "Escalated to human",
      });

      if (!dryRun) {
        await tool_escalate_to_human(
          emailId,
          "GDPR request requires legal/compliance review",
          "P0"
        );
      }

      return {
        success: true,
        email,
        reasoning_trace: reasoningTrace,
        final_action: "Escalate to Compliance Team",
        dry_run: dryRun,
      };
    }

    // Ransomware Threat
    if (detectRansomware(email)) {
      reasoningTrace.push({
        thought: "RANSOMWARE/SECURITY THREAT DETECTED",
        action: "flag_for_legal + escalate",
        tool_args: { priority: "P0_SECURITY" },
        observation: "Critical security threat detected",
      });

      if (!dryRun) {
        await tool_flag_for_legal(emailId, "RANSOMWARE_THREAT");
        await tool_escalate_to_human(
          emailId,
          "RANSOMWARE/EXTORTION THREAT - DO NOT REPLY",
          "P0"
        );
      }

      return {
        success: true,
        email,
        reasoning_trace: reasoningTrace,
        final_action: "ESCALATE TO SECURITY TEAM - DO NOT REPLY",
        dry_run: dryRun,
      };
    }

    // Step 3: THOUGHT phase - analyze email
    reasoningTrace.push({
      thought: `Analyzing email from ${email.sender}: "${email.subject.substring(0, 50)}"
Priority: ${email.urgency || "not classified"}
Category: ${email.category || "unclassified"}
Sentiment: ${(email.sentiment_score || 0).toFixed(2)}`,
      action: "analyze",
      observation: "Email loaded and initial assessment complete",
    });

    // Step 4: ReAct Loop (max 6 iterations)
    let toolCallCount = 0;
    const maxToolCalls = 6;
    let isResolved = false;

    while (toolCallCount < maxToolCalls && !isResolved) {
      toolCallCount++;

      // Decide next tool to call based on email characteristics
      let nextTool = null;
      let toolArgs = {};

      if (toolCallCount === 1) {
        // First tool: get thread history for context
        nextTool = "get_thread_history";
        toolArgs = { senderEmail: email.sender };
      } else if (toolCallCount === 2) {
        // Second: check contact profile
        nextTool = "get_contact_profile";
        toolArgs = { email: email.sender };
      } else if (toolCallCount === 3) {
        // Third: search relevant KB
        nextTool = "search_knowledge_base";
        toolArgs = {
          query: `${email.subject} ${email.body.substring(0, 100)}`,
        };
      } else if (
        email.urgency === "Critical" ||
        email.requires_human === true
      ) {
        // Critical or flagged for human: escalate immediately
        nextTool = "escalate_to_human";
        toolArgs = {
          emailId,
          reason: `Requires human review (Urgency: ${email.urgency}, Confidence: ${email.confidence})`,
          priority: "P0",
        };
        isResolved = true;
      } else if (email.category === "Complaint" && email.sentiment_score < -0.5) {
        // Negative complaint: check for churn pattern
        const deterioResult = await detectSentimentDeteriorationService(
          email.sender
        );
        if (deterioResult.deteriorating) {
          nextTool = "scrape_public_sentiment";
          toolArgs = { companyName: "SenAI" };
        } else {
          // Draft professional reply
          nextTool = "draft_reply";
          toolArgs = {
            context: `Customer complaint: ${email.body.substring(0, 200)}`,
            tone: "empathetic",
          };
        }
      } else {
        // Default: draft reply and mark resolved
        nextTool = "draft_reply";
        toolArgs = {
          context: `Customer inquiry: ${email.body.substring(0, 200)}`,
          tone: "professional",
        };
        isResolved = true;
      }

      if (!nextTool) break;

      // Execute tool (or log for dry-run)
      const toolFn = AGENT_TOOLS[nextTool];
      let toolResult;

      if (toolFn) {
        toolResult = await toolFn(...Object.values(toolArgs));
      } else {
        toolResult = { success: false, observation: `Tool not found: ${nextTool}` };
      }

      reasoningTrace.push({
        thought: `Executing tool: ${nextTool}`,
        action: nextTool,
        tool_args: toolArgs,
        observation: toolResult.observation,
        success: toolResult.success,
      });

      if (nextTool === "escalate_to_human") {
        isResolved = true;
      }
    }

    // Step 5: Determine final action
    let finalAction = "No action taken";

    if (toolCallCount >= maxToolCalls && !isResolved) {
      // Hit max tool calls: escalate
      if (!dryRun) {
        await tool_escalate_to_human(
          emailId,
          "Agent reached max tool calls - requires human review",
          "P1"
        );
      }
      finalAction = "Escalated to human (max tool calls exceeded)";
    } else if (email.urgency === "Critical") {
      finalAction = "Critical urgency - escalated to human";
    }

    // Step 6: Store reasoning log
    if (!dryRun) {
      const logQuery = `
        INSERT INTO actions (
          email_id,
          agent_reasoning_log,
          action_type,
          executed_at
        )
        VALUES ($1, $2, $3, NOW())
      `;

      await pool.query(logQuery, [
        emailId,
        JSON.stringify(reasoningTrace),
        finalAction.includes("Escalated") ? "Escalate" : "Auto-Reply",
      ]);
    }

    return {
      success: true,
      email,
      reasoning_trace: reasoningTrace,
      final_action: finalAction,
      dry_run: dryRun,
      tool_calls: toolCallCount,
    };
  } catch (error) {
    console.error("Agent error:", error);
    throw error;
  }
};

/**
 * Run agent in dry-run mode (no execution, just planning)
 */
export const dryRunAgentService = async (emailId) => {
  return runAgentService(emailId, true);
};
