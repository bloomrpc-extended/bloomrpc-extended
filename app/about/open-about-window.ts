import { BrowserWindow, shell } from 'electron';
import * as path from 'path';

const icon = process.env.NODE_ENV === 'development'
  ? path.join(__dirname, '../../resources/icon.ico')
  : path.join(process.resourcesPath!, 'icon.ico');

let aboutWin: BrowserWindow | null = null;

export default function openAboutWindow(parentWindow: BrowserWindow) {
  if (aboutWin !== null) {
    aboutWin.focus();
    return aboutWin;
  }

  const options: Electron.BrowserWindowConstructorOptions = {
    width: 400,
    height: 400,
    useContentSize: true,
    titleBarStyle: 'hiddenInset',
    icon: icon,
    parent: parentWindow,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  };

  aboutWin = new BrowserWindow(options);

  aboutWin.once('closed', () => {
    aboutWin = null;
  });

  if (process.env.NODE_ENV === 'development') {
    const rendererUrl = process.env['ELECTRON_RENDERER_URL'];
    if (rendererUrl) {
      aboutWin.loadURL(`${rendererUrl}/about.html`);
    } else {
      aboutWin.loadFile(path.join(__dirname, '../renderer/about/about.html'));
    }
  } else {
    aboutWin.loadFile(path.join(__dirname, '../renderer/about/about.html'));
  }

  aboutWin.webContents.on('will-navigate', (e, url) => {
    e.preventDefault();
    shell.openExternal(url);
  });

  aboutWin.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  aboutWin.webContents.once('dom-ready', () => {
    if (!aboutWin) return;

    const info = {
      icon_path: icon,
      product_name: PRODUCT_NAME,
      copyright: COPYRIGHT,
      homepage: HOMEPAGE,
      description: DESCRIPTION,
      license: LICENSE,
      bug_report_url: BUG_REPORT_URL,
      version: VERSION,
      use_version_info: true,
    };

    aboutWin.webContents.send('about-window:info', info);
  });

  aboutWin.once('ready-to-show', () => {
    if (aboutWin) aboutWin.show();
  });

  aboutWin.setMenu(null);
  aboutWin.setMenuBarVisibility(false);

  return aboutWin;
}
