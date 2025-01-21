const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const formatFile = require('./formatter'); // Import the formatFile function

// This method is called when your extension is activated
function activate(context) {
    console.log('Your extension "blackt-codestyle" is now active!');

    // Register the command to apply code style from terminal
    const disposableTerminal = vscode.commands.registerCommand('codestyle', function () {
        const editor = vscode.window.activeTextEditor;

        if (editor && editor.document) {
            const filePath = editor.document.uri.fsPath;
            if (fs.existsSync(filePath)) {
                formatAndDisplayCode(filePath); // Format and display the code
            } else {
                vscode.window.showErrorMessage(`File not found: ${filePath}`);
            }
        } else {
            vscode.window.showErrorMessage('No active editor or document found.');
        }
    });

    // Register the command to apply code style via the command palette
    const disposablePanel = vscode.commands.registerCommand('blackt-codestyle.applyCodeStyle', function () {
        const editor = vscode.window.activeTextEditor;

        if (editor && editor.document) {
            const filePath = editor.document.uri.fsPath;
            formatAndDisplayCode(filePath); // Format and display the code
        } else {
            vscode.window.showErrorMessage('No active editor or document found.');
        }
    });

    // Listen for file changes and recheck the code
    vscode.workspace.onDidSaveTextDocument((document) => {
        formatAndDisplayCode(document.uri.fsPath);
    });

    context.subscriptions.push(disposableTerminal, disposablePanel);
}

// Function to format and display the code
async function formatAndDisplayCode(filePath) {
    try {
        // Log the file path to ensure it's valid
        console.log('Processing file:', filePath);

        const formattedContent = await formatFile(filePath); // Wait for the formatting result

        // Log the formatted content for debugging
        console.log('Formatted Content:', formattedContent);

        // Ensure that the formattedContent is not undefined or null
        if (!formattedContent) {
            throw new Error('Formatted content is empty or undefined.');
        }

        // Get the original document's content
        const originalDocument = vscode.window.activeTextEditor?.document;
        if (!originalDocument) {
            vscode.window.showErrorMessage('No active document found.');
            return;
        }

        // Get the file extension of the original file
        const fileExtension = path.extname(filePath).toLowerCase();

        // Define the temporary file path for the codestyle file using the same extension as the original file
        const codestyleFilePath = path.join(__dirname, `codestyle${fileExtension}`);

        // Write the formatted content to a temporary file (use try-catch for sync methods)
        try {
            fs.writeFileSync(codestyleFilePath, formattedContent);
        } catch (err) {
            throw new Error(`Error writing formatted content to file: ${err.message}`);
        }

        // Open the diff editor with the original file (left) and the codestyle file (right)
        const leftUri = vscode.Uri.file(filePath);
        const rightUri = vscode.Uri.file(codestyleFilePath);

        const diffTitle = `Codestyle Comparison: ${path.basename(filePath)}`;
        await vscode.commands.executeCommand(
            'vscode.diff',
            leftUri,
            rightUri,
            diffTitle
        );

        // Cleanup after showing the diff
        try {
            fs.unlinkSync(codestyleFilePath); // Using sync version to avoid async issues
            console.log(`Successfully deleted codestyle file: ${codestyleFilePath}`);
        } catch (err) {
            console.error(`Failed to delete the codestyle file: ${err}`);
        }

    } catch (err) {
        console.error('Error processing file:', err); // Log the error for better debugging
        vscode.window.showErrorMessage(`Error processing file: ${err.message}`);
    }
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
    activate,
    deactivate
};
