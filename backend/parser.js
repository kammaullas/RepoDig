const Parser = require('tree-sitter');
const JavaScript = require('tree-sitter-javascript');
let TypeScript, TSX;

try {
    const tsModule = require('tree-sitter-typescript');
    TypeScript = tsModule.typescript;
    TSX = tsModule.tsx;
} catch (e) {
    console.warn('Tree-sitter TypeScript not found, falling back to JavaScript parser for TS files.');
}

const parsers = {
    js: new Parser(),
    ts: new Parser(),
    tsx: new Parser(),
    python: new Parser()
};

parsers.js.setLanguage(JavaScript);
if (TypeScript) parsers.ts.setLanguage(TypeScript);
else parsers.ts.setLanguage(JavaScript); // Fallback

if (TSX) parsers.tsx.setLanguage(TSX);
else parsers.tsx.setLanguage(JavaScript); // Fallback

try {
    const Python = require('tree-sitter-python');
    parsers.python.setLanguage(Python);
} catch (e) {
    console.warn('Tree-sitter Python not found.');
}

const parseCode = (code, filename) => {
    let parser;
    if (filename && filename.endsWith('.tsx')) {
        parser = parsers.tsx;
    } else if (filename && filename.endsWith('.ts')) {
        parser = parsers.ts;
    } else if ((filename && filename.endsWith('.py')) || (filename && filename.endsWith('.ipynb'))) {
        parser = parsers.python;
    } else {
        parser = parsers.js;
    }
    return {
        tree: parser.parse(code),
        language: parser.getLanguage()
    };
};

const extractDependencies = ({ tree, language }) => {
    const dependencies = [];

    const jsQuery = `
        (import_statement source: (string (string_fragment) @import_source))
        (call_expression
            function: (identifier) @function_name
            arguments: (arguments (string (string_fragment) @require_source))
            (#eq? @function_name "require")
        )
    `;

    const pythonQuery = `
        (import_from_statement module_name: (dotted_name) @python_from)
        (import_statement name: (dotted_name) @python_import)
    `;

    let query;
    // Detect language using root node type (reliable heuristic)
    // JS/TS root is 'program', Python root is 'module'
    if (tree.rootNode.type === 'module') {
        try {
            query = new Parser.Query(language, pythonQuery);
        } catch (e) {
            // Fallback if grammar mismatch
            return [];
        }
    } else {
        // Default to JS query for 'program' or others
        try {
            query = new Parser.Query(language, jsQuery);
        } catch (e) {
            return [];
        }
    }

    const matches = query.matches(tree.rootNode);

    matches.forEach(match => {
        const captures = match.captures;
        captures.forEach(capture => {
            if (capture.name === 'import_source' || capture.name === 'require_source') {
                let dep = capture.node.text;
                // Remove quotes
                dep = dep.replace(/^['"`]|['"`]$/g, '');
                dependencies.push(dep);
            } else if (capture.name === 'python_from' || capture.name === 'python_import') {
                dependencies.push(capture.node.text);
            }
        });
    });

    return dependencies;
};

module.exports = { parseCode, extractDependencies };
