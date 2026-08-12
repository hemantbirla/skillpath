const neo4j = require("neo4j-driver");

let driver = null;

function getDriver() {
  if (driver) return driver;

  const uri = process.env.COGNODB_URI;
  const user = process.env.COGNODB_USER || "cognodb";
  const password = process.env.COGNODB_PASSWORD;

  if (!uri || !password) {
    throw new Error(
      "Missing COGNODB_URI or COGNODB_PASSWORD. Copy server/.env.example to server/.env and fill in " +
        "the values from your CognoDB Cloud instance.",
    );
  }

  driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
    maxConnectionPoolSize: 20,
  });

  return driver;
}

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

async function verifyConnectivity() {
  await getDriver().verifyConnectivity();
}

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
