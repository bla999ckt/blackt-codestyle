#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

if (process.argv.length < 3) {
    console.error('Usage: codestyle <file>');
    process.exit(1);
}

const filePath = path.resolve(process.argv[2]);

try {
    // Open the file in VS Code
    console.log(`Opening file: ${filePath}`);
    execSync(`code --goto "${filePath}"`, { stdio: 'inherit' });

    // Trigger the extension's command in VS Code
    console.log('Applying code style...');
    execSync(
        `code --command workbench.action.executeCommand --arg blackt-codestyle.applyCodeStyle`,
        { stdio: 'inherit' }
    );
    console.log('Code style applied successfully.');
} catch (error) {
    console.error('An error occurred while running the CLI tool:', error.message);
    process.exit(1);
}
