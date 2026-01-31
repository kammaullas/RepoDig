const neo4j = require('neo4j-driver');
require('dotenv').config();

const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
const user = process.env.NEO4J_USER || 'neo4j';
const password = process.env.NEO4J_PASSWORD || 'password';

// If URL has +s scheme (neo4j+s:// or bolt+s://), encryption is handled by URL
// Only set encryption config for non-secure schemes to avoid conflict
const hasSecureScheme = uri.startsWith('neo4j+s') || uri.startsWith('bolt+s');
const driverConfig = { disableLosslessIntegers: true };

// Only add encryption config if NOT using secure URL scheme
if (!hasSecureScheme) {
  driverConfig.encrypted = 'ENCRYPTION_OFF';
}

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password), driverConfig);

const verifyConnection = async () => {
  try {
    await driver.verifyConnectivity();
    console.log('Connected to Neo4j');
  } catch (error) {
    console.error('Neo4j connection failed:', error);
    throw error;
  }
};

module.exports = { driver, verifyConnection };
