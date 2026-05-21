import {
  getCachedReputationService,
  getReputationSummaryService,
} from "../services/scraper.service.js";

/**
 * Get reputation data for a company
 * GET /intelligence/reputation?company=SenAI
 */
export const getReputationData = async (req, res) => {
  try {
    const { company = "SenAI" } = req.query;

    if (!company || company.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error_code: "MISSING_COMPANY",
        message: "Company name is required",
        details: {},
      });
    }

    const result = await getCachedReputationService(company);

    return res.status(200).json({
      success: result.success,
      data: result.data,
      cached: result.cached || false,
      error: result.error || null,
    });
  } catch (error) {
    console.error("Reputation data error:", error);

    return res.status(500).json({
      success: false,
      error_code: "REPUTATION_ERROR",
      message: "Failed to fetch reputation data",
      details: { error: error.message },
    });
  }
};

/**
 * Get reputation summary dashboard
 * GET /intelligence/summary
 */
export const getReputationSummary = async (req, res) => {
  try {
    const result = await getReputationSummaryService();

    return res.status(200).json({
      success: result.success,
      data: result.data,
      count: result.count || 0,
      error: result.error || null,
    });
  } catch (error) {
    console.error("Reputation summary error:", error);

    return res.status(500).json({
      success: false,
      error_code: "SUMMARY_ERROR",
      message: "Failed to fetch reputation summary",
      details: { error: error.message },
    });
  }
};
