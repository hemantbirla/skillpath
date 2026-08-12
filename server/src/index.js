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
// API Routes
// ================================

app.use("/api/skills", skillsRouter);
app.use("/api/courses", coursesRouter);
app.use("/api/path", pathRouter);
app.use("/api", recommendRouter);
app.use("/api/overview", overviewRouter);

// ================================
// Central Error Handler
// ================================

app.use((err, req, res, next) => {
  console.error("API Error:", err);

  res.status(err.status || 500).json({
    error: err.message || "Something went wrong handling that request.",
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
