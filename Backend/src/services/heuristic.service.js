/**
 * Heuristic Pre-filter Service
 * Fast (<10ms) synchronous classification before LLM processing
 *
 * Detects: Spam, Internal emails, Security threats, Urgency signals
 */

// Spam domain blocklist
const SPAM_DOMAINS = [
  "marketing-guru.io",
  "wealth-transfer.com",
  "spammy-outreach.com",
  "anon-collective.net",
  "coldoutreach.com",
  "review-scraper.io",
];

// Spam keywords
const SPAM_KEYWORDS = [
  "boost your seo",
  "limited offer",
  "click here",
  "claim your",
  "guaranteed",
  "act now",
  "limited time",
  "inheritance",
  "nigerian prince",
  "offshore account",
  "win free",
];

// Internal domains
const INTERNAL_DOMAINS = ["@internal.com", "@mycompany.com"];

// Security threat keywords
const SECURITY_KEYWORDS = [
  "ransomware",
  "btc",
  "bitcoin",
  "exfiltrated",
  "dark web",
  "suspicious login",
  "data breach",
  "compromised",
  "hacked",
  "stolen credentials",
  "phishing",
  "malware",
  "virus",
];

// Urgency/Legal keywords
const URGENCY_KEYWORDS = [
  "urgent",
  "p0",
  "critical",
  "asap",
  "immediately",
  "legal",
  "attorney",
  "lawsuit",
  "cease and desist",
  "cease all",
  "gdpr",
  "article 20",
  "hipaa",
  "compliance",
];

/**
 * Classify email using heuristics
 * Returns: { isSpam, isInternal, urgencyFlag, securityFlag, initialPriority }
 */
export const classifyHeuristicService = (email) => {
  const { sender = "", subject = "", body = "" } = email;

  // Normalize text for matching
  const senderLower = sender.toLowerCase();
  const subjectLower = subject.toLowerCase();
  const bodyLower = body.toLowerCase();
  const fullText = `${subjectLower} ${bodyLower}`;

  // ===== CHECK 1: INTERNAL EMAIL =====
  const isInternal = INTERNAL_DOMAINS.some((domain) =>
    senderLower.includes(domain)
  );

  // ===== CHECK 2: SECURITY FLAG =====
  const securityFlag = SECURITY_KEYWORDS.some(
    (keyword) => fullText.includes(keyword.toLowerCase())
  );

  // ===== CHECK 3: URGENCY FLAG =====
  const urgencyFlag = URGENCY_KEYWORDS.some(
    (keyword) => fullText.includes(keyword.toLowerCase())
  );

  // ===== CHECK 4: SPAM DETECTION =====
  let isSpam = false;

  // Check if sender domain is in blocklist
  const senderDomain = sender.substring(sender.lastIndexOf("@") + 1);
  if (SPAM_DOMAINS.includes(senderDomain)) {
    isSpam = true;
  }

  // Check for spam keywords
  const spamKeywordCount = SPAM_KEYWORDS.filter(
    (keyword) => fullText.includes(keyword.toLowerCase())
  ).length;

  if (spamKeywordCount >= 2) {
    isSpam = true;
  }

  // Very obvious spam indicators
  if (
    fullText.includes("dear sir") ||
    fullText.includes("dear madam") ||
    fullText.includes("dear friend")
  ) {
    isSpam = true;
  }

  // ===== PRIORITY SCORE =====
  let initialPriority = 5; // Default: normal customer

  if (isSpam) {
    initialPriority = 1; // Spam: lowest
  } else if (isInternal) {
    initialPriority = 3; // Internal: low-medium
  } else if (securityFlag) {
    initialPriority = 10; // Security threat: CRITICAL
  } else if (urgencyFlag && !isSpam) {
    initialPriority = 9; // Urgent/Legal: high
  }

  return {
    isSpam,
    isInternal,
    urgencyFlag: urgencyFlag ? (securityFlag ? "Critical" : "High") : null,
    securityFlag,
    initialPriority,
  };
};

/**
 * Determine next action based on heuristics
 * Returns quick routing decision for fast-path emails
 */
export const getHeuristicActionService = (heuristics, category) => {
  const { isSpam, isInternal, securityFlag, urgencyFlag } = heuristics;

  // Spam emails: mark spam, do not process further
  if (isSpam) {
    return {
      action: "Mark as Spam",
      skipLLM: true,
      category: "Spam",
      urgency: "Low",
      requires_human: false,
    };
  }

  // Internal emails: mark internal, may not need reply
  if (isInternal) {
    return {
      action: "Internal",
      skipLLM: false, // Still classify, but with low priority
      category: "Internal",
      urgency: "Low",
      requires_human: false,
    };
  }

  // Security threats: always escalate
  if (securityFlag) {
    return {
      action: "Escalate to Security Team",
      skipLLM: true,
      category: "Security Alert",
      urgency: "Critical",
      requires_human: true,
    };
  }

  // Urgent/Legal: escalate for human review
  if (urgencyFlag) {
    return {
      action: "Escalate for Human Review",
      skipLLM: false, // Still get LLM classification
      category: null, // Let LLM decide category
      urgency: "High",
      requires_human: true,
    };
  }

  // Normal flow: proceed to LLM classification
  return {
    action: "Classify with LLM",
    skipLLM: false,
    category: null,
    urgency: null,
    requires_human: false,
  };
};

/**
 * Get priority badge/color for UI display
 */
export const getPriorityBadge = (initialPriority) => {
  if (initialPriority >= 9) return { color: "red", label: "Critical" };
  if (initialPriority >= 8) return { color: "orange", label: "High" };
  if (initialPriority >= 5) return { color: "blue", label: "Normal" };
  if (initialPriority >= 3) return { color: "gray", label: "Low" };
  return { color: "gray", label: "Spam" };
};

/**
 * Log heuristic classification for debugging
 */
export const logHeuristicClassification = (email, heuristics, action) => {
  return {
    email_id: email.id,
    sender: email.sender,
    subject: email.subject.substring(0, 50),
    timestamp: new Date().toISOString(),
    heuristics,
    action,
  };
};
