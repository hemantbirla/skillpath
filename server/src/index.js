require("dotenv").config();

const express = require("express");
const cors = require("cors");

const { verifyConnectivity, closeDriver } = require("./db");

const app = express();
const PORT = process.env.PORT || 4000;

// ================================
// Global Middleware
// ================================

app.use(cors());
app.use(express.json());

// Request logger
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// ================================
// Health Check
// ================================

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

// ================================
// Central Error Handler
// ================================

app.use((err, _req, res, _next) => {
  console.error("Request failed:", err.message);

  const isConnectionIssue =
    /ServiceUnavailable|ECONNREFUSED|Missing COGNODB/i.test(
      err.message || "",
    ) || err.code === "ServiceUnavailable";

  res.status(isConnectionIssue ? 503 : 500).json({
    error: isConnectionIssue
      ? "Could not reach the CognoDB instance. Check COGNODB_URI/COGNODB_PASSWORD and that the instance is running."
      : "Something went wrong handling that request.",
  });
});

// ================================
// Start Server
// ================================

app.listen(PORT, () => {
  console.log(`SkillPath API listening on http://localhost:${PORT}`);
});

// ================================
// Graceful Shutdown
// ================================

process.on("SIGINT", async () => {
  await closeDriver();
  process.exit(0);
});
