const express = require('express');
const cors = require('cors');
const { verifyConnection, driver } = require('./db');
const { ingestRepo } = require('./ingestor');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.send('GraphRAG Archaeologist Backend is running');
});



app.post('/ingest', async (req, res) => {
    const { repoUrl } = req.body;
    if (!repoUrl) return res.status(400).send('Missing repoUrl');

    try {
        await ingestRepo(repoUrl);
        res.json({ status: 'Ingestion complete' });
    } catch (err) {
        console.error('Ingestion failed:', err);
        res.status(500).send('Ingestion failed');
    }
});


app.get('/graph', async (req, res) => {
    console.log("➡️ /graph route hit");
    const session = driver.session();

    try {
        console.log("➡️ Running MATCH query");
        const result = await session.run(`
            MATCH (n:File)
            OPTIONAL MATCH (n)-[r]->(m)
            RETURN n, r, m
            LIMIT 1000
        `);

        const nodes = new Map();
        const links = [];

        result.records.forEach(record => {
            const n = record.get('n');
            const m = record.get('m');
            const r = record.get('r');

            if (!nodes.has(n.identity.toString())) {
                nodes.set(n.identity.toString(), { id: n.properties.path, group: 'file' });
            }

            if (m && r) {
                if (!nodes.has(m.identity.toString())) {
                    nodes.set(m.identity.toString(), { id: m.properties.path, group: 'file' });
                }

                links.push({
                    source: n.properties.path,
                    target: m.properties.path,
                    type: r.type
                });
            }
        });

        res.json({
            nodes: Array.from(nodes.values()),
            links: links
        });
    } catch (e) {
        console.error(e);
        res.status(500).send(e.message);
    } finally {
        await session.close();
    }
});

process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED REJECTION:', reason);
});

const startServer = async () => {
    try {
        await verifyConnection();
        app.listen(port, () => {
            console.log(`Server listening on port ${port}`);
        });
    } catch (e) {
        console.error('Failed to start server:', e);
        process.exit(1);
    }
};

startServer();
