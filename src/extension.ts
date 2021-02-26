'use strict';

import { readFileSync, writeFile } from 'fs';
import { join } from 'path';
import * as vscode from 'vscode';
import { MemFS } from './fileSystemProvider';

export let extensionPath: string;

export function activate(context: vscode.ExtensionContext) {
    extensionPath = context.extensionPath;

    console.log('MemFS says "Hello"');

    const memFs = new MemFS();
    context.subscriptions.push(vscode.workspace.registerFileSystemProvider('memfs', memFs, { isCaseSensitive: true }));
    let initialized = false;

    context.subscriptions.push(vscode.commands.registerCommand('memfs.reset', _ => {
        for (const [name] of memFs.readDirectory(vscode.Uri.parse('memfs:/'))) {
            memFs.delete(vscode.Uri.parse(`memfs:/${name}`));
        }
        initialized = false;
    }));

    context.subscriptions.push(vscode.commands.registerCommand('memfs.addFile', _ => {
        if (initialized) {
            memFs.writeFile(vscode.Uri.parse(`memfs:/file.txt`), Buffer.from('foo'), { create: true, overwrite: true });
        }
    }));

    context.subscriptions.push(vscode.commands.registerCommand('memfs.deleteFile', _ => {
        if (initialized) {
            memFs.delete(vscode.Uri.parse('memfs:/file.txt'));
        }
    }));

    context.subscriptions.push(vscode.commands.registerCommand('memfs.init', _ => {
        if (initialized) {
            return;
        }
        initialized = true;

        const localImagePath = join(extensionPath, 'resources', 'localImage.png');
        const localImageData = readFileSync(localImagePath);
        memFs.writeFile(vscode.Uri.parse(`memfs:/localImage.png`), localImageData, { create: true, overwrite: true });
        memFs.writeFile(vscode.Uri.parse(`memfs:/remoteImage.png`), new Uint8Array(0), { create: true, overwrite: true });
    }));

    context.subscriptions.push(vscode.commands.registerCommand('memfs.workspaceInit', _ => {
        vscode.workspace.updateWorkspaceFolders(0, 0, { uri: vscode.Uri.parse('memfs:/'), name: "MemFS - Sample" });
    }));
}
