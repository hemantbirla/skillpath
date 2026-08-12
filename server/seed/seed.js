require("dotenv").config();

const { runWrite, verifyConnectivity, closeDriver } = require("../src/db");
const {
  skills,
  prereqEdges,
  instructors,
  courses,
  learners,
  hasSkill,
  completed,
} = require("./data");

async function run() {
  console.log("Connecting to CognoDB...");
  await verifyConnectivity();
  console.log(
    "Connected. Seeding graph (this is idempotent — safe to re-run)...\n",
  );

  // Constraints make repeated seeding idempotent via MERGE and keep lookups fast.
  await runWrite(
    "CREATE CONSTRAINT skill_id IF NOT EXISTS FOR (s:Skill) REQUIRE s.id IS UNIQUE",
  );
  await runWrite(
    "CREATE CONSTRAINT course_id IF NOT EXISTS FOR (c:Course) REQUIRE c.id IS UNIQUE",
  );
  await runWrite(
    "CREATE CONSTRAINT instructor_id IF NOT EXISTS FOR (i:Instructor) REQUIRE i.id IS UNIQUE",
  );
  await runWrite(
    "CREATE CONSTRAINT learner_id IF NOT EXISTS FOR (l:Learner) REQUIRE l.id IS UNIQUE",
  );

  await runWrite(
    `UNWIND $rows AS row
     MERGE (s:Skill {id: row.id})
     SET s.name = row.name, s.category = row.category, s.description = row.description`,
    { rows: skills },
  );
  console.log(`  Skill nodes:       ${skills.length}`);

  await runWrite(
    `UNWIND $rows AS row MERGE (i:Instructor {id: row.id}) SET i.name = row.name, i.bio = row.bio`,
    { rows: instructors },
  );
  console.log(`  Instructor nodes:  ${instructors.length}`);

  await runWrite(
    `UNWIND $rows AS row
     MERGE (c:Course {id: row.id})
     SET c.title = row.title, c.description = row.description, c.level = row.level,
         c.durationHours = row.durationHours, c.provider = row.provider, c.url = row.url`,
    { rows: courses },
  );
  console.log(`  Course nodes:      ${courses.length}`);

  await runWrite(
    `UNWIND $rows AS row MERGE (l:Learner {id: row.id}) SET l.name = row.name`,
    { rows: learners },
  );
  console.log(`  Learner nodes:     ${learners.length}\n`);

  // Relationships

  await runWrite(
    `UNWIND $rows AS row
     MATCH (a:Skill {id: row.from}), (b:Skill {id: row.to})
     MERGE (a)-[:PREREQUISITE_OF]->(b)`,
    { rows: prereqEdges.map(([from, to]) => ({ from, to })) },
  );
  console.log(`  PREREQUISITE_OF:   ${prereqEdges.length}`);

  const teachesRows = courses.flatMap((c) =>
    c.teaches.map((skillId) => ({ courseId: c.id, skillId })),
  );
  await runWrite(
    `UNWIND $rows AS row
     MATCH (c:Course {id: row.courseId}), (s:Skill {id: row.skillId})
     MERGE (c)-[:TEACHES]->(s)`,
    { rows: teachesRows },
  );
  console.log(`  TEACHES:           ${teachesRows.length}`);

  const requiresRows = courses.flatMap((c) =>
    c.requires.map((skillId) => ({ courseId: c.id, skillId })),
  );
  await runWrite(
    `UNWIND $rows AS row
     MATCH (c:Course {id: row.courseId}), (s:Skill {id: row.skillId})
     MERGE (c)-[:REQUIRES]->(s)`,
    { rows: requiresRows },
  );
  console.log(`  REQUIRES:          ${requiresRows.length}`);

  const taughtByRows = courses.map((c) => ({
    courseId: c.id,
    instructorId: c.instructor,
  }));
  await runWrite(
    `UNWIND $rows AS row
     MATCH (c:Course {id: row.courseId}), (i:Instructor {id: row.instructorId})
     MERGE (c)-[:TAUGHT_BY]->(i)`,
    { rows: taughtByRows },
  );
  console.log(`  TAUGHT_BY:         ${taughtByRows.length}`);

  await runWrite(
    `UNWIND $rows AS row
     MATCH (l:Learner {id: row[0]}), (s:Skill {id: row[1]})
     MERGE (l)-[:HAS_SKILL]->(s)`,
    { rows: hasSkill },
  );
  console.log(`  HAS_SKILL:         ${hasSkill.length}`);

  await runWrite(
    `UNWIND $rows AS row
     MATCH (l:Learner {id: row[0]}), (c:Course {id: row[1]})
     MERGE (l)-[:COMPLETED]->(c)`,
    { rows: completed },
  );
  console.log(`  COMPLETED:         ${completed.length}`);

  console.log("\nSeed complete.");
  await closeDriver();
}

run().catch(async (err) => {
  console.error("\nSeed failed:", err.message);
  await closeDriver();
  process.exit(1);
});
