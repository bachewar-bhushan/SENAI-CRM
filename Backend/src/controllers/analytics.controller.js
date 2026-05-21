import { asyncHandler } from "../middleware/errorHandler.js";
import {
  getDashboardStatsService,
  getSentimentTrendService,
  getCategoryBreakdownService,
  getAllEmailsService,
} from "../services/analytics.service.js";

export const getDashboardStats = asyncHandler(async (req, res) => {
  const result = await getDashboardStatsService();

  res.status(200).json({
    success: true,
    data: result,
  });
});

export const getSentimentTrend = asyncHandler(async (req, res) => {
  const result = await getSentimentTrendService(req.query);

  res.status(200).json({
    success: true,
    data: result,
  });
});

export const getCategoryBreakdown = asyncHandler(async (req, res) => {
  const result = await getCategoryBreakdownService(req.query);

  res.status(200).json({
    success: true,
    data: result,
  });
});

export const getAllEmails = asyncHandler(async (req, res) => {
  const result = await getAllEmailsService();

  res.status(200).json({
    success: true,
    data: result,
    count: result.length,
  });
});