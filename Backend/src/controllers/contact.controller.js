import { asyncHandler } from "../middleware/errorHandler.js";
import {
  getContactProfileService,
  updateContactStatusService,
} from "../services/contact.service.js";

export const getContactProfile = asyncHandler(async (req, res) => {
  const { email } = req.params;

  if (!email) {
    return res.status(400).json({
      success: false,
      error_code: "MISSING_EMAIL",
      message: "Email parameter is required",
      details: {},
    });
  }

  const result = await getContactProfileService(email);

  res.status(200).json({
    success: true,
    data: result,
  });
});

export const updateContactStatus = asyncHandler(async (req, res) => {
  const { email } = req.params;

  if (!email) {
    return res.status(400).json({
      success: false,
      error_code: "MISSING_EMAIL",
      message: "Email parameter is required",
      details: {},
    });
  }

  const result = await updateContactStatusService(email, req.body);

  res.status(200).json({
    success: true,
    data: result,
  });
});