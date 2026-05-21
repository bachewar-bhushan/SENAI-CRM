# Escalation Matrix

## Issue Type to Handler Mapping

### Legal Threats & Lawsuits

**Detector**: Keywords: "sue", "lawsuit", "attorney", "legal action", "cease and desist"

**Route**: 
1. Escalate to Legal (in-house counsel)
2. Flag in actions table: \ction_type = "Legal-Flag"\
3. **Do NOT auto-reply**
4. Notify VP of Legal within 1 hour

**SLA**: Legal review within 4 business hours
**Response**: Draft by legal team (no agent involvement)

### Security Incidents

**Detector**: Keywords: "ransomware", "BTC/bitcoin", "data breach", "exfiltrated", "compromised"

**Route**:
1. Escalate to Security Team (InfoSec lead)
2. Flag: \ction_type = "Security-Incident"\
3. **DO NOT interact with attacker**
4. Notify CISO within 30 minutes

**SLA**: Incident response team engaged within 1 hour
**Response**: Security team determines response strategy

### Regulatory/Compliance Requests

**Detector**: Keywords: "GDPR", "CCPA", "data subject access", "article 20", "deletion request"

**Route**:
1. Escalate to Compliance/DPO
2. Flag: \ction_type = "Legal-Flag"\ with issue_type=GDPR_REQUEST
3. Create ticket with 30-day response window
4. Notify Data Protection Officer

**SLA**: Compliance assessment within 24 hours
**Response**: Compliance team drafts response

### VIP/High-Value Customer Churn

**Detector**: 
- Account value > \,000 OR
- 3+ negative sentiment emails in a row OR
- Keywords: "cancel", "leaving", "switching", "competitor"

**Route**:
1. Alert account manager (via Slack)
2. Flag: \ction_type = "Retention-Alert"\
3. Create task: "Contact customer within 4 hours"
4. Notify VP Sales

**Retention Strategy**:
- Offer: 1-3 months free service or 50% discount
- Escalation: VP Sales calls within 2 hours
- Deal approval: VP Sales (up to 25% discount), CEO (>25%)

**SLA**: Initial outreach within 2 hours

### PR Crisis / Social Media Mentions

**Detector**: Keywords: "Twitter", "Reddit", "publicly", "media", "press", "@SenAI"

**Route**:
1. Alert Marketing/PR team
2. Flag: \ction_type = "PR-Alert"\
3. Create urgent ticket for PR response
4. Notify CMO

**SLA**: PR assessment within 1 hour
**Response**: PR team crafts public response

### Internal/System-Generated Issues

**Detector**: Sender domain = internal.com or automated from @senai.io

**Route**:
1. Categorize as "Internal"
2. Do NOT escalate to customer-facing team
3. Route to relevant internal team (Engineering, Ops, etc.)

**No escalation needed** (handle internally)

## Escalation Flow Diagram

\\\
Email arrives
    ↓
[Heuristic Check]
    ↓
├─ Spam/Internal? → Archive (no escalation)
├─ Legal threat? → Legal team (P0)
├─ Security incident? → InfoSec team (P0)
├─ GDPR/Compliance? → DPO/Compliance (P0)
├─ VIP churn? → Account Manager (P1)
├─ PR crisis? → Marketing/PR (P1)
└─ Normal → AI Agent (P2/3)
\\\

## Escalation SLA

| Issue Type | Response Time | Escalation To | Approval Authority |
|------------|-------------------|---------------|-------------------|
| Legal/Lawsuit | 4 business hours | In-house legal counsel | General Counsel |
| Security | 1 hour | CISO/InfoSec lead | VP Engineering |
| GDPR/Compliance | 24 hours | Data Protection Officer | DPO |
| VIP Churn | 2 hours | Account Manager | VP Sales |
| PR Crisis | 1 hour | CMO/Marketing | Chief Communications Officer |
| High-severity complaint | 4 hours | Support Manager | VP Customer Success |

## Notification Channels

**Immediate (P0 - Legal/Security)**:
- Slack #critical-escalations
- Email to executive on-call
- PagerDuty alert (if available)
- Phone call (if unavailable in 15 min)

**High Priority (P1 - Churn/PR)**:
- Slack mention to owner
- Email notification
- Daily standup review

**Standard (P2/P3)**:
- Email to relevant team
- Dashboard notification
- Weekly metrics review
