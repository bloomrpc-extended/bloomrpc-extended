import * as remote from '@electron/remote';
import * as path from "path";

export interface CertFile {
    fileName: string;
    filePath: string;
}

export interface Certificate {
    rootCert: CertFile;
    privateKey?: CertFile;
    certChain?: CertFile;
    sslTargetHost?: string;
    useServerCertificate?: boolean;
}

export async function importRootCert(): Promise<Certificate> {
        const openDialogResult = await remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
            properties: ['openFile'],
            filters: [
                { name: 'All', extensions: ['*'] },
            ]
        });

        const filePaths = openDialogResult.filePaths;

        if (!filePaths || filePaths.length === 0) {
            throw new Error("No file selected");
        }

        const filePath = filePaths[0];

        return {
            rootCert: {
                fileName: path.basename(filePath),
                filePath: filePath,
            },
        };
}

export async function importPrivateKey(): Promise<CertFile> {
        const openDialogResult = await remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
            properties: ['openFile'],
            filters: [
                { name: 'All', extensions: ['*'] },
            ]
        });

        const filePaths = openDialogResult.filePaths;
        if (!filePaths || filePaths.length === 0) {
            throw new Error("No file selected");
        }
        return {
            filePath: filePaths[0],
            fileName: path.basename(filePaths[0]),
        };
}

export async function importCertChain(): Promise<CertFile> {
        const openDialogResult = await remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
            properties: ['openFile'],
            filters: [
                { name: 'All', extensions: ['*'] },
            ]
        });

        const filePaths = openDialogResult.filePaths;

        if (!filePaths || filePaths.length === 0) {
            throw new Error("No file selected");
        }
        return {
            filePath: filePaths[0],
            fileName: path.basename(filePaths[0]),
        };
}