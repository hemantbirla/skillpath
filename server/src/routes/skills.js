const express = require("express");

const { runQuery } = require("../db");
const queries = require("../queries");

const router = express.Router();

// GET /api/skills?search=react&category=frontend&difficulty=beginner
router.get("/", async (req, res, next) => {
  try {
    const term = (req.query.search || "").trim();
    const category = (req.query.category || "").trim();
    const difficulty = (req.query.difficulty || "").trim();

    const records = await runQuery(queries.searchSkills, {
      term,
      category,
      difficulty,
    });

    const skills = records.map((record) => record.toObject());

    res.json({ skills });
  } catch (err) {
    next(err);
  }
});

// GET /api/skills/gateways
//
// Must be declared before /:id so "gateways"
// is not treated as a skill ID.
router.get("/gateways", async (req, res, next) => {
  try {
    const records = await runQuery(queries.gatewaySkills, {});

    const skills = records.map((record) => {
      const skill = record.toObject();

      skill.unlockedCount = skill.unlockedCount?.toNumber
        ? skill.unlockedCount.toNumber()
        : skill.unlockedCount;

      return skill;
    });

    res.json({ skills });
  } catch (err) {
    next(err);
  }
});

// GET /api/skills/:id
router.get("/:id", async (req, res, next) => {
  try {
    const records = await runQuery(queries.skillDetail, {
      id: req.params.id,
    });

    if (records.length === 0) {
      return res.status(404).json({
        error: "Skill not found",
      });
    }

    const skill = records[0].toObject();

    skill.prerequisites = skill.prerequisites.filter(
      (item) => item.id !== null,
    );

    skill.unlocks = skill.unlocks.filter((item) => item.id !== null);

    skill.courses = skill.courses.filter((item) => item.id !== null);

    res.json({ skill });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
