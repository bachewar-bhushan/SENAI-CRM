import express from "express";

import {
  searchKnowledgeBase,
} from "../controllers/rag.controller.js";

const router = express.Router();

router.get("/search", searchKnowledgeBase);

export default router;