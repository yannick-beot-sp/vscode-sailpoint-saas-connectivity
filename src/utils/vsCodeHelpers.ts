import * as vscode from "vscode";

export async function confirm(prompt: string): Promise<boolean> {
	const answer = await vscode.window.showWarningMessage(
		prompt,
		{ modal: true },
		...["Yes", "No"]
	);
	const value = (answer === "Yes")

	console.log(`< confirm: ${value}`);
	return value;
}

export async function chooseFileExtended(options: vscode.OpenDialogOptions): Promise<undefined | vscode.Uri | vscode.Uri[]> {
	const fileUri = await vscode.window.showOpenDialog(options);

	if (fileUri === undefined || fileUri.length === 0) { return undefined }
	if (options.canSelectMany) {
		return fileUri
	} else {
		return fileUri[0];
	}

}