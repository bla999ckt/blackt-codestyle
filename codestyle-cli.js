#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

if (process.argv.length < 3) {
    console.error('Usage: codestyle <file>');
    process.exit(1);
}

const filePath = path.resolve(process.argv[2]);
const extname = path.extname(filePath);

try {
    console.log(`Applying code style to: ${filePath}`);

    // Check file extension and format accordingly
    if (extname === '.c' || extname === '.cpp') {
        // For C and C++ files, use clang-format
        console.log('Formatting C/C++ code...');
        execSync(`clang-format -i "${filePath}"`, { stdio: 'inherit' });
    } else if (extname === '.js' || extname === '.ts' || extname === '.jsx' || extname === '.tsx') {
        // For JavaScript/TypeScript files, use Prettier
        console.log('Formatting with Prettier...');
        execSync(`npx prettier --write "${filePath}"`, { stdio: 'inherit' });
    } else {
        console.log(`No specific formatter for ${extname}, skipping.`);
    }

    console.log('Code style applied successfully.');
} catch (error) {
    console.error('An error occurred while formatting:', error.message);
    process.exit(1);
}


