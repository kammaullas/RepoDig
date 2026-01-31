const { parseCode, extractDependencies } = require('./parser');

const code = `
const fs = require('fs');
import path from 'path';
const { something } = require('./localModule');

function test() {
    console.log('hello');
}
`;

console.log('Testing Parser...');
try {
    const result = parseCode(code);
    const tree = result.tree;
    console.log('Parse successful. Root node type:', tree.rootNode.type);

    const deps = extractDependencies(result);
    console.log('Extracted Dependencies:', deps);

    if (deps.includes('fs') && deps.includes('path') && deps.includes('./localModule')) {
        console.log('SUCCESS: All dependencies found.');
    } else {
        console.log('FAILURE: Missing dependencies.');
    }
} catch (e) {
    console.error('Error:', e);
}
