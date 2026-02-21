import * as remote from '@electron/remote';
import * as path from 'path';
import * as fs from 'fs';
import { ProtoInfo } from "./protoInfo";
import { EditorState } from "../components/Editor";


export async function exportResponseToJSONFile(protoInfo: ProtoInfo, editorState: EditorState) {
    const openDialogResult = await remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
      properties: ['openDirectory'],
      filters: []
    });

    const filePaths = openDialogResult.filePaths;

    if (!filePaths) {
      throw new Error("No folder selected");
    }

    const timestamp = new Date().getTime();
    const basePath = filePaths[0];
    const fileName = `${protoInfo.service.serviceName}.${protoInfo.methodName}_${timestamp}`;

    const exportPath = path.join(basePath, fileName);

    const responseData = editorState.response.output
        ? editorState.response.output
        : JSON.stringify(editorState.responseStreamData.map((steam) => JSON.parse(steam.output)), null, 2);


    fs.writeFileSync(exportPath, responseData);

    return exportPath;
}