var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// formatter.js
var require_formatter = __commonJS({
  "formatter.js"(exports2, module2) {
    var fs2 = require("fs");
    var path2 = require("path");
    var os = require("os");
    var { exec } = require("child_process");
    var STYLES = {
      C: "microsoft",
      // C files: Microsoft style (brace on the next line)
      PYTHON: "microsoft",
      // Python files: Microsoft style (brace on the next line)
      JAVA: "google",
      // Java files: Google style (brace on the same line)
      JAVASCRIPT: "llvm",
      // JavaScript files: LLVM style
      CPP: "google"
      // C++ files: Google style (brace on the same line)
    };
    async function formatFileContent(filePath, style = STYLES) {
      const fileExtension = path2.extname(filePath).toLowerCase();
      if (fileExtension === ".js" || fileExtension === ".ts" || fileExtension === ".jsx" || fileExtension === ".tsx") {
        return formatWithPrettier(filePath, style.JAVASCRIPT);
      }
      if (fileExtension === ".py") {
        return formatWithBlack(filePath, style.PYTHON);
      }
      if (fileExtension === ".cpp" || fileExtension === ".c" || fileExtension === ".java") {
        return formatWithClangFormat(filePath, STYLES[fileExtension.substring(1).toUpperCase()]);
      }
      throw new Error(`Unsupported file type: ${fileExtension}. Supported types: .js, .ts, .jsx, .tsx, .py, .cpp, .c, .java`);
    }
    function isToolInstalled(tool) {
      return new Promise((resolve, reject) => {
        exec(`which ${tool}`, (error, stdout, stderr) => {
          if (error || stderr || !stdout) {
            reject(new Error(`${tool} not found. Please install ${tool} to proceed.`));
            return;
          }
          resolve(stdout.trim());
        });
      });
    }
    async function formatWithPrettier(filePath, style) {
      try {
        await isToolInstalled("prettier");
        const fileContent = await fs2.promises.readFile(filePath, "utf8");
        return new Promise((resolve, reject) => {
          const tempFilePath = path2.join(os.tmpdir(), path2.basename(filePath));
          fs2.promises.writeFile(tempFilePath, fileContent, "utf8").then(() => {
            const prettierCommand = `prettier --parser babel --no-config --single-quote=${style === "single"} "${tempFilePath}"`;
            exec(prettierCommand, (error, stdout, stderr) => {
              if (error || stderr) {
                reject(new Error(`Prettier failed to format the file: ${filePath}. Error: ${stderr || error.message}`));
                return;
              }
              fs2.promises.unlink(tempFilePath).catch(
                (err) => console.error(`Failed to delete temp file: ${err.message}`)
              );
              resolve(stdout);
            });
          }).catch((err) => reject(new Error(`Error writing to temp file for Prettier: ${err.message}`)));
        });
      } catch (err) {
        throw new Error(`Prettier check failed: ${err.message}`);
      }
    }
    async function formatWithBlack(filePath, style) {
      try {
        await isToolInstalled("black");
        const fileContent = await fs2.promises.readFile(filePath, "utf8");
        return new Promise((resolve, reject) => {
          const tempFilePath = path2.join(os.tmpdir(), path2.basename(filePath));
          fs2.promises.writeFile(tempFilePath, fileContent, "utf8").then(() => {
            const lineLength = style.lineLength || 88;
            const safeMode = style.safe ? "--safe" : "";
            const blackCommand = `black --quiet --line-length=${lineLength} ${safeMode} "${tempFilePath}"`;
            exec(blackCommand, (error, stdout, stderr) => {
              if (error || stderr) {
                reject(new Error(`Black failed to format the file: ${filePath}. Error: ${stderr || error.message}`));
                return;
              }
              fs2.promises.readFile(tempFilePath, "utf8").then((formattedContent) => {
                fs2.promises.unlink(tempFilePath).catch((err) => console.error(`Failed to delete temp file: ${err.message}`));
                resolve(formattedContent);
              }).catch((err) => reject(new Error(`Error reading formatted temp file for Black: ${err.message}`)));
            });
          }).catch((err) => reject(new Error(`Error writing to temp file for Black: ${err.message}`)));
        });
      } catch (err) {
        throw new Error(`Black check failed: ${err.message}`);
      }
    }
    async function formatWithClangFormat(filePath, style) {
      try {
        await isToolInstalled("clang-format");
        const fileContent = await fs2.promises.readFile(filePath, "utf8");
        return new Promise((resolve, reject) => {
          const tempFilePath = path2.join(os.tmpdir(), path2.basename(filePath));
          fs2.promises.writeFile(tempFilePath, fileContent, "utf8").then(() => {
            const clangCommand = style === "microsoft" ? `clang-format -style=Microsoft "${tempFilePath}"` : `clang-format -style=${style} "${tempFilePath}"`;
            exec(clangCommand, (error, stdout, stderr) => {
              if (error || stderr) {
                reject(new Error(`ClangFormat failed to format the file: ${filePath}. Error: ${stderr || error.message}`));
                return;
              }
              fs2.promises.unlink(tempFilePath).catch(
                (err) => console.error(`Failed to delete temp file: ${err.message}`)
              );
              resolve(stdout);
            });
          }).catch((err) => reject(new Error(`Error writing to temp file for ClangFormat: ${err.message}`)));
        });
      } catch (err) {
        throw new Error(`ClangFormat check failed: ${err.message}`);
      }
    }
    module2.exports = formatFileContent;
  }
});

// extension.js
var vscode = require("vscode");
var fs = require("fs");
var path = require("path");
var formatFile = require_formatter();
function activate(context) {
  console.log('Your extension "blackt-codestyle" is now active!');
  const disposableTerminal = vscode.commands.registerCommand("codestyle", () => {
    handleCommand();
  });
  const disposablePanel = vscode.commands.registerCommand("blackt-codestyle.applyCodeStyle", () => {
    handleCommand();
  });
  context.subscriptions.push(disposableTerminal, disposablePanel);
}
var preventEditsDisposable = null;
var monitorChangesDisposable = null;
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
    vscode.window.showErrorMessage("No active editor or document found.");
  }
}
async function formatAndMonitorCode(filePath) {
  try {
    console.log("Processing file:", filePath);
    disposeListeners();
    const formattedContent = await formatFile(filePath);
    if (!formattedContent) throw new Error("Formatted content is empty or undefined.");
    const originalDocument = vscode.window.activeTextEditor?.document;
    if (!originalDocument) {
      vscode.window.showErrorMessage("No active document found.");
      return;
    }
    const originalContent = originalDocument.getText();
    if (formattedContent === originalContent) {
      vscode.window.showInformationMessage("Your code looks good! :)");
      return;
    }
    const fileExtension = path.extname(filePath).toLowerCase();
    const codestyleFilePath = path.join(__dirname, `codestyle${fileExtension}`);
    fs.writeFileSync(codestyleFilePath, formattedContent);
    const leftUri = vscode.Uri.file(filePath);
    const rightUri = vscode.Uri.file(codestyleFilePath);
    const diffTitle = `Codestyle Comparison: ${path.basename(filePath)}`;
    await vscode.commands.executeCommand("vscode.diff", leftUri, rightUri, diffTitle);
    preventEditsDisposable = vscode.workspace.onDidChangeTextDocument((event) => {
      if (event.document.uri.fsPath === codestyleFilePath) {
        rollbackCodestyleFile(event.document, formattedContent);
      }
    });
    monitorChangesDisposable = vscode.workspace.onDidChangeTextDocument(async (event) => {
      const currentDocument = vscode.window.activeTextEditor?.document;
      if (currentDocument && currentDocument.uri.fsPath === filePath) {
        const currentContent = currentDocument.getText();
        if (currentContent === formattedContent) {
          vscode.window.showInformationMessage("Your code looks good! :)");
          await closeDiffEditor(codestyleFilePath);
          disposeListeners();
          cleanup(codestyleFilePath);
        }
      }
    });
    vscode.workspace.onDidCloseTextDocument((document) => {
      if (document.uri.fsPath === codestyleFilePath) cleanup(codestyleFilePath);
    });
  } catch (err) {
    console.error("Error processing file:", err);
    vscode.window.showErrorMessage(`Error processing file: ${err.message}`);
  }
}
function rollbackCodestyleFile(document, formattedContent) {
  vscode.window.visibleTextEditors.forEach((editor) => {
    if (editor.document === document) {
      editor.edit((editBuilder) => {
        const fullRange = new vscode.Range(
          0,
          0,
          document.lineCount,
          0
        );
        editBuilder.replace(fullRange, formattedContent);
      }).then((success) => {
        if (!success) {
          vscode.window.showErrorMessage(
            "Failed to revert edits to the codestyle file."
          );
        } else {
          console.log("Codestyle file reverted successfully.");
        }
      });
    }
  });
}
async function closeDiffEditor(codestyleFilePath) {
  const diffEditor = vscode.window.visibleTextEditors.find(
    (editor) => editor.document.uri.fsPath === codestyleFilePath
  );
  if (diffEditor) {
    await vscode.window.showTextDocument(diffEditor.document);
    await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
  }
}
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
function deactivate() {
  disposeListeners();
}
module.exports = {
  activate,
  deactivate
};
