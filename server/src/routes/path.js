const express = require("express");

const { runQuery } = require("../db");
const queries = require("../queries");

const router = express.Router();

// GET /api/path?from=javascript&to=react
router.get("/", async (req, res, next) => {
  try {
    const fromId = (req.query.from || "").trim();
    const toId = (req.query.to || "").trim();

    if (!fromId || !toId) {
      return res.status(400).json({
        error: 'Both "from" and "to" skill ids are required.',
      });
    }

    if (fromId === toId) {
      return res.status(400).json({
        error: "Pick two different skills to find a path.",
      });
    }

    let records = await runQuery(queries.shortestSkillPath, {
      fromId,
      toId,
    });

    let reversed = false;

    // PREREQUISITE_OF is directional.
    // If no forward path exists, check the reverse direction.
    if (records.length === 0) {
      records = await runQuery(queries.shortestSkillPath, {
        fromId: toId,
        toId: fromId,
      });

      reversed = records.length > 0;
    }

    if (records.length === 0) {
      return res.json({
        found: false,
        steps: [],
        hops: 0,
      });
    }

    const result = records[0].toObject();

    res.json({
      found: true,
      reversed,
      steps: result.steps,
      hops: result.hops?.toNumber ? result.hops.toNumber() : result.hops,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
