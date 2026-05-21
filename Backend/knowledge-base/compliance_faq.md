# Compliance FAQ

## Data Privacy & Residency

### Is HIPAA BAA Available?

**Yes.** SenAI offers Business Associate Agreements (BAA) for HIPAA-covered entities.

**Requirements**:
- Minimum Enterprise plan (\,000+/month)
- Dedicated infrastructure mandatory
- Data residency: US-only (default) or EU-only
- Annual security audit required
- Signed BAA before processing PHI

**Process**: Contact compliance@senai.io with:
1. Proof of HIPAA-covered status
2. Data residency requirements
3. Estimated email volume
5-10 business days for review and setup

### GDPR DPA (Data Processing Agreement)

**Yes.** All customers can sign a DPA for GDPR compliance.

**Includes**:
- Data processor terms
- Sub-processor list (AWS, Groq LLM, CloudFlare)
- Data subject rights acknowledgment
- 30-day data portability window (on request)
- Deletion within 15 days (upon request)

**Standard DPA** included with Professional+ plans.
**Download**: https://senai.io/legal/dpa

### Data Residency

**Available options**:
- US-East (default, AWS us-east-1)
- EU-West (AWS eu-west-1, GDPR-certified)
- Custom: Enterprise only (on-premise or custom region)

**How to switch**: Contact support, residency change takes 2 weeks.

## Compliance Certifications

### SOC 2 Type II

**Status**: Certified (audit completed Sept 2023)

**Certificate**: https://senai.io/legal/soc2-cert
**Valid**: 12 months from issuance

**Controls certified**:
- CC6: Logical access controls
- CC7: System monitoring & alerting
- C09: Change management

### ISO 27001

**Status**: In progress (audit Q3 2024)
- Application submitted
- Expected certification: Sept 2024
- Interim controls audit completed

### GDPR Compliance

**Status**: Fully compliant

**Evidence**:
- Privacy impact assessment completed
- Data retention policy: max 90 days
- Encryption at rest (AES-256) + in transit (TLS 1.3)
- Right to be forgotten: 15-day automated deletion

### HIPAA (with BAA)

**Status**: Compliant (data residency + audit required)
**Minimum**: Enterprise plan, dedicated infrastructure

## Data Retention & Deletion

### Default Retention Policy

- **Email content**: 90 days (then archived to cold storage, deleted after 1 year)
- **Metadata**: 2 years
- **Audit logs**: 1 year
- **Backups**: 30 days rolling backup

### On-Demand Deletion (GDPR Right to Be Forgotten)

- Request via dashboard or email: dpo@senai.io
- **Timeline**: 15 calendar days
- **Scope**: Email content + metadata deleted; audit logs retained (legal hold)
- **Confirmation**: Deletion receipt emailed

### Enterprise Data Retention

- Fully customizable (contract negotiation)
- Typical: 2-7 year retention with compliance holds

## Data Breach Notification

### SenAI Breach → Customer Notification

- **Timeline**: Within 24 hours
- **Method**: Email + dashboard alert
- **Contents**: Scope, data affected, customer actions
- **Support**: DPO hotline + dedicated incident manager

### Customer Breach Detection

- Shared responsibility: SenAI monitors access logs
- Alerts for unusual access patterns
- Monthly security report included with Enterprise
- Customer responsible for: Application security, authentication keys

## Vendor & Sub-processor

**SenAI Uses**:
- **Cloud**: AWS (Certified for SOC 2, HIPAA-eligible)
- **LLM**: Groq (API calls; DPA available)
- **Security**: CloudFlare (DDoS, WAF)

**Sub-processor list**: https://senai.io/legal/subprocessors (updated quarterly)
