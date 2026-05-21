# SenAI — Agentic CRM Intelligence Platform

AI-powered email triage system with autonomous agents, RAG knowledge base, and real-time web intelligence.

## Quick Start

```bash
# Setup
npm install
cd Backend && npm install
cd ../Frontend && npm install

# Create Backend/.env
DATABASE_URL=postgresql://user:password@localhost:5432/senai_crm
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Initialize
cd Backend
npm run migrate
npm run seed:kb
npm run seed:emails

# Run
npm start                # Backend :5000
cd ../Frontend && npm start  # Frontend :3000
```

## How It Works

**Email Ingestion** — Emails arrive via POST /api/ingest. We validate the schema, check for duplicates using message_id, auto-link to existing threads, and assign an initial priority based on keyword heuristics. Handles edge cases like empty body, HTML entities, and extremely long emails (>10k chars).

**Layer 1: Heuristic Filter** — Runs in <10ms. Detects spam via keyword blocklist, flags urgency keywords (URGENT, P0, ransomware), detects security threats, routes internal emails separately. Super fast, no AI needed.

**Layer 2: LLM Classification** — For non-spam emails, we send the full thread history + RAG context to Claude. Returns: category (Complaint, Inquiry, Bug Report, etc.), sentiment score (-1.0 to +1.0), urgency level, extracted entities (order IDs, amounts, deadlines), and confidence score. Low confidence (<0.70) auto-flags for human.

**Layer 3: Sentiment Tracking** — We track sentiment per sender over time. Three consecutive negative emails trigger an escalation alert. This catches churning customers early.

**Layer 4: RAG Knowledge Pipeline** — We chunk your policy documents (pricing, SLA, refunds, compliance, escalation rules) into 300-500 token segments, embed them using sentence-transformers, and store in pgvector. On each email, we retrieve top-3 relevant chunks and inject into the LLM prompt. The agent cites which policy informed the response.

**Layer 5: Autonomous Agent** — A ReAct loop that reasons step-by-step. The agent can call up to 6 tools: search_knowledge_base, get_thread_history, get_contact_profile, check_account_status, draft_reply, escalate_to_human, create_internal_ticket, scrape_public_sentiment, flag_for_legal, send_auto_reply. It builds a reasoning trace (thought → action → observation) and stores it in the database. If it hits 6 calls without resolving, it escalates to a human with a pre-filled brief.

**Layer 6: Web Intelligence** — For reputation-sensitive emails (complaints, churn threats), we scrape G2/Trustpilot scores asynchronously. Results are cached for 6 hours. If scraping fails, the agent still works fine—just without the market data.

## System Architecture Diagram
<img width="1536" height="1024" alt="system_architecture_diagram" src="https://github.com/user-attachments/assets/4297a107-280f-4a18-86b8-282d25ec87b3" />

## Special Scenarios

**GDPR Data Request** — Detects legal keywords (GDPR, Article 20, data portability). Immediately flags for legal team, creates a compliance ticket with the 30-day deadline. NEVER auto-replies with a generic response. The system knows this is a legal obligation.

**Ransomware/Extortion** — Detects threats like "send 2 BTC or we publish data". Flags as Critical security threat, escalates to security immediately, and never replies to the attacker. One more critical rule: never underestimate threats.

**Chatbot Misinformation** — Customer says "your chatbot told me I could get a refund without reason." We retrieve the actual refund policy via RAG, acknowledge the discrepancy, escalate with what the chatbot said vs what policy says, and draft an empathetic reply without admitting liability.

**Churn Crisis** — Customer sends 3+ unreplied emails with negative sentiment and threatens to post a negative review. We detect this pattern, trigger web scraping to check your G2/Trustpilot scores, generate a high-priority escalation, and suggest a retention offer from the knowledge base.

**Conflicting Thread Signals** — Customer says "I love the product but hate the price and want a refund." We read the full thread to understand context. Are they a price-sensitive buyer or a VIP negotiating? We reference the correct pricing tier from RAG, not generic info.

## Frontend Dashboard

**Mission Control Inbox** — All your emails in one view. Filterable by status (All, Needs Human, Auto-Replied, Escalated, Spam). Color-coded badges for sentiment and urgency. Thread grouping so you see conversations, not individual emails. Full-text search across subject and body.

**Thread Workspace** — Deep dive into a conversation. Left side shows email content with entity highlights (amounts, order IDs, deadlines are marked). Center shows the chronological timeline with sentiment indicators. Right side shows the contact profile (VIP status, account value, churn risk score). Below that: the agent's reasoning trace (every thought, action, observation), and the RAG context (which policies were retrieved, similarity scores). Buttons to approve, edit, escalate, or mark as spam.

**Analytics Dashboard** — Sentiment trends over time (per sender or global). Category distribution pie chart. Response time heatmap by hour of day. At-risk accounts panel showing customers with deteriorating sentiment or unresolved threads >48h old. Agent performance metrics: auto-reply rate, escalation rate, average confidence score.

## Database

**contacts** — Customer records. Email, name, company, VIP status, account value, churn risk score.

**threads** — Grouped conversations. Thread ID, subject, sender, first/last activity, status, assigned to.

**emails** — Every message. Thread ID, message_id (UNIQUE for deduplication), sender, subject, body, sentiment, category, urgency, confidence, raw entities (JSON), status.

**actions** — What the agent did. Email ID, action type (Auto-Reply, Escalate, Legal-Flag, Ticket-Created), reasoning log (full thought-action-observation trace as JSON), approval status.

**knowledge_chunks** — Embedded policy documents. Source doc, chunk text, embedding vector (pgvector).

**web_intelligence_cache** — Scraped sentiment data. Source URL, target entity, scraped data (JSON: rating, review count, themes), expiration timestamp.

**audit_log** — Everything that happened. Entity type, entity ID, action, who did it (agent or user), timestamp, diff (what changed).

## Core API

```
POST   /api/ingest                    # Ingest email
GET    /api/status/{job_id}           # Check processing
GET    /dashboard/stats               # Counts: Pending, Replied, Escalated, etc
GET    /threads/{contact_email}       # Full thread with emails + agent logs
POST   /respond/{email_id}            # Send reply
POST   /agent/dry-run/{email_id}      # See what agent would do (no execution)
GET    /rag/search?q=...              # Search knowledge base
GET    /analytics/sentiment-trend     # Sentiment over time
GET    /intelligence/reputation       # Latest public sentiment
GET    /audit/{entity_type}/{id}      # Audit history
PATCH  /contacts/{email}/status       # Update contact status (VIP, Blocked, etc)
```

## Knowledge Base

Create 6 files in `Backend/data/kb/`:
- `pricing_policy.md` — Tiers, discounts, pro-rata rules
- `sla_policy.md` — Uptime SLA, response times, credit formulas
- `refund_policy.md` — 14-day window, exceptions, retention playbook
- `api_docs.md` — Rate limits, deprecations, breaking changes
- `compliance_faq.md` — HIPAA, GDPR, SOC 2, data residency
- `escalation_matrix.md` — Who handles legal, security, VIP churn, GDPR

Run `npm run seed:kb` to chunk, embed, and store these in pgvector.

## Why This Tech Stack

**Node.js + Express** — I needed something that doesn't block when handling multiple emails at once, and Node.js is perfect for that. Plus the Anthropic SDK works really well with JavaScript.

**PostgreSQL** — I went with Postgres because I needed to store both structured data (contacts, threads) and messy JSON metadata (email entities, agent logs) in the same database. JSONB columns let me do both without adding complexity.

**pgvector** — I could have used a separate vector database like Pinecone, but that felt like overkill. pgvector lets me keep embeddings right in Postgres, so I have one database to manage, one backup strategy, one connection string. Simpler is better.

**sentence-transformers** — For embeddings, I didn't want to rely on an external API or pay per token. sentence-transformers is lightweight, runs locally, and works great for semantic search over documents like pricing policies and FAQs.

**React + TypeScript** — I built the frontend in React because managing the dashboard complexity (thread view, agent reasoning panel, analytics charts) is easier with components. TypeScript caught a bunch of bugs before they hit production.

## Edge Cases We Handle

- Empty email body or subject — filtered, marked for review
- Duplicate message_id — checked and rejected (idempotent ingestion)
- Body with only whitespace or HTML entities — detected and sanitized
- Timestamps out of order — thread ordering by timestamp handles this
- Extremely long body (>10k chars) — truncated for LLM processing
- Malformed JSON payloads — rejected with descriptive error


