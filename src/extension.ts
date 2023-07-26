'use strict';

import * as vscode from 'vscode';
import * as emv from "@codianz/emv-tools";
import * as fs from "fs";

class RapduDCP implements vscode.TextDocumentContentProvider {
	onDidChange?: vscode.Event<vscode.Uri> | undefined;
	async provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken): Promise<string | undefined> {
		let str = "";
		try{
			const rapdu = emv.rapdu.create_from_data_chunk(emv.data_chunk.create_from_hex_string(uri.query));
			str += `status word: ${rapdu.status_word.to_hex_string()}\n${rapdu.get_tlv().to_string()}`;
		}
		catch(err: unknown){
			if(err instanceof Error){
				await vscode.window.showErrorMessage(err.toString());
			}
			else{
				await vscode.window.showErrorMessage(`unknown error: ${err}`);
			}
		}
		return str.length > 0 ? str : undefined;
	}
}

class TlvuDCP implements vscode.TextDocumentContentProvider {
	onDidChange?: vscode.Event<vscode.Uri> | undefined;
	async provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken): Promise<string | undefined> {
		let str = "";
		try{
			let dchunk = emv.data_chunk.create_from_hex_string(uri.query);
			while(true){
				const tlv = emv.tlv.create_from_data_chunk(dchunk);
				if(!tlv.valid) {
					str += `wrong bytes: ${dchunk.to_hex_string()}\n`;
					break;
				}
				str += `${tlv.to_string()}\n`;
				dchunk = dchunk.get_range(tlv.size);
			}
		}
		catch(err: unknown){
			if(err instanceof Error){
				await vscode.window.showErrorMessage(err.toString());
			}
			else{
				await vscode.window.showErrorMessage(`unknown error: ${err}`);
			}
		}
		return str.length > 0 ? str : undefined;
	}
}

async function setupEmvTags() {
	emv.EmvTags.Instance.restoreDefault();
	vscode.workspace.workspaceFolders?.forEach(async dir => {
		const furi = vscode.Uri.joinPath(dir.uri, ".emv-tags.json");
		try {
			const fpath = furi.fsPath;
			await fs.promises.access(fpath, fs.constants.F_OK);
			const jstr = await fs.promises.readFile(fpath, { encoding: "utf-8" });
			const jobj = JSON.parse(jstr);
			emv.EmvTags.Instance.addPrivateTags(jobj);
			console.log(`load private tags from ${fpath}`);
		} catch (err) {
			return;
		}
	});
}

function setupAnalyzeRAPDU(context: vscode.ExtensionContext) {
	const SCHEME = "emv-tools-analyze-rapdu";
	let counter = 1;

	context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(SCHEME, new RapduDCP()));

	const disposable = vscode.commands.registerCommand('emv-tools.analyze_rapdu', async function() {
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

function setupAnalyzeTLV(context: vscode.ExtensionContext) {
	const SCHEME = "emv-tools-analyze-tlv";
	let counter = 1;

	context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(SCHEME, new TlvuDCP()));

	const disposable = vscode.commands.registerCommand('emv-tools.analyze_tlv', async function() {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const document = editor.document;
			const selection = editor.selection;

			// Get the word within the selection
			const word = document.getText(selection);
			const uri = vscode.Uri.parse(`${SCHEME}:tlv-${counter}?${word}`);
			counter++;
			const doc = await vscode.workspace.openTextDocument(uri);
			await vscode.window.showTextDocument(doc, { preview: false });
		}
	});

	context.subscriptions.push(disposable);
}

export async function activate(context: vscode.ExtensionContext) {
	await setupEmvTags();
	setupAnalyzeRAPDU(context);
	setupAnalyzeTLV(context);
}
