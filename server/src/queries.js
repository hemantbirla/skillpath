/**
 * All Cypher lives here, in one place, so the queries can be read and
 * reviewed independently of the Express plumbing.
 *
 * Every query is parameterised ($paramName).
 * No request input is string-concatenated into Cypher.
 */

module.exports = {
  // ---- Skills -------------------------------------------------------

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

  // ---- Courses -----------------------------------------------------

  searchCourses: `
    MATCH (c:Course)

    WHERE $term = '' OR toLower(c.title) CONTAINS toLower($term)

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

  // ---- Path finder ---------------------------------------------------

  shortestSkillPath: `
  MATCH (from:Skill {id: $fromId})
  MATCH (to:Skill {id: $toId})

  MATCH p = shortestPath(
    (from)-[:PREREQUISITE_OF*1..10]->(to)
  )

  RETURN
    [n IN nodes(p) | {
      id: n.id,
      name: n.name,
      category: n.category,
      sampleCourses: [
        (course:Course)-[:TEACHES]->(n) |
        course.title
      ][0..2]
    }] AS steps,
    length(p) AS hops
`,
};
