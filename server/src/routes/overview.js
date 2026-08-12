const express = require("express");

const { runQuery } = require("../db");
const queries = require("../queries");

const router = express.Router();

// GET /api/overview
router.get("/", async (req, res, next) => {
  try {
    const records = await runQuery(queries.overviewStats, {});

    if (records.length === 0) {
      return res.json({
        overview: {
          skillCount: 0,
          courseCount: 0,
          prereqEdgeCount: 0,
          learnerCount: 0,
        },
      });
    }

    const overview = records[0].toObject();

    overview.skillCount = overview.skillCount?.toNumber
      ? overview.skillCount.toNumber()
      : overview.skillCount;

    overview.courseCount = overview.courseCount?.toNumber
      ? overview.courseCount.toNumber()
      : overview.courseCount;

    overview.prereqEdgeCount = overview.prereqEdgeCount?.toNumber
      ? overview.prereqEdgeCount.toNumber()
      : overview.prereqEdgeCount;

    overview.learnerCount = overview.learnerCount?.toNumber
      ? overview.learnerCount.toNumber()
      : overview.learnerCount;

    res.json({ overview });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
