(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  var __commonJS = (cb, mod) => function __require2() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // extension.js
  var require_extension = __commonJS({
    "extension.js"(exports, module) {
      var vscode = __require("vscode");
      function activate(context) {
        console.log('Your extension "blackt-codestyle" is now active!');
        const disposable = vscode.commands.registerCommand("blackt-codestyle.style50", function() {
          const panel = vscode.window.createWebviewPanel(
            "style50Webview",
            // Identifies the type of the webview
            "Select Code Style",
            // Title for the webview
            vscode.ViewColumn.One,
            // Editor column to show the webview in
            {
              enableScripts: true
              // Enable JavaScript in the webview
            }
          );
          panel.webview.html = getWebviewContent();
          panel.webview.onDidReceiveMessage((message) => {
            switch (message.command) {
              case "applyStyle50":
                applyStyle50();
                break;
              case "resetStyle":
                resetStyle();
                break;
            }
          });
        });
        context.subscriptions.push(disposable);
      }
      function deactivate() {
      }
      function applyStyle50() {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
          const text = editor.document.getText();
          const formattedText = text.replace(/\s+/g, "    ");
          const fullTextRange = new vscode.Range(
            editor.document.positionAt(0),
            editor.document.positionAt(text.length)
          );
          editor.edit((editBuilder) => {
            editBuilder.replace(fullTextRange, formattedText);
          });
        }
      }
      function resetStyle() {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
          const text = editor.document.getText();
          const resetText = text.trim();
          const fullTextRange = new vscode.Range(
            editor.document.positionAt(0),
            editor.document.positionAt(text.length)
          );
          editor.edit((editBuilder) => {
            editBuilder.replace(fullTextRange, resetText);
          });
        }
      }
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
            <\/script>
        </body>
        </html>
    `;
      }
      module.exports = {
        activate,
        deactivate
      };
    }
  });
  require_extension();
})();
