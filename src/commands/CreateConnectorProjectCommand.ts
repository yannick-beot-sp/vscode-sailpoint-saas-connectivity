import * as vscode from "vscode";
import * as fs from 'fs/promises'; // Use fs.promises for async/await
import * as path from 'path';
import { constants as fsConstants } from 'fs'; // For fs.access constants
import { isEmpty } from "../utils/stringUtils";


async function askName(prompt: string, title: string): Promise<string | undefined> {
  const result = await vscode.window.showInputBox({
    ignoreFocusOut: true,
    placeHolder: 'Project Name',
    prompt,
    title,
    validateInput: text => {
      if (isEmpty(text) || isEmpty(text.trim())) {
        return "Name must not be empty";
      }
      // Provided by VSCode for validation of package's name
      const regex = /^(?:(?:@(?:[a-z0-9-*~][a-z0-9-*._~]*)?[a-z0-9-._~])|[a-z0-9-~])[a-z0-9-._~]*$/;
      if (!regex.test(text)) {
        return "Invalid characters"
      }
    }
  });
  return result;
}

async function copyAndTransformFilesPlainNode(
  sourceFolder: string,
  targetFolder: string,
  projectName: string
): Promise<void> {
  try {
    // 1. Ensure the target folder exists, create it if not.
    //    fs.mkdir with recursive: true acts like ensureDir.
    await fs.mkdir(targetFolder, { recursive: true });

    // 2. Read all items from the source folder.
    const items = await fs.readdir(sourceFolder);

    for (const item of items) {
      const sourcePath = path.join(sourceFolder, item);
      const targetPath = path.join(targetFolder, item);
      const stat = await fs.stat(sourcePath);

      if (stat.isDirectory()) {
        // 3. If it's a directory, recursively call the function.
        //    The target path for the new directory will also be created by fs.mkdir above
        //    when the recursive call reaches it.
        await copyAndTransformFilesPlainNode(sourcePath, targetPath, projectName);
      } else if (stat.isFile()) {
        // 4. If it's a file, read its content.
        let content = await fs.readFile(sourcePath, 'utf8');

        // 5. Replace the placeholder string.
        const placeholder = /\{\{\$\.ProjectName\}\}/g; // Use a regex for global replacement
        content = content.replace(placeholder, projectName);

        // 6. Write the modified content to the target file.
        await fs.writeFile(targetPath, content, 'utf8');
        console.log(`Copied and transformed: ${targetPath}`);
      }
    }
    // It's generally better to log success at the top level call,
    // but a per-folder log can be useful too.
    // console.log(`Successfully processed contents from ${sourceFolder} to ${targetFolder}`);
  } catch (error) {
    console.error(
      `Error processing from ${sourceFolder} to ${targetFolder}:`,
      error
    );
    throw error; // Re-throw the error
  }
}

async function checkFolderExists(folderPath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(folderPath);
    return stats.isDirectory();
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return false; // Folder does not exist
    } else {
      console.error('An unexpected error occurred:', error);
      throw error; // Re-throw other errors
    }
  }
}

class CreateProjectCommand {

  private projectNamePrompt: string
  private projectNameTitle: string
  private sourceUri: vscode.Uri

  constructor(options: {
    projectNamePrompt: string;
    projectNameTitle: string;
    sourceUri: vscode.Uri;
  }) {
    this.projectNamePrompt = options.projectNamePrompt
    this.projectNameTitle = options.projectNameTitle
    this.sourceUri = options.sourceUri
  }

  public async execute() {

    const projectName = await askName(
      this.projectNamePrompt,
      this.projectNameTitle
    )
    if (projectName === undefined) {
      return
    }

    const uris = await vscode.window.showOpenDialog({
      canSelectFiles: false,
      canSelectFolders: true,
      canSelectMany: false,
      title: "Choose a folder to create the project",
      openLabel: "Select as Project Destination",
    })
    if (uris === undefined) {
      return
    }
    const targetUri = vscode.Uri.joinPath(uris[0], projectName)

    if (await checkFolderExists(targetUri.fsPath)) {
      vscode.window.showWarningMessage(`Folder ${targetUri.fsPath} already exists`)
      return
    }

    try {
      await copyAndTransformFilesPlainNode(
        this.sourceUri.fsPath,
        targetUri.fsPath,
        projectName
      );
      vscode.window.showInformationMessage(`Project successfully created in ${targetUri.fsPath}`)
    } catch (error) {
      vscode.window.showErrorMessage(`Could not create projectin ${targetUri.fsPath}: ${error}`)
    }
    const PROJECT_OPTIONS = {
      OPEN: "Open",
      OPEN_NEW_WINDOW: "Open in New Window",
      CANCEL: "Cancel"
    }

    const openIn = await vscode.window.showInformationMessage(
      `Would you like to open the project?`,
      { modal: true },
      ...Object.values(PROJECT_OPTIONS)
    );

    if (openIn === PROJECT_OPTIONS.OPEN) {
      vscode.commands.executeCommand("vscode.openFolder", targetUri, {
        forceReuseWindow: true,
      })
    } else if (openIn === PROJECT_OPTIONS.OPEN_NEW_WINDOW) {
      vscode.commands.executeCommand("vscode.openFolder", targetUri, {
        forceNewWindow: true,
      })
    }
  }
}


export class CreateConnectorProjectCommand extends CreateProjectCommand {


  constructor(extensionUri: vscode.Uri) {
    super({
      projectNamePrompt: "Enter a name for the connector project",
      projectNameTitle: "Create Connector Project",
      sourceUri: vscode.Uri.joinPath(extensionUri, 'submodules', 'sailpoint-cli', 'cmd', 'connector', 'static', 'connector')
    });

  }
}

export class CreateCustomizerProjectCommand extends CreateProjectCommand {


  constructor(extensionUri: vscode.Uri) {
    super({
      projectNamePrompt: "Enter a name for the customizer project",
      projectNameTitle: "Create Customizer Project",
      sourceUri: vscode.Uri.joinPath(extensionUri, 'submodules', 'sailpoint-cli', 'cmd', 'connector', 'static', 'customizer')
    });

  }
}

