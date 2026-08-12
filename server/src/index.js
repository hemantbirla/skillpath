require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { verifyConnectivity, closeDriver } = require("./db");

const skillsRouter = require("./routes/skills");
const coursesRouter = require("./routes/courses");
const pathRouter = require("./routes/path");
const recommendRouter = require("./routes/recommend");
const overviewRouter = require("./routes/overview");

const app = express();

const PORT = process.env.PORT || 4000;

// ================================================================
// Global Middleware
// ================================================================

app.use(cors());
app.use(express.json());

app.use((req, _res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// ================================================================
// Health Check
// ================================================================

app.get("/api/health", async (_req, res) => {
  try {
    await verifyConnectivity();

    res.status(200).json({
      status: "ok",
      database: "connected",
    });
  } catch (err) {
    res.status(503).json({
      status: "degraded",
      database: "unreachable",
      message: err.message,
    });
  }
});

// ================================================================
// API Routes
// ================================================================

app.use("/api/skills", skillsRouter);
app.use("/api/courses", coursesRouter);
app.use("/api/path", pathRouter);
app.use("/api", recommendRouter);
app.use("/api/overview", overviewRouter);

// ================================================================
// 404 Handler
// ================================================================

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
});

// ================================================================
// Central Error Handler
// ================================================================

app.use((err, _req, res, _next) => {
  console.error("API Error:", err);

  res.status(err.status || 500).json({
    error: err.message || "Something went wrong handling that request.",
  });
});

// ================================================================
// Start Server
// ================================================================

const server = app.listen(PORT, () => {
  console.log(`SkillPath API listening on http://localhost:${PORT}`);
});

// ================================================================
// Graceful Shutdown
// ================================================================

async function shutdown(signal) {
  console.log(`${signal} received. Shutting down...`);

  server.close(async () => {
    try {
      await closeDriver();
      console.log("Database driver closed.");
      process.exit(0);
    } catch (err) {
      console.error("Shutdown error:", err);
      process.exit(1);
    }
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
