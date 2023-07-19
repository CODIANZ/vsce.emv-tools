'use strict';

import * as vscode from 'vscode';
import * as emv from "@codianz/emv-tools";

class RapduDCP implements vscode.TextDocumentContentProvider {
	onDidChange?: vscode.Event<vscode.Uri> | undefined;
	provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken): vscode.ProviderResult<string> {
		const rapdu = emv.rapdu.create_from_data_chunk(emv.data_chunk.create_from_hex_string(uri.query));
		return rapdu.get_tlv().to_string();
	}
}

export function activate(context: vscode.ExtensionContext) {
	const SCHEME = "emv-tools";
	let counter = 1;

	context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(SCHEME, new RapduDCP()));

	const disposable = vscode.commands.registerCommand('emv-tools.analyze_rapdu', async function() {
		// Get the active text editor
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const document = editor.document;
			const selection = editor.selection;

			// Get the word within the selection
			const word = document.getText(selection);
			const uri = vscode.Uri.parse(`${SCHEME}:rapdu-${counter}?${word}`);
			counter++;
			const doc = await vscode.workspace.openTextDocument(uri);
			await vscode.window.showTextDocument(doc, { preview: false });
		}
	});

	context.subscriptions.push(disposable);
}
