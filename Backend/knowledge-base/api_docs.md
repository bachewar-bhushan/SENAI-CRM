# API Documentation

## Base URL

\\\
https://api.senai.io/v1
https://api.senai.io/v2
\\\

## Rate Limits

### By Plan

**Starter Plan**
- Requests per minute: 60
- Concurrent connections: 10
- Daily limit: 100,000 requests

**Professional Plan**
- Requests per minute: 300
- Concurrent connections: 50
- Daily limit: 1,000,000 requests

**Enterprise Plan**
- Requests per minute: Custom (typically 1,000+)
- Concurrent connections: Unlimited
- Daily limit: Custom

### Rate Limit Headers

\\\
X-RateLimit-Limit: 300
X-RateLimit-Remaining: 299
X-RateLimit-Reset: 1621234567
\\\

When limit exceeded: HTTP 429 (Too Many Requests)

## API Versioning

### v1 (Legacy - Deprecated Dec 31, 2023)

- Last day of support: December 31, 2023
- All v1 endpoints frozen (no new features)
- Breaking changes: None planned
- Upgrade path: Contact support@senai.io for migration guide

### v2 (Current)

- Launch date: January 1, 2023
- **Breaking changes from v1**:
  1. All timestamps now ISO 8601 format (was Unix epoch)
  2. Authentication header changed to \Authorization: Bearer <token>\ (was \X-API-Key\)
  3. Pagination: cursor-based (was offset/limit)
  4. Error format: new envelope structure

**Required for v2 Requests**:
- Header: \Authorization: Bearer <your-api-key>\
- Header: \Accept: application/json\
- Header: \Content-Type: application/json\

## Authentication

\\\
curl -H "Authorization: Bearer sk_live_abc123xyz..." https://api.senai.io/v2/emails
\\\

## Common Endpoints

\\\
GET /emails - List emails
GET /emails/{id} - Get email details
POST /emails - Ingest new email
PATCH /emails/{id} - Update email classification
GET /threads - List conversation threads
POST /agents/run - Execute AI agent
GET /agents/dry-run/{id} - Plan agent execution
GET /reports/sentiment - Sentiment analytics
GET /reports/category - Category breakdown
\\\

## Error Codes

| Code | Meaning |
|------|---------|
| 400 | Bad Request - invalid parameters |
| 401 | Unauthorized - missing/invalid API key |
| 403 | Forbidden - insufficient permissions |
| 404 | Not Found - resource doesn't exist |
| 429 | Rate Limited - too many requests |
| 500 | Server Error - try again later |
| 503 | Service Unavailable - maintenance |

## Pagination

\\\
GET /emails?cursor=abc123&limit=50
\\\

Response includes:
- \data\: Array of results
- \cursor\: Next page cursor (null if last page)
- \has_more\: Boolean indicating more results
