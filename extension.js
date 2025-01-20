const vscode = require('vscode');

// This method is called when your extension is activated
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log('Your extension "blackt-codestyle" is now active!');

    // Register the command to open the style selection interface
    const disposable = vscode.commands.registerCommand('codestyle', function () {

        // Create a WebView panel for the code style GUI
        const panel = vscode.window.createWebviewPanel(
            'style50Webview', // Identifies the type of the webview
            'Select Code Style', // Title for the webview
            vscode.ViewColumn.One, // Editor column to show the webview in
            {
                enableScripts: true, // Enable JavaScript in the webview
            }
        );

        // Set the HTML content for the WebView
        panel.webview.html = getWebviewContent();

        // Handle messages from the WebView
        panel.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                case 'applyStyle50':
                    applyStyle50();
                    break;
                case 'resetStyle':
                    resetStyle();
                    break;
            }
        });
    });

    context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

// Function to apply "style50" formatting
function applyStyle50() {
    const editor = vscode.window.activeTextEditor; // Get the active editor
    if (editor) {
        const text = editor.document.getText(); // Get the text of the document

        // Example of formatting logic: Replace multiple spaces with four spaces (style50)
        const formattedText = text.replace(/\s+/g, '    '); // Replace spaces with 4 spaces

        // Create a range to replace the entire document content
        const fullTextRange = new vscode.Range(
            editor.document.positionAt(0),
            editor.document.positionAt(text.length)
        );

        // Apply the formatted text to the editor
        editor.edit(editBuilder => {
            editBuilder.replace(fullTextRange, formattedText); // Replace content with formatted text
        });
    }
}

// Function to reset the style (just a placeholder for now)
function resetStyle() {
    const editor = vscode.window.activeTextEditor; // Get the active editor
    if (editor) {
        const text = editor.document.getText(); // Get the text of the document

        // Example of resetting the text (can be changed to something else)
        const resetText = text.trim(); // Just trimming whitespace as a simple "reset"

        // Create a range to replace the entire document content
        const fullTextRange = new vscode.Range(
            editor.document.positionAt(0),
            editor.document.positionAt(text.length)
        );

        // Apply the reset text to the editor
        editor.edit(editBuilder => {
            editBuilder.replace(fullTextRange, resetText); // Replace content with reset text
        });
    }
}

// Helper function to generate the HTML content for the WebView (GUI)
function getWebviewContent() {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Code Style Settings</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 20px;
                }
                .container {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .button {
                    padding: 10px;
                    background-color: #0078d4;
                    color: white;
                    border: none;
                    cursor: pointer;
                }
                .button:hover {
                    background-color: #005fa3;
                }
                .title {
                    font-size: 20px;
                    margin-bottom: 20px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h2 class="title">Choose Your Code Style</h2>
                <button class="button" onclick="applyStyle50()">Apply Style50</button>
                <button class="button" onclick="resetStyle()">Reset Style</button>
            </div>
            <script>
                // Function to handle "Apply Style50" button
                function applyStyle50() {
                    // Send message to the extension to apply style50
                    vscode.postMessage({ command: 'applyStyle50' });
                }

                // Function to handle "Reset Style" button
                function resetStyle() {
                    vscode.postMessage({ command: 'resetStyle' });
                }
            </script>
        </body>
        </html>
    `;
}

module.exports = {
    activate,
    deactivate
};
