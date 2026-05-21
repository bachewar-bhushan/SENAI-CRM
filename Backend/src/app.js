import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import ingestRoutes from "./routes/ingest.routes.js";
import threadRoutes from "./routes/thread.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import ragRoutes from "./routes/rag.routes.js";
import intelligenceRoutes from "./routes/intelligence.routes.js";
import agentRoutes from "./routes/agent.routes.js";
import draftRoutes from "./routes/draft.routes.js";
import auditRoutes from "./routes/audit.routes.js";

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server running",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api", ingestRoutes);
app.use("/threads", threadRoutes);
app.use("/drafts", draftRoutes);
app.use("/audit", auditRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/contacts", contactRoutes);
app.use("/rag", ragRoutes);
app.use("/intelligence", intelligenceRoutes);
app.use("/agent", agentRoutes);

// 404 Handler (before error handler)
app.use(notFoundHandler);

// Global Error Handler (last middleware)
app.use(errorHandler);

export default app;

