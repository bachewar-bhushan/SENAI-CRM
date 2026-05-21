import axios from "axios";
import { pool } from "../config/db.js";

const CACHE_DURATION_HOURS = 6;
const SCRAPER_TIMEOUT = 10000; // 10 seconds

/**
 * Check if scraping target respects robots.txt
 * Returns true if scraping is allowed
 */
async function checkRobotsTxt(domain) {
  try {
    const url = `https://${domain}/robots.txt`;
    const response = await axios.get(url, {
      timeout: 3000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; SenAI-Intelligence/1.0; +http://senai.io/bot)",
      },
    });

    const content = response.data.toLowerCase();

    // Check if User-Agent: * or our specific agent is allowed
    const lines = content.split("\n");
    let currentSection = null;
    let isAllowed = true;

    for (const line of lines) {
      const trimmed = line.trim().toLowerCase();

      if (trimmed.startsWith("user-agent:")) {
        const agent = trimmed.replace("user-agent:", "").trim();
        if (agent === "*" || agent === "senai-intelligence/1.0") {
          currentSection = agent;
        }
      }

      if (
        currentSection &&
        trimmed.startsWith("disallow:") &&
        (trimmed.includes("/") ||
          trimmed === "disallow:" ||
          trimmed === "disallow: /")
      ) {
        isAllowed = false;
      }
    }

    return isAllowed;
  } catch (error) {
    // If robots.txt doesn't exist, assume scraping is allowed
    // If request fails, assume allowed (conservative approach)
    console.warn(`robots.txt check failed for ${domain}:`, error.message);
    return true;
  }
}

/**
 * Scrape G2 ratings
 */
async function scrapeG2(companyName) {
  try {
    // Check robots.txt first
    const allowed = await checkRobotsTxt("g2.com");
    if (!allowed) {
      console.warn("G2 robots.txt disallows scraping");
      return null;
    }

    // In production, use a headless browser (Puppeteer) or API
    // For now, return mock data with proper structure
    const mockData = {
      source: "g2",
      company_name: companyName,
      rating: (Math.random() * 2 + 3.5).toFixed(1), // 3.5-5.5
      review_count: Math.floor(Math.random() * 500 + 50),
      categories: ["CRM", "Customer Support", "Enterprise Software"],
      common_themes: [
        "Great customer support",
        "Easy to use",
        "Good value",
      ],
      sentiment: "positive",
      scraped_at: new Date().toISOString(),
    };

    return mockData;
  } catch (error) {
    console.error("G2 scrape error:", error);
    return null;
  }
}

/**
 * Scrape Trustpilot ratings
 */
async function scrapeTrustpilot(companyName) {
  try {
    // Check robots.txt first
    const allowed = await checkRobotsTxt("trustpilot.com");
    if (!allowed) {
      console.warn("Trustpilot robots.txt disallows scraping");
      return null;
    }

    // In production, use a headless browser or API
    // For now, return mock data
    const mockData = {
      source: "trustpilot",
      company_name: companyName,
      rating: (Math.random() * 2 + 3.5).toFixed(1),
      review_count: Math.floor(Math.random() * 1000 + 100),
      verified_reviews: Math.floor(Math.random() * 800 + 50),
      response_rate: (Math.random() * 40 + 60).toFixed(0) + "%",
      common_themes: ["Professional", "Responsive", "Reliable"],
      negative_themes: ["Pricing", "Onboarding"],
      sentiment: "positive",
      scraped_at: new Date().toISOString(),
    };

    return mockData;
  } catch (error) {
    console.error("Trustpilot scrape error:", error);
    return null;
  }
}

/**
 * Scrape competitor pricing
 */
async function scrapeCompetitorPricing(companyName) {
  try {
    // Mock competitor pricing data
    const mockData = {
      source: "competitor_pricing",
      company_name: companyName,
      competitors: [
        {
          name: "CompetitorX",
          pricing_model: "Per-user/month",
          starter: "$99/user",
          professional: "$299/user",
          enterprise: "Custom",
        },
        {
          name: "CompetitorY",
          pricing_model: "Per-workspace/month",
          starter: "$499",
          professional: "$1,499",
          enterprise: "Custom",
        },
      ],
      market_position: "Mid-market competitive",
      scraped_at: new Date().toISOString(),
    };

    return mockData;
  } catch (error) {
    console.error("Competitor pricing scrape error:", error);
    return null;
  }
}

/**
 * Check cache for existing data
 */
async function getCachedIntelligence(targetEntity) {
  try {
    const query = `
      SELECT *
      FROM web_intelligence_cache
      WHERE target_entity ILIKE $1
      AND expires_at > NOW()
      ORDER BY scraped_at DESC
      LIMIT 1
    `;

    const result = await pool.query(query, [`%${targetEntity}%`]);

    if (result.rows.length > 0) {
      return {
        cached: true,
        data: result.rows[0].scraped_data,
      };
    }

    return { cached: false };
  } catch (error) {
    console.error("Cache lookup error:", error);
    return { cached: false };
  }
}

/**
 * Store scraped data in cache
 */
async function cacheIntelligence(targetEntity, sourceUrl, scrapedData) {
  try {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + CACHE_DURATION_HOURS);

    const query = `
      INSERT INTO web_intelligence_cache (
        source_url,
        target_entity,
        scraped_data,
        scraped_at,
        expires_at
      )
      VALUES ($1, $2, $3, NOW(), $4)
      ON CONFLICT (target_entity)
      DO UPDATE SET
        scraped_data = $3,
        scraped_at = NOW(),
        expires_at = $4
      RETURNING *
    `;

    const result = await pool.query(query, [
      sourceUrl,
      targetEntity,
      JSON.stringify(scrapedData),
      expiresAt,
    ]);

    return result.rows[0];
  } catch (error) {
    console.error("Cache storage error:", error);
    // Don't throw - caching failure shouldn't stop the flow
    return null;
  }
}

/**
 * Main scraping orchestrator
 * Fetches reputation data from multiple sources
 */
export const scrapeReputationService = async (companyName) => {
  try {
    // Check cache first
    const cached = await getCachedIntelligence(companyName);
    if (cached.cached) {
      console.log(`Using cached reputation data for ${companyName}`);
      return {
        success: true,
        data: cached.data,
        cached: true,
      };
    }

    console.log(`Scraping reputation for ${companyName}...`);

    // Scrape in parallel (with timeout protection)
    const results = await Promise.allSettled([
      scrapeTrustpilot(companyName),
      scrapeG2(companyName),
      scrapeCompetitorPricing(companyName),
    ]);

    const [trustpilotResult, g2Result, competitorResult] = results;

    // Extract values from settled promises
    const trustpilot = trustpilotResult.status === "fulfilled" ? trustpilotResult.value : null;
    const g2 = g2Result.status === "fulfilled" ? g2Result.value : null;
    const competitor = competitorResult.status === "fulfilled" ? competitorResult.value : null;

    // Aggregate results
    const intelligenceData = {
      company: companyName,
      scraped_at: new Date().toISOString(),
      sources: {
        trustpilot: trustpilot
          ? {
              rating: parseFloat(trustpilot.rating),
              reviews: trustpilot.review_count,
              response_rate: trustpilot.response_rate,
              sentiment: trustpilot.sentiment,
            }
          : null,
        g2: g2
          ? {
              rating: parseFloat(g2.rating),
              reviews: g2.review_count,
              sentiment: g2.sentiment,
            }
          : null,
        competitor_pricing: competitor ? competitor.competitors : null,
      },
      summary: {
        avg_rating:
          (trustpilot && g2)
            ? (
                (parseFloat(trustpilot.rating) +
                  parseFloat(g2.rating)) /
                2
              ).toFixed(1)
            : trustpilot
            ? trustpilot.rating
            : g2
            ? g2.rating
            : "N/A",
        market_position:
          competitor && competitor.market_position
            ? competitor.market_position
            : "Unknown",
        overall_sentiment:
          trustpilot && trustpilot.sentiment
            ? trustpilot.sentiment
            : "unknown",
      },
      cache_expires: new Date(
        Date.now() + CACHE_DURATION_HOURS * 3600 * 1000
      ).toISOString(),
    };

    // Store in cache
    await cacheIntelligence(
      companyName,
      "multi-source-scrape",
      intelligenceData
    );

    return {
      success: true,
      data: intelligenceData,
      cached: false,
    };
  } catch (error) {
    console.error("Reputation scrape error:", error);

    // Graceful degradation: return empty but successful
    return {
      success: false,
      data: {
        company: companyName,
        error: error.message,
        sources: {},
        summary: {
          avg_rating: "N/A",
          market_position: "Unknown",
          overall_sentiment: "unknown",
        },
      },
      error: error.message,
    };
  }
};

/**
 * Get cached reputation data
 */
export const getCachedReputationService = async (companyName) => {
  try {
    // Check cache first
    const cached = await getCachedIntelligence(companyName);

    if (cached.cached) {
      return {
        success: true,
        data: cached.data,
        cached: true,
        source: "cache",
      };
    }

    // If not cached, scrape
    const result = await scrapeReputationService(companyName);
    return result;
  } catch (error) {
    console.error("Reputation fetch error:", error);

    return {
      success: false,
      data: null,
      error: error.message,
    };
  }
};

/**
 * Analyze sentiment from scraped data
 */
export const analyzePublicSentimentService = async (scrapedData) => {
  try {
    if (!scrapedData || !scrapedData.sources) {
      return { sentiment: "unknown", confidence: 0 };
    }

    const ratings = [];

    if (scrapedData.sources.trustpilot && scrapedData.sources.trustpilot.rating) {
      ratings.push(scrapedData.sources.trustpilot.rating);
    }

    if (scrapedData.sources.g2 && scrapedData.sources.g2.rating) {
      ratings.push(scrapedData.sources.g2.rating);
    }

    if (ratings.length === 0) {
      return { sentiment: "unknown", confidence: 0 };
    }

    const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;

    let sentiment = "neutral";
    let confidence = 0.5;

    if (avgRating >= 4.5) {
      sentiment = "very_positive";
      confidence = 0.95;
    } else if (avgRating >= 4.0) {
      sentiment = "positive";
      confidence = 0.85;
    } else if (avgRating >= 3.5) {
      sentiment = "neutral";
      confidence = 0.7;
    } else if (avgRating >= 3.0) {
      sentiment = "negative";
      confidence = 0.8;
    } else {
      sentiment = "very_negative";
      confidence = 0.95;
    }

    return {
      sentiment,
      confidence,
      avg_rating: avgRating.toFixed(1),
      source_count: ratings.length,
    };
  } catch (error) {
    console.error("Sentiment analysis error:", error);
    return { sentiment: "unknown", confidence: 0 };
  }
};

/**
 * Get reputation summary for dashboard
 */
export const getReputationSummaryService = async () => {
  try {
    const query = `
      SELECT
        target_entity,
        scraped_data,
        scraped_at,
        expires_at
      FROM web_intelligence_cache
      WHERE expires_at > NOW()
      ORDER BY scraped_at DESC
      LIMIT 10
    `;

    const result = await pool.query(query);

    return {
      success: true,
      data: result.rows.map((row) => ({
        company: row.target_entity,
        reputation: row.scraped_data,
        scraped_at: row.scraped_at,
        expires_at: row.expires_at,
      })),
      count: result.rows.length,
    };
  } catch (error) {
    console.error("Reputation summary error:", error);

    return {
      success: false,
      data: [],
      error: error.message,
    };
  }
};
