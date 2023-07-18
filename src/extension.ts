'use strict';

import * as vscode from 'vscode';
import * as emv from "@codianz/emv-tools";

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand('emv-tools.analyze_rapdu', function() {
		// Get the active text editor
		const editor = vscode.window.activeTextEditor;

		if (editor) {
			const document = editor.document;
			const selection = editor.selection;

			// Get the word within the selection
			const word = document.getText(selection);
			const x = emv.rapdu.create_from_data_chunk(emv.data_chunk.create_from_hex_string(word));
			editor.edit(editBuilder => {
				const rep = `${word}\n${x.get_tlv().to_string()}`;
				editBuilder.replace(selection, rep);
			});
		}
	});

	context.subscriptions.push(disposable);
}


// // The module 'vscode' contains the VS Code extensibility API
// // Import the module and reference it with the alias vscode in your code below
// import * as vscode from 'vscode';

// // This method is called when your extension is activated
// // Your extension is activated the very first time the command is executed
// export function activate(context: vscode.ExtensionContext) {

// 	// Use the console to output diagnostic information (console.log) and errors (console.error)
// 	// This line of code will only be executed once when your extension is activated
// 	console.log('Congratulations, your extension "emv-tools" is now active!');

// 	// The command has been defined in the package.json file
// 	// Now provide the implementation of the command with registerCommand
// 	// The commandId parameter must match the command field in package.json
// 	let disposable = vscode.commands.registerCommand('emv-tools.helloWorld', () => {
// 		// The code you place here will be executed every time your command is executed
// 		// Display a message box to the user
// 		vscode.window.showInformationMessage('Hello World from EMV Tools4!');
// 	});

// 	context.subscriptions.push(disposable);
// }

// // This method is called when your extension is deactivated
// export function deactivate() {}
