const vscode = require('vscode');
const { exec } = require('child_process');
const fs = require('fs');

// This method is called when your extension is activated
function activate(context) {
    console.log('Your extension "blackt-codestyle" is now active!');

    // Register the command to apply code style from terminal
    const disposableTerminal = vscode.commands.registerCommand('codestyle', function (fileUri) {
        const filePath = fileUri.fsPath; // Get the file path from the terminal

        if (fs.existsSync(filePath)) {
            runStyle50(filePath); // Run the style50 command on the file
        } else {
            vscode.window.showErrorMessage(`File not found: ${filePath}`);
        }
    });

    // Register the command to apply code style via the command palette
    const disposablePanel = vscode.commands.registerCommand('blackt-codestyle.applyCodeStyle', function () {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const filePath = editor.document.uri.fsPath;
            runStyle50(filePath); // Run the style50 command on the active file
        }
    });

    context.subscriptions.push(disposableTerminal, disposablePanel);
}

// Function to invoke the `style50` command on the file
function runStyle50(filePath) {
    exec(`style50 ${filePath}`, (error, stdout, stderr) => {
        if (error) {
            vscode.window.showErrorMessage(`Error formatting file: ${stderr}`);
            return;
        }

        // After running the style50 command, we can show the results in the editor
        displayFormattedCode(filePath, stdout);
    });
}

// Function to display the formatted code in a split editor view
function displayFormattedCode(filePath, formattedContent) {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const originalDocument = editor.document;
        
        // Open the original document in the left editor column
        vscode.workspace.openTextDocument(filePath).then(doc => {
            vscode.window.showTextDocument(doc, vscode.ViewColumn.One);

            // Create a new untitled document to display formatted content
            vscode.workspace.openTextDocument({ content: formattedContent }).then(newDoc => {
                vscode.window.showTextDocument(newDoc, vscode.ViewColumn.Beside);
                vscode.window.showInformationMessage(`Style50 applied to ${filePath}`);
            });
        });
    }
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
    activate,
    deactivate
};
