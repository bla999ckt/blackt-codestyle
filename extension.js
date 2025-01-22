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

    context.subscriptions.push(disposableTerminal, disposablePanel);
}

// Function to format and display the code
async function formatAndDisplayCode(filePath) {
    try {
        console.log('Processing file:', filePath);

        const formattedContent = await formatFile(filePath);

        if (!formattedContent) {
            throw new Error('Formatted content is empty or undefined.');
        }

        // Get the original document's content
        const originalDocument = vscode.window.activeTextEditor?.document;
        if (!originalDocument) {
            vscode.window.showErrorMessage('No active document found.');
            return;
        }

        const originalContent = originalDocument.getText();

        // Check if the formatted content matches the original content
        if (formattedContent === originalContent) {
            vscode.window.showInformationMessage('Looks good!');
            return;
        }

        // Get the file extension of the original file
        const fileExtension = path.extname(filePath).toLowerCase();

        // Define the temporary file path for the codestyle file
        const codestyleFilePath = path.join(__dirname, `codestyle${fileExtension}`);

        // Write the formatted content to the codestyle file
        fs.writeFileSync(codestyleFilePath, formattedContent);

        // Open the diff editor
        const leftUri = vscode.Uri.file(filePath);
        const rightUri = vscode.Uri.file(codestyleFilePath);

        const diffTitle = `Codestyle Comparison: ${path.basename(filePath)}`;
        await vscode.commands.executeCommand(
            'vscode.diff',
            leftUri,
            rightUri,
            diffTitle
        );

        // Cleanup the codestyle file
        fs.unlinkSync(codestyleFilePath);
        console.log(`Successfully deleted codestyle file: ${codestyleFilePath}`);
    } catch (err) {
        console.error('Error processing file:', err);
        vscode.window.showErrorMessage(`Error processing file: ${err.message}`);
    }
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
    activate,
    deactivate
};
