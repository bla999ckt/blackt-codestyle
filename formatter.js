const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Global variable to store user-selected styles with defaults for each language
const STYLES = {
    C: 'microsoft',   // C files: Microsoft style (brace on the next line)
    PYTHON: 'microsoft', // Python files: Microsoft style (brace on the next line)
    JAVA: 'google',    // Java files: Google style (brace on the same line)
    JAVASCRIPT: 'llvm',        // JavaScript files: LLVM style
    CPP: 'google',  // C++ files: Google style (brace on the same line)
};

// Main function to format files based on their extensions and user-selected style
async function formatFileContent(filePath, style = STYLES) {
    const fileExtension = path.extname(filePath).toLowerCase();

    // If file extension matches .js, format using Prettier
    if (fileExtension === '.js') {
        return formatWithPrettier(filePath, style.JAVASCRIPT);
    }

    // If file extension matches .py, format using Black
    if (fileExtension === '.py') {
        return formatWithBlack(filePath, style.PYTHON);
    }

    // If file extension matches .cpp, .c, .java, format using ClangFormat
    if (fileExtension === '.cpp' || fileExtension === '.c' || fileExtension === '.java') {
        return formatWithClangFormat(filePath, STYLES[fileExtension.substring(1).toUpperCase()]); 
    }

    throw new Error('Unsupported file type');
}

// Helper function to check if a tool is installed
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

// Helper function to read file content after formatting
function readFileContent(filePath) {
    return fs.promises.readFile(filePath, 'utf8')
        .then(data => data)
        .catch(err => {
            throw new Error(`Error reading file after formatting: ${err.message}`);
        });
}

// Function to format JavaScript files using Prettier
async function formatWithPrettier(filePath, style) {
    try {
        // Check if Prettier is installed
        await isToolInstalled('prettier');

        return new Promise((resolve, reject) => {
            const prettierCommand = `prettier --parser babel --no-config --single-quote=${style === 'single'} "${filePath}"`;
            exec(prettierCommand, (error, stdout, stderr) => {
                if (error || stderr) {
                    reject(new Error(`Prettier formatting error: ${stderr || error.message}`));
                    return;
                }
                // Return the formatted output without modifying the original file
                resolve(stdout);
            });
        });
    } catch (err) {
        throw new Error(`Prettier check failed: ${err.message}`);
    }
}

// Function to format Python files using Black
async function formatWithBlack(filePath, style) {
    const os = require('os');

    try {
        // Check if Black is installed
        await isToolInstalled('black');

        // Read the content of the input file
        const fileContent = await fs.promises.readFile(filePath, 'utf8');

        return new Promise((resolve, reject) => {
            // Create a temporary file to avoid modifying the input file
            const tempFilePath = path.join(os.tmpdir(), path.basename(filePath));
            fs.promises.writeFile(tempFilePath, fileContent, 'utf8')
                .then(() => {
                    // Format the temporary file using Black
                    exec(`black --quiet --line-length=88 "${tempFilePath}"`, (error, stdout, stderr) => {
                        if (error || stderr) {
                            reject(new Error(`Black formatting error: ${stderr || error.message}`));
                            return;
                        }

                        // Read the formatted content from the temporary file
                        fs.promises.readFile(tempFilePath, 'utf8')
                            .then(formattedContent => {
                                // Delete the temporary file
                                fs.promises.unlink(tempFilePath)
                                    .catch(err => console.error(`Failed to delete temp file: ${err.message}`));
                                resolve(formattedContent); // Return the formatted content
                            })
                            .catch(err => reject(new Error(`Error reading formatted temp file: ${err.message}`)));
                    });
                })
                .catch(err => reject(new Error(`Error writing to temp file: ${err.message}`)));
        });
    } catch (err) {
        throw new Error(`Black check failed: ${err.message}`);
    }
}


// Function to format C, C++, or Java files using ClangFormat
async function formatWithClangFormat(filePath, style) {
    try {
        // Check if ClangFormat is installed
        await isToolInstalled('clang-format');

        return new Promise((resolve, reject) => {
            const clangCommand = style === 'microsoft'
                ? `clang-format -style=Microsoft "${filePath}"`
                : `clang-format -style=${style} "${filePath}"`; // Use the style specified by the user

            exec(clangCommand, (error, stdout, stderr) => {
                if (error || stderr) {
                    reject(new Error(`ClangFormat formatting error: ${stderr || error.message}`));
                    return;
                }
                // Return the formatted output without modifying the original file
                resolve(stdout);
            });
        });
    } catch (err) {
        throw new Error(`ClangFormat check failed: ${err.message}`);
    }
}


module.exports = formatFileContent;
