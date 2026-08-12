const neo4j = require("neo4j-driver");

let driver = null;

/**
 * Lazily creates a single shared Neo4j driver instance.
 *
 * CognoDB exposes a Bolt endpoint, so the official Neo4j
 * JavaScript driver can be used directly.
 */
function getDriver() {
  if (driver) {
    return driver;
  }

  const uri = process.env.COGNODB_URI;
  const user = process.env.COGNODB_USER || "cognodb";
  const password = process.env.COGNODB_PASSWORD;

  if (!uri || !password) {
    throw new Error(
      "Missing COGNODB_URI or COGNODB_PASSWORD. " +
        "Configure these values in server/.env.",
    );
  }

  driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
    maxConnectionPoolSize: 20,
  });

  return driver;
}

/**
 * Creates a read session, executes a Cypher query,
 * and returns the Neo4j records.
 */
async function runQuery(cypher, params = {}) {
  const session = getDriver().session({
    defaultAccessMode: neo4j.session.READ,
  });

  try {
    const result = await session.run(cypher, params);
    return result.records;
  } finally {
    await session.close();
  }
}

/**
 * Creates a write session, executes a Cypher query,
 * and returns the Neo4j records.
 */
async function runWrite(cypher, params = {}) {
  const session = getDriver().session({
    defaultAccessMode: neo4j.session.WRITE,
  });

  try {
    const result = await session.run(cypher, params);
    return result.records;
  } finally {
    await session.close();
  }
}

/**
 * Verifies that CognoDB is reachable and credentials are valid.
 */
async function verifyConnectivity() {
  await getDriver().verifyConnectivity();
}

/**
 * Gracefully closes the shared Neo4j driver.
 */
async function closeDriver() {
  if (driver) {
    await driver.close();
    driver = null;
  }
}

module.exports = {
  getDriver,
  runQuery,
  runWrite,
  verifyConnectivity,
  closeDriver,
};
