#!/usr/bin/env node

const { exec } = require('child_process');
const path = require('path');

// Parse the file path from the command-line arguments
const filePath = process.argv[2];

if (!filePath) {
    console.error("Usage: codestyle <file.extension>");
    process.exit(1);
}

// Get the absolute file path
const absolutePath = path.resolve(filePath);

// Command to open VS Code with the file and activate your extension
const vscodeCommand = `code --wait --goto "${absolutePath}" && code --command "blackt-codestyle.applyCodeStyle"`;

// Execute the command
exec(vscodeCommand, (error, stdout, stderr) => {
    if (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
    if (stderr) {
        console.error(`Error: ${stderr}`);
        process.exit(1);
    }

    console.log(stdout);
});
