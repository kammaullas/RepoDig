
const { driver } = require('./db');

async function diagnose() {
    console.log("Starting Neo4j Diagnostic...");
    try {
        await driver.verifyConnectivity();
        console.log("SUCCESS: Connected to Neo4j!");

        const session = driver.session();
        try {
            const result = await session.run('RETURN 1 AS num');
            console.log("SUCCESS: Ran simple query: " + result.records[0].get('num'));
        } catch (queryError) {
            console.error("FAILURE: Connected but query failed. Error:");
            console.error(queryError.message);
            console.error("Code: " + queryError.code);
        } finally {
            await session.close();
        }
    } catch (connError) {
        console.error("FAILURE: Could not connect. Error:");
        console.error(connError.message);
        console.error("Code: " + connError.code);
    } finally {
        await driver.close();
    }
}

diagnose();
