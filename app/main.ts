import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { initialize, enable } from '@electron/remote/main';
import ElectronStore from 'electron-store';
import MenuBuilder from './menu';

initialize();
ElectronStore.initRenderer();

let mainWindow: BrowserWindow | null = null;

import electronDebug from 'electron-debug';

if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
  electronDebug();
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', async () => {
  mainWindow = new BrowserWindow({
    show: false,
    width: 1324,
    height: 728,
    backgroundColor: '#f0f2f5',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, '../preload/preload.js'),
    },
  });

  enable(mainWindow.webContents);

  if (process.env.NODE_ENV === 'development' && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + '/app.html');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/app.html'));
  }

  mainWindow.once('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }

    setTimeout(function () {
      mainWindow!.show();
      mainWindow!.focus();
    }, 150);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();
});
