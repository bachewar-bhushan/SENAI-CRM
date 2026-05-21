import { asyncHandler } from "../middleware/errorHandler.js";
import {
  getThreadByEmailService,
  respondToEmailService,
  getThreadActionsService,
  getThreadSummaryService,
} from "../services/thread.service.js";

export const getThreadByEmail = asyncHandler(async (req, res) => {
  const { email } = req.params;

  if (!email) {
    return res.status(400).json({
      success: false,
      error_code: "MISSING_EMAIL",
      message: "Email parameter is required",
      details: {},
    });
  }

  const result = await getThreadByEmailService(email);

  res.status(200).json({
    success: true,
    data: result,
  });
});

export const respondToEmail = asyncHandler(async (req, res) => {
  const { emailId } = req.params;

  if (!emailId || isNaN(emailId)) {
    return res.status(400).json({
      success: false,
      error_code: "INVALID_EMAIL_ID",
      message: "Invalid email ID",
      details: {},
    });
  }

  const result = await respondToEmailService(emailId, req.body);

  res.status(200).json({
    success: true,
    data: result,
  });
});

export const getThreadActions = asyncHandler(async (req, res) => {
  const { email } = req.params;

  if (!email) {
    return res.status(400).json({
      success: false,
      error_code: "MISSING_EMAIL",
      message: "Email parameter is required",
      details: {},
    });
  }

  const result = await getThreadActionsService(email);

  res.status(200).json({
    success: true,
    data: result,
  });
});

export const getThreadSummary = asyncHandler(async (req, res) => {
  const { email } = req.params;

  if (!email) {
    return res.status(400).json({
      success: false,
      error_code: "MISSING_EMAIL",
      message: "Email parameter is required",
      details: {},
    });
  }

  const result = await getThreadSummaryService(email);

  res.status(200).json({
    success: true,
    data: result,
  });
});