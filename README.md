# BlackT Code Style

BlackT Code Style is a powerful VS Code extension designed to streamline your coding workflow by enforcing custom code styles in your project. With BlackT Code Style, you can easily apply a predefined set of coding standards, ensuring consistent and clean code across your development environment.

## Features

- **Apply `Style50` Coding Standards**: Automatically format your code by replacing spaces with four spaces, following the `Style50` formatting guidelines.
- **Reset Code Styles to Default**: Quickly revert the applied style and restore your code to its original form.

## How to Use

### 1. Open the Command Palette
- Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac) to open the Command Palette in VS Code.

### 2. Run the `Apply Style50` Command
- Type and select the `Apply Style50` command from the palette. This will format your code according to the Style50 rules (replacing multiple spaces with four spaces).
  
### 3. Reset Code Style
- You can also reset the code style by running the `Reset Style` command, which will return the code to its default state (for example, trimming excess whitespace).

### Webview Interface
- Once you run the `Apply Style50` command, a GUI interface will open, allowing you to interact with the extension visually. You can easily switch between applying the `Style50` code style and resetting the style with one click.

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

