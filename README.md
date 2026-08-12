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

# SkillPath Graph Data Model

## Overview

SkillPath uses a graph model to represent learning relationships between
learners, skills, and courses.

The graph is designed around learning progression:

- A Learner can know a Skill.
- A Skill can require another Skill as a prerequisite.
- A Course can teach a Skill.
- Skills can be grouped into categories.
- Skills and Courses can have difficulty metadata.

The graph allows SkillPath to identify missing prerequisite skills and
recommend learning paths based on the learner's existing knowledge.

---

## Node Types

### 1. Learner

Represents a person using SkillPath.

**Label**

```text
Learner
```
