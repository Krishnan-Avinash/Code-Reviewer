const vscode = require("vscode");
const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");

function activate(context) {
  // Retrieve your API key from environment variables
  const API_KEY = "AIzaSyCL7ODYswGUXJpG08oMFtaI9x1epKI_TX8";

  if (!API_KEY) {
    vscode.window.showErrorMessage("API_KEY environment variable is not set.");
    return;
  }

  // Command to review code
  let disposable = vscode.commands.registerCommand(
    "temp-ext.codeReviewer",
    async function reviewCode() {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage("No editor is active");
        return;
      }

      const document = editor.document;
      const filePath = document.uri.fsPath;

      try {
        vscode.window.showInformationMessage("Working on your code...");

        // Initialize GoogleGenerativeAI with API key
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Read file content
        const fileContent = fs.readFileSync(filePath, "utf8");
        const prompt = `Review this code and add comments, and tell what changes you have made in the code itself just return the corrected code and nothing else don't return the code in back ticks return plain only:\n${fileContent}`;

        // Generate content using AI model
        const result = await model.generateContent(prompt);
        const reviewedContent = result.response;

        vscode.window.showInformationMessage(
          reviewedContent.candidates[0].content.parts[0].text
        );
        let text = reviewedContent.candidates[0].content.parts[0].text;

        // Remove opening triple backticks and any language identifier
        text = text.replace(/```[a-zA-Z]*\n?/g, "");

        // Remove closing triple backticks
        text = text.replace(/```/g, "");

        vscode.window.showInformationMessage(text);

        // console.log(reviewedContent.candidates[0].content.parts[0].text);

        // Write reviewed content back to file
        fs.writeFileSync(filePath, text);

        // Save document and revert to reflect changes
        await document.save();
        await vscode.commands.executeCommand("workbench.action.files.revert");

        vscode.window.showInformationMessage(
          "Code review completed successfully"
        );
      } catch (error) {
        vscode.window.showErrorMessage(
          "Failed to review code: " + error.message
        );
      }
    }
  );

  context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
