const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const formatFile = require('./formatter'); // Import the formatFile function

// Called when the extension is activated
function activate(context) {
    console.log('Your extension "blackt-codestyle" is now active!');

    // Command to apply code style from terminal
    const disposableTerminal = vscode.commands.registerCommand('codestyle', () => {
        handleCommand();
    });

    // Command to apply code style via the command palette
    const disposablePanel = vscode.commands.registerCommand('blackt-codestyle.applyCodeStyle', () => {
        handleCommand();
    });

    context.subscriptions.push(disposableTerminal, disposablePanel);
}

let preventEditsDisposable = null;
let monitorChangesDisposable = null;

// Handles the command logic
function handleCommand() {
    const editor = vscode.window.activeTextEditor;

    if (editor && editor.document) {
        const filePath = editor.document.uri.fsPath;
        if (fs.existsSync(filePath)) {
            formatAndMonitorCode(filePath);
        } else {
            vscode.window.showErrorMessage(`File not found: ${filePath}`);
        }
    } else {
        vscode.window.showErrorMessage('No active editor or document found.');
    }
}

// Formats and monitors the code
async function formatAndMonitorCode(filePath) {
    try {
        console.log('Processing file:', filePath);

        // Dispose of existing event listeners
        disposeListeners();

        const formattedContent = await formatFile(filePath);
        if (!formattedContent) throw new Error('Formatted content is empty or undefined.');

        const originalDocument = vscode.window.activeTextEditor?.document;
        if (!originalDocument) {
            vscode.window.showErrorMessage('No active document found.');
            return;
        }

        const originalContent = originalDocument.getText();
        if (formattedContent === originalContent) {
            vscode.window.showInformationMessage('Your code looks good! :)');
            return;
        }

        const fileExtension = path.extname(filePath).toLowerCase();
        const codestyleFilePath = path.join(__dirname, `codestyle${fileExtension}`);
        fs.writeFileSync(codestyleFilePath, formattedContent);

        const leftUri = vscode.Uri.file(filePath);
        const rightUri = vscode.Uri.file(codestyleFilePath);
        const diffTitle = `Codestyle Comparison: ${path.basename(filePath)}`;

        await vscode.commands.executeCommand('vscode.diff', leftUri, rightUri, diffTitle);

        // Prevent edits to the codestyle file
        preventEditsDisposable = vscode.workspace.onDidChangeTextDocument((event) => {
            if (event.document.uri.fsPath === codestyleFilePath) {
                rollbackCodestyleFile(event.document, formattedContent);
            }
        });

        // Monitor for changes in the original file
        monitorChangesDisposable = vscode.workspace.onDidChangeTextDocument(async (event) => {
            const currentDocument = vscode.window.activeTextEditor?.document;
            if (currentDocument && currentDocument.uri.fsPath === filePath) {
                const currentContent = currentDocument.getText();
                if (currentContent === formattedContent) {
                    vscode.window.showInformationMessage('Your code looks good! :)');
                    await closeDiffEditor(codestyleFilePath);
                    disposeListeners();
                    cleanup(codestyleFilePath);
                }
            }
        });

        // Clean up the codestyle file when the editor is closed
        vscode.workspace.onDidCloseTextDocument((document) => {
            if (document.uri.fsPath === codestyleFilePath) cleanup(codestyleFilePath);
        });
    } catch (err) {
        console.error('Error processing file:', err);
        vscode.window.showErrorMessage(`Error processing file: ${err.message}`);
    }
}

// Closes the diff editor showing the codestyle file
async function closeDiffEditor(codestyleFilePath) {
    // Find the diff editor that shows the codestyle file
    const diffEditor = vscode.window.visibleTextEditors.find(
        (editor) => editor.document.uri.fsPath === codestyleFilePath
    );

    if (diffEditor) {
        // Close the specific diff editor (the codestyle file)
        await vscode.window.showTextDocument(diffEditor.document);
        await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
    }
}

// Reverts edits made to the codestyle file
function rollbackCodestyleFile(document, formattedContent) {
    vscode.window.visibleTextEditors.forEach((editor) => {
        if (editor.document.uri.fsPath === document.uri.fsPath) {
            editor.edit((editBuilder) => {
                editBuilder.replace(
                    new vscode.Range(0, 0, document.lineCount, 0),
                    formattedContent
                );
            });
        }
    });
}

// Cleans up the codestyle file
function cleanup(codestyleFilePath) {
    try {
        if (fs.existsSync(codestyleFilePath)) {
            fs.unlinkSync(codestyleFilePath);
            console.log(`Deleted codestyle file: ${codestyleFilePath}`);
        }
    } catch (err) {
        console.error(`Failed to delete codestyle file: ${err}`);
    }
}

// Disposes of existing event listeners
function disposeListeners() {
    if (preventEditsDisposable) {
        preventEditsDisposable.dispose();
        preventEditsDisposable = null;
    }
    if (monitorChangesDisposable) {
        monitorChangesDisposable.dispose();
        monitorChangesDisposable = null;
    }
}

// Deactivates the extension
function deactivate() {
    disposeListeners();
}

module.exports = {
    activate,
    deactivate,
};
