const express = require("express");

const { runQuery } = require("../db");
const queries = require("../queries");

const router = express.Router();

// GET /api/learners
router.get("/learners", async (req, res, next) => {
  try {
    const records = await runQuery(queries.learners, {});

    const learners = records.map((record) => {
      const learner = record.toObject();

      learner.skillCount = learner.skillCount?.toNumber
        ? learner.skillCount.toNumber()
        : learner.skillCount;

      return learner;
    });

    res.json({ learners });
  } catch (err) {
    next(err);
  }
});

// GET /api/learners/:id/recommendations
router.get("/learners/:id/recommendations", async (req, res, next) => {
  try {
    const learnerId = req.params.id.trim();

    if (!learnerId) {
      return res.status(400).json({
        error: "Learner id is required.",
      });
    }

    const records = await runQuery(queries.recommendationsForLearner, {
      learnerId,
    });

    const recommendations = records.map((record) => {
      const recommendation = record.toObject();

      recommendation.durationHours = recommendation.durationHours?.toNumber
        ? recommendation.durationHours.toNumber()
        : recommendation.durationHours;

      recommendation.peersCompleted = recommendation.peersCompleted?.toNumber
        ? recommendation.peersCompleted.toNumber()
        : recommendation.peersCompleted;

      return recommendation;
    });

    res.json({ recommendations });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
