const vscode = require('vscode');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// This method is called when your extension is activated
function activate(context) {
    console.log('Your extension "blackt-codestyle" is now active!');

    // Register the command to apply code style from terminal
    const disposableTerminal = vscode.commands.registerCommand('codestyle', function () {
        const editor = vscode.window.activeTextEditor;

        if (editor && editor.document) {
            const filePath = editor.document.uri.fsPath;
            if (fs.existsSync(filePath)) {
                runStyle50(context, filePath); // Run the style50 command on the file
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
            runStyle50(context, filePath); // Run the style50 command on the active file
        } else {
            vscode.window.showErrorMessage('No active editor or document found.');
        }
    });

    // Listen for file changes and recheck the code
    vscode.workspace.onDidSaveTextDocument((document) => {
            runStyle50(context, document.uri.fsPath);        
    });

    context.subscriptions.push(disposableTerminal, disposablePanel);
}

// Function to invoke the style50 command on the file
function runStyle50(context, filePath) {
    // Check if style50 is installed and available in PATH
    exec(`which style50`, (error, stdout, stderr) => {
        if (error) {
            // Display an error if style50 is not found
            vscode.window.showErrorMessage(`Error: style50 not found. Ensure it is installed and available in your PATH.`);
            return;
        }

        // Run the style50 command on the file
        exec(`style50 "${filePath}"`, (error, stdout, stderr) => {
            if (error) {
                // Display an error if style50 command fails
                vscode.window.showErrorMessage(`Error formatting file: ${stderr}`);
                return;
            }

            // Log the stdout to check if it contains the formatted content
            console.log('stdout:', stdout);

            // Check if stdout is defined and not empty
            if (!stdout) {
                vscode.window.showErrorMessage('No output from style50.');
                return;
            }

            // Check if the result is "Looks good!"
            if (stdout.includes('Looks good!')) {
                vscode.window.showInformationMessage('Your code looks good!');
                deleteAndCloseFormattedFile(); // Ensure this function is defined elsewhere
            } else {
                // Display the formatted code in a diff view
                displayFormattedCode(context, filePath, stdout);
            }
        });
    });
}

// Function to display formatted code with styling
async function displayFormattedCode(context, filePath, stdout) {
    console.log('Displaying formatted code');

    // Clean the formatted output from style50
    const cleanedContent = cleanOutput(stdout);
    console.log('Cleaned content:', cleanedContent);

    const originalDocument = vscode.window.activeTextEditor?.document;
    if (!originalDocument) {
        vscode.window.showErrorMessage('No active document found.');
        return;
    }

    // Define the temporary file path for the codestyle file
    const codestyleFilePath = path.join(context.extensionPath, 'codestyle.c');

    try {
        // Write the cleaned content (style50 output) to the "codestyle" file
        fs.writeFileSync(codestyleFilePath, cleanedContent);

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

            fs.unlink(codestyleFilePath, (err) => {
                if (err) {
                    console.error(`Failed to delete the codestyle file: ${err}`);
                } else {
                    console.log(`Successfully deleted codestyle file: ${codestyleFilePath}`);
                }
            });

    } catch (err) {
        vscode.window.showErrorMessage(`Error processing files: ${err.message}`);
    }
}

// Function to clean the style50 output, remove unwanted parts, and escape terminal color codes
function cleanOutput(formattedContent) {
    if (typeof formattedContent !== 'string') {
        console.error('Formatted content is not a valid string');
        return '';
    }
    // Clean the content and remove unwanted text or escape codes
    let cleanedContent = formattedContent
        .replace(/Results generated by style50.*\n/g, '')  // Remove unwanted text
        .replace(/And consider adding more comments!\n/g, '')

    const RED_HIGHLIGHT = /\x1b\[41m(\s*)\x1b\[0m/g; // Red background
    const GREEN_HIGHLIGHT = /\x1b\[42m(\s*)\x1b\[0m/g; // Green background
    const REMOVE_COLOR_CODES = /\x1b\[\d+m/g; // Any remaining ANSI color codes

    // Remove red-highlighted spaces (errors)
    cleanedContent = formattedContent.replace(RED_HIGHLIGHT, '');

    // Add green-highlighted spaces (fixes)
    cleanedContent = cleanedContent.replace(GREEN_HIGHLIGHT, (match, spaces) => spaces);

    // Remove any remaining ANSI color codes
    cleanedContent = cleanedContent.replace(REMOVE_COLOR_CODES, '');

        
    return cleanedContent;
}


// Function to delete and close the output file
function deleteAndCloseFormattedFile() {
    const editor = vscode.window.activeTextEditor;

    if (editor) {
        const outputFileUri = editor.document.uri;

        // Check if this is the temporary output file
        const outputFileName = path.basename(outputFileUri.fsPath);
        if (outputFileName.startsWith('codestyle')) {
            // First, close the output file from the editor
            vscode.commands.executeCommand('workbench.action.closeActiveEditor').then(() => {
                // Delete the output file once it has been closed
                fs.unlink(outputFileUri.fsPath, (err) => {
                    if (err) {
                        console.error(`Failed to delete the output file: ${err}`);
                    } else {
                        console.log(`Output file deleted: ${outputFileUri.fsPath}`);
                    }
                });
            });
        }
    }
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
    activate,
    deactivate
};
