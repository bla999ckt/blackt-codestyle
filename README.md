# BlackT Code Style

BlackT Code Style is a powerful VS Code extension designed to streamline your coding workflow by enforcing custom code styles in your project. With BlackT Code Style, you can easily apply a predefined set of coding standards, ensuring consistent and clean code across your development environment.

## Features

- **Apply `Style50` Coding Standards**: Automatically format your code by applying `Style50` formatting rules, ensuring consistent code style for multiple languages (Python, JavaScript, Java, C, C++, etc.).
- **Terminal Support**: Apply the `Style50` formatting directly from the terminal using the `codestyle` command on any supported file.
- **Split Editor View**: After applying the style, view your code with the applied changes side-by-side with the original file in a split editor layout.
- **Supports Multiple File Types**: Works seamlessly with various languages, including `.py`, `.js`, `.java`, `.c`, `.cpp`, and more.

## Requirements

Before using the BlackT Code Style extension, make sure you have the following installed:

1. **Style50**: This extension relies on the `style50` command-line tool to format your code. You can install it using the following command:
    ```bash
    pip install style50
    ```
    Or follow the installation instructions from the official [Style50 repository](https://github.com/your-style50-repo-link).

2. **VS Code**: This extension requires Visual Studio Code to work properly.

## How to Use

You can apply the `Style50` code style using either the **Command Palette** in VS Code or the **Terminal**:

### Method 1: Use the Command Palette
1. Open the Command Palette:
    - Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac) to open the Command Palette in VS Code.

2. Run the `Apply Code Style` Command:
    - Type and select the `Apply Code Style` command from the palette. This will format your code according to the `Style50` rules (such as replacing multiple spaces with four spaces and ensuring proper coding conventions).

3. View Changes:
    - After running the command, the original code will be displayed on the left, and the formatted code will appear on the right side of the editor in a split view.

4. Reset Code Style:
    - You can reset the code style by using the `Reset Style` command, which will revert the changes and restore the original formatting.

### Method 2: Use the Terminal
1. Open your terminal in VS Code.

2. Run the `codestyle` Command:
    - Type the following command in the terminal:
    ```bash
    codestyle <file-path>
    ```
    - For example, to format a Python file, run:
    ```bash
    codestyle app.py
    ```
    - This command will apply `Style50` formatting to the specified file.

3. View Changes:
    - The formatted code will be displayed side-by-side with the original code in a split editor view.

## Installation

### Install from VS Code Marketplace
1. Open the Extensions view by clicking on the Extensions icon in the Activity Bar on the side of the window.
2. Search for `BlackT Code Style` in the Marketplace.
3. Click on the **Install** button to add the extension to your VS Code setup.

### Package Locally
If you prefer to install the extension locally:
1. Download the repository and navigate to the folder containing the extension's code.
2. Open a terminal and run `npm install` to install the necessary dependencies.
3. Run `vsce package` to package the extension into a `.vsix` file.
4. In VS Code, open the Command Palette and select `Extensions: Install from VSIX...`.
5. Choose the `.vsix` file you created to install the extension locally.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

---

## Contributing

If you'd like to contribute to the project, feel free to fork the repository, create a new branch, and submit a pull request. Contributions are always welcome!

### To contribute:
- Clone the repository: `git clone https://github.com/bla999ckt/blackt-codestyle.git`
- Install dependencies: `npm install`
- Build the extension: `npm run build`
- Test your changes locally by launching VS Code with your extension: `F5`
- Submit a pull request with a detailed description of your changes.

## Acknowledgements

Thank you to the open-source community for your contributions, and to the users of BlackT Code Style for providing feedback that helps improve the extension!
