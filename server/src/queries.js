/**
 * All Cypher lives here, in one place, so the queries can be read and
 * reviewed independently of the Express plumbing.
 *
 * Every query is parameterised ($paramName).
 * No request input is string-concatenated into Cypher.
 */

module.exports = {
  // ================================================================
  // Skills
  // ================================================================

  searchSkills: `
    MATCH (s:Skill)

    WHERE
      ($term = '' OR toLower(s.name) CONTAINS toLower($term))
      AND ($category = '' OR toLower(s.category) = toLower($category))
      AND ($difficulty = '' OR toLower(s.difficulty) = toLower($difficulty))

    RETURN
      s.id AS id,
      s.name AS name,
      s.category AS category,
      s.difficulty AS difficulty,
      s.description AS description

    ORDER BY s.name
    LIMIT 200
  `,

  skillDetail: `
    MATCH (s:Skill {id: $id})

    OPTIONAL MATCH (pre:Skill)-[:PREREQUISITE_OF]->(s)
    OPTIONAL MATCH (s)-[:PREREQUISITE_OF]->(unlocks:Skill)
    OPTIONAL MATCH (c:Course)-[:TEACHES]->(s)

    RETURN
      s.id AS id,
      s.name AS name,
      s.category AS category,
      s.difficulty AS difficulty,
      s.description AS description,

      collect(DISTINCT {
        id: pre.id,
        name: pre.name
      }) AS prerequisites,

      collect(DISTINCT {
        id: unlocks.id,
        name: unlocks.name
      }) AS unlocks,

      collect(DISTINCT {
        id: c.id,
        title: c.title,
        level: c.level
      }) AS courses
  `,

  // Skills with the largest downstream prerequisite reach.
  // This is a variable-length graph traversal.
  gatewaySkills: `
    MATCH (s:Skill)-[:PREREQUISITE_OF*1..6]->(downstream:Skill)

    RETURN
      s.id AS id,
      s.name AS name,
      s.category AS category,
      s.difficulty AS difficulty,
      count(DISTINCT downstream) AS unlockedCount

    ORDER BY unlockedCount DESC
    LIMIT 10
  `,

  // ================================================================
  // Courses
  // ================================================================

  searchCourses: `
    MATCH (c:Course)

    WHERE
      $term = ''
      OR toLower(c.title) CONTAINS toLower($term)

    OPTIONAL MATCH (c)-[:TEACHES]->(s:Skill)
    OPTIONAL MATCH (c)-[:TAUGHT_BY]->(i:Instructor)

    RETURN
      c.id AS id,
      c.title AS title,
      c.level AS level,
      c.durationHours AS durationHours,
      c.provider AS provider,
      i.name AS instructor,
      collect(DISTINCT s.name) AS skillsTaught

    ORDER BY c.title
    LIMIT 200
  `,

  courseDetail: `
    MATCH (c:Course {id: $id})

    OPTIONAL MATCH (c)-[:TEACHES]->(teaches:Skill)
    OPTIONAL MATCH (c)-[:REQUIRES]->(requires:Skill)
    OPTIONAL MATCH (c)-[:TAUGHT_BY]->(i:Instructor)

    RETURN
      c.id AS id,
      c.title AS title,
      c.description AS description,
      c.level AS level,
      c.durationHours AS durationHours,
      c.provider AS provider,
      c.url AS url,
      i.name AS instructor,
      i.bio AS instructorBio,

      collect(DISTINCT {
        id: teaches.id,
        name: teaches.name
      }) AS teaches,

      collect(DISTINCT {
        id: requires.id,
        name: requires.name
      }) AS requires
  `,

  // ================================================================
  // Path Finder
  // ================================================================

  // Headline multi-hop graph query.
  //
  // Finds the shortest prerequisite chain between two skills.
  shortestSkillPath: `
    MATCH (from:Skill {id: $fromId})
    MATCH (to:Skill {id: $toId})

    MATCH p = shortestPath(
      (from)-[:PREREQUISITE_OF*1..10]->(to)
    )

    RETURN
      [
        n IN nodes(p) | {
          id: n.id,
          name: n.name,
          category: n.category,
          difficulty: n.difficulty,
          sampleCourses: [
            (course:Course)-[:TEACHES]->(n) |
            course.title
          ][0..2]
        }
      ] AS steps,

      length(p) AS hops
  `,

  // ================================================================
  // Learners
  // ================================================================

  learners: `
    MATCH (l:Learner)

    OPTIONAL MATCH (l)-[:HAS_SKILL]->(s:Skill)

    RETURN
      l.id AS id,
      l.name AS name,
      count(DISTINCT s) AS skillCount

    ORDER BY l.name
  `,

  // ================================================================
  // Recommendations
  // ================================================================

  recommendationsForLearner: `
    MATCH (l:Learner {id: $learnerId})-[:HAS_SKILL]->(known:Skill)

    WITH
      l,
      collect(known.id) AS knownIds

    MATCH (c:Course)

    WHERE NOT (l)-[:COMPLETED]->(c)

    OPTIONAL MATCH (c)-[:REQUIRES]->(req:Skill)

    WITH
      l,
      c,
      knownIds,
      collect(req.id) AS reqIds

    WHERE all(
      requiredId IN reqIds
      WHERE requiredId IN knownIds
    )

    MATCH (c)-[:TEACHES]->(taught:Skill)

    WITH
      l,
      c,
      knownIds,
      collect(DISTINCT taught) AS taughtSkills

    WITH
      l,
      c,
      knownIds,
      [
        skill IN taughtSkills
        WHERE NOT skill.id IN knownIds
        | skill.name
      ] AS newSkills

    WHERE size(newSkills) > 0

    OPTIONAL MATCH (peer:Learner)-[:HAS_SKILL]->(shared:Skill)

    WHERE
      peer <> l
      AND shared.id IN knownIds

    WITH
      l,
      c,
      newSkills,
      peer,
      count(DISTINCT shared) AS overlap

    WHERE peer IS NULL OR overlap >= 2

    WITH
      c,
      newSkills,
      count(DISTINCT peer) AS peerCount,

      count(
        DISTINCT CASE
          WHEN peer IS NOT NULL
            AND (peer)-[:COMPLETED]->(c)
          THEN peer
        END
      ) AS peersCompleted

    RETURN
      c.id AS id,
      c.title AS title,
      c.level AS level,
      c.durationHours AS durationHours,
      newSkills,
      peersCompleted

    ORDER BY
      peersCompleted DESC,
      size(newSkills) DESC

    LIMIT 8
  `,

  // ================================================================
  // Overview
  // ================================================================

  overviewStats: `
    MATCH (s:Skill)
    WITH count(s) AS skillCount

    MATCH (c:Course)
    WITH
      skillCount,
      count(c) AS courseCount

    MATCH (:Skill)-[r:PREREQUISITE_OF]->(:Skill)
    WITH
      skillCount,
      courseCount,
      count(r) AS prereqEdgeCount

    MATCH (l:Learner)

    RETURN
      skillCount,
      courseCount,
      prereqEdgeCount,
      count(l) AS learnerCount
  `,
};
