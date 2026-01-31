const { driver } = require('./db');

async function checkDb() {
    const session = driver.session();
    try {
        const count = await session.run('MATCH (n) RETURN count(n) as count');
        console.log(`Node count: ${count.records[0].get('count')}`);

        const rels = await session.run('MATCH ()-[r]->() RETURN count(r) as count');
        console.log(`Relationship count: ${rels.records[0].get('count')}`);

        const nodes = await session.run('MATCH (n) RETURN n LIMIT 5');
        console.log('Sample Import:', JSON.stringify(nodes.records.map(r => r.get('n').properties), null, 2));

    } catch (e) {
        console.error(e);
    } finally {
        await session.close();
        await driver.close();
    }
}

checkDb();
