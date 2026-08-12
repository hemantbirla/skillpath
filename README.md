# SkillPath

A knowledge graph of skills and courses. SkillPath answers the questions a
learning platform actually gets asked — _"what's the fastest way from what I
know to what I want to learn?"_, _"which skill, if I learned it, would open
the most doors?"_, _"what should I take next, given what people like me have
already taken?"_ — by walking a graph instead of joining tables.

Built for the Wexa AI take-home assignment, backed by **CognoDB** (a managed,
Bolt-compatible graph database) via the official Neo4j JavaScript driver.

- **Backend**: Node.js / Express, `neo4j-driver`, parameterised Cypher only
- **Frontend**: React (Vite), React Router, no CSS framework
- **Data model**: `Skill`, `Course`, `Instructor`, `Learner` nodes; five
  relationship types

---
