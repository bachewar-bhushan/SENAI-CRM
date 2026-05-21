import { asyncHandler } from "../middleware/errorHandler.js";
import {
  searchKnowledgeBaseService,
} from "../services/rag.service.js";

export const searchKnowledgeBase = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error_code: "MISSING_QUERY",
      message: "Search query is required",
      details: {},
    });
  }

  const result = await searchKnowledgeBaseService(q);

  res.status(200).json({
    success: true,
    data: result,
  });
});