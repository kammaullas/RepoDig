const simpleGit = require('simple-git');
const fs = require('fs');
const path = require('path');
const { parseCode, extractDependencies } = require('./parser');
const { driver } = require('./db');

/**
 * Recursively collect source files
 */
const walkDir = (dir, fileList = []) => {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            if (file !== '.git' && file !== 'node_modules') {
                walkDir(filePath, fileList);
            }
        } else if (
            file.endsWith('.js') ||
            file.endsWith('.jsx') ||
            file.endsWith('.ts') ||
            file.endsWith('.tsx') ||
            file.endsWith('.mjs') ||
            file.endsWith('.cjs') ||
            file.endsWith('.py') ||
            file.endsWith('.ipynb')
        ) {
            fileList.push(filePath); // ✅ FIXED
        }
    }

    return fileList;
};

/**
 * Main ingestion function
 */
const ingestRepo = async (repoUrl) => {
    const timestamp = Date.now();
    const baseDir = path.join(__dirname, 'temp_repos');
    const repoDir = path.join(baseDir, String(timestamp));

    if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir);

    // IMPORTANT: git instance must be local
    const git = simpleGit();

    try {
        console.log(`Cloning ${repoUrl}...`);
        await git.clone(repoUrl, repoDir, ['--depth', '1']);

        if (fs.existsSync(repoDir)) {
            console.log(`✅ Repo CLONED successfully to: ${repoDir}`);
        } else {
            throw new Error('❌ Clone failed: Directory not found');
        }

        const files = walkDir(repoDir);
        if (files.length > 500) {
            throw new Error('Repository too large to ingest');
        }

        // Index all real file paths for fast resolution
        const relPathSet = new Set(
            files.map(f =>
                path.relative(repoDir, f).split(path.sep).join('/')
            )
        );

        const session = driver.session();
        const tx = session.beginTransaction();

        try {
            console.log('Clearing old database data...');
            await tx.run('MATCH (n) DETACH DELETE n');

            console.log(`Found ${files.length} files to ingest.`);

            for (const absFile of files) {
                const relativePath =
                    path.relative(repoDir, absFile).split(path.sep).join('/');
                console.log(`Processing file: ${relativePath}`);
                let content;
                if (absFile.endsWith('.ipynb')) {
                    try {
                        const raw = fs.readFileSync(absFile, 'utf8');
                        const json = JSON.parse(raw);
                        content = json.cells
                            .filter(c => c.cell_type === 'code')
                            .map(c => Array.isArray(c.source) ? c.source.join('') : c.source)
                            .join('\n');
                    } catch (e) {
                        console.warn(`Failed to process notebook ${relativePath}:`, e);
                        content = '';
                    }
                } else {
                    content = fs.readFileSync(absFile, 'utf8');
                }

                let tree, dependencies;
                try {
                    const result = parseCode(content, relativePath);
                    tree = result.tree;
                    dependencies = extractDependencies(result);
                } catch (err) {
                    console.warn(`Failed to parse: ${relativePath} - ${err.message}`);
                    continue;
                }

                // Create file node
                await tx.run(
                    `
                    MERGE (f:File { path: $path })
                    SET f.snippet = $snippet
                    `,
                    {
                        path: relativePath,
                        snippet: content.substring(0, 200),
                    }
                );
                console.log(`  - Created node for ${relativePath}`);

                const currentDir = path.dirname(relativePath);

                for (const dep of dependencies) {
                    // FILTER REMOVED: Allow all imports to pass through to candidate resolution
                    // Python and other languages often use non-relative imports for local modules

                    // Resolve dependency path
                    const baseResolved = dep.startsWith('src/')
                        ? dep
                        : path
                            .join(currentDir, dep)
                            .split(path.sep)
                            .join('/');

                    const candidates = [
                        baseResolved,
                        baseResolved + '.js',
                        baseResolved + '.jsx',
                        baseResolved + '.ts',
                        baseResolved + '.tsx',
                        baseResolved + '.mjs',
                        baseResolved + '.cjs',
                        baseResolved + '.py',
                        baseResolved + '.ipynb',
                        baseResolved + '/index.js',
                        baseResolved + '/index.jsx',
                        baseResolved + '/index.ts',
                        baseResolved + '/index.tsx',
                        baseResolved + '/index.ipynb',
                        baseResolved + '/index.py',
                        baseResolved + '/__init__.py'
                    ];

                    const targetPath = candidates.find(c =>
                        relPathSet.has(c)
                    );

                    if (!targetPath) {
                        console.log(`  - Dependency not found: ${dep} -> ${baseResolved} (in ${relativePath})`);
                        continue;
                    }

                    await tx.run(
                        `
                        MATCH (f:File { path: $from })
                        MERGE (t:File { path: $to })
                        MERGE (f)-[:DEPENDS_ON]->(t)
                        `,
                        {
                            from: relativePath,
                            to: targetPath,
                        }
                    );
                    console.log(`  - Created relationship: ${relativePath} -> ${targetPath}`);
                }
            }

            await tx.commit();
            console.log('Ingestion transaction committed.');
            console.log('Ingestion complete.');
        } catch (e) {
            console.error('Error during ingestion transaction:', e);
            await tx.rollback();
            throw e;
        } finally {
            await session.close();
        }
    } catch (err) {
        console.error('Ingestion failed:', err);
        throw err;
    } finally {
        // Windows-safe async cleanup
        // setTimeout(() => {
        //     if (fs.existsSync(repoDir)) {
        //         fs.rm(repoDir, { recursive: true, force: true }, (err) => {
        //             if (err) console.error('Warning: Cleanup had issues:', err.message);
        //         });
        //     }
        // }, 3000);
        console.log(`Files retained for debugging at: ${repoDir}`);
    }
};

module.exports = { ingestRepo };
