const express = require("express");

const { runQuery } = require("../db");
const queries = require("../queries");

const router = express.Router();

// GET /api/courses?search=graph
router.get("/", async (req, res, next) => {
  try {
    const term = (req.query.search || "").trim();

    const records = await runQuery(queries.searchCourses, {
      term,
    });

    const courses = records.map((record) => {
      const course = record.toObject();

      course.durationHours = course.durationHours?.toNumber
        ? course.durationHours.toNumber()
        : course.durationHours;

      return course;
    });

    res.json({ courses });
  } catch (err) {
    next(err);
  }
});

// GET /api/courses/:id
router.get("/:id", async (req, res, next) => {
  try {
    const records = await runQuery(queries.courseDetail, {
      id: req.params.id,
    });

    if (records.length === 0) {
      return res.status(404).json({
        error: "Course not found",
      });
    }

    const course = records[0].toObject();

    course.durationHours = course.durationHours?.toNumber
      ? course.durationHours.toNumber()
      : course.durationHours;

    course.teaches = course.teaches.filter((skill) => skill.id !== null);

    course.requires = course.requires.filter((skill) => skill.id !== null);

    res.json({ course });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
