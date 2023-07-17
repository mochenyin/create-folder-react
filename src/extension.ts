import * as vscode from 'vscode';

const formatCompName = (floderName: string): string => {
    const specialCharsRegex = /[!@#$%^&*(),.?":{}|<>]/g;
    const newName = floderName.replace(specialCharsRegex, "-");
	const words = newName.split('-');
	const camelCase = words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
  return camelCase;
};

const formatCssName = (floderName: string): string => {
	const specialCharsRegex = /[!@#$%^&*(),.?":{}|<>]/g;
    const newName = floderName.replace(specialCharsRegex, "-");
	return newName;
  };

const createIndexStr = (floderName: string) => {
	let str = "";
	if (floderName) {
		const cName = formatCompName(floderName);
		str += `import React, {FC} from "react";\n`;
		str += `import type * as TSData from "./interface";\n`;
		str += `import "./index.less";\n\n`;
		str += `const ${cName}: FC<TSData.Props> = (props) => {\n`;
		str += `    const {} = props;\n`;
		str += `    return (\n`;
		str += `        <div className="${formatCssName(floderName)}"></div>\n`;
		str += `    );\n`;
		str += `};\n\n`;
		str += `export default ${cName};\n`;
	}
	return str;
};

const createLessStr = (floderName: string) => {
	let str = "";
	if (floderName) {
		str += `.${formatCssName(floderName)} {\n\n}`;
	}
	return str;
};

const createInterfaceStr = () => {
	return "export interface Props {\n\n}\n";
};

let isFromSelf = false;
export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('create-folder-react-mcy.create', (url) => {
		async function createFolder() {
			await vscode.commands.executeCommand('explorer.newFolder');
			isFromSelf = true;
		}
		createFolder();
	});
	const disposable2 = vscode.workspace.onDidCreateFiles(async (event) => {
		const path = event.files[0]?.path;
		if (!isFromSelf) {
			return;
		}
		if (path) {
		    isFromSelf = false;
			const pathArray = path.split("/");
			let floderName = pathArray[pathArray.length - 1];
			if (!Number.isNaN(Number(floderName))) {
				floderName = "test";
			}
			// @ts-ignore
			const encoder = new TextEncoder();
			// 写入index.tsx
            const indexStr = createIndexStr(floderName);
            const indexUint8Array = encoder.encode(indexStr);
			await vscode.workspace.fs.writeFile(vscode.Uri.parse(`${path}/index.tsx`), indexUint8Array);
			// 写入index.less
            const indexLessStr = createLessStr(floderName);
            const indexLessUint8Array = encoder.encode(indexLessStr);
			await vscode.workspace.fs.writeFile(vscode.Uri.parse(`${path}/index.less`), indexLessUint8Array);
			// 写入interface.ts
            const interfaceStr = createInterfaceStr();
            const interfaceUint8Array = encoder.encode(interfaceStr);
			await vscode.workspace.fs.writeFile(vscode.Uri.parse(`${path}/interface.ts`), interfaceUint8Array);
		}
	  });
	context.subscriptions.push(disposable);
	context.subscriptions.push(disposable2);
}

export function deactivate() {}
