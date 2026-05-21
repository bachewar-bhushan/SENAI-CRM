import express from "express";

import {
  getContactProfile,
  updateContactStatus,
} from "../controllers/contact.controller.js";

const router = express.Router();

router.get("/:email", getContactProfile);

router.patch("/:email/status", updateContactStatus);

export default router;