import { app, Menu, shell, BrowserWindow, MenuItemConstructorOptions } from 'electron';
import openAboutWindow from './about/open-about-window';

export default class MenuBuilder {
  mainWindow: BrowserWindow;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
  }

  buildMenu() {
    if (
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
    ) {
      this.setupDevelopmentEnvironment();
    }

    const template =
      process.platform === 'darwin'
        ? this.buildDarwinTemplate()
        : this.buildDefaultTemplate();

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    return menu;
  }

  setupDevelopmentEnvironment() {
    this.mainWindow.webContents.openDevTools();
    this.mainWindow.webContents.on('context-menu', (_e, props) => {
      const { x, y } = props;

      Menu.buildFromTemplate([
        {
          label: 'Inspect element',
          click: () => {
            this.mainWindow.webContents.inspectElement(x, y);
          },
        },
      ]).popup({ window: this.mainWindow });
    });
  }

  buildDarwinTemplate(): MenuItemConstructorOptions[] {
    const subMenuAbout: MenuItemConstructorOptions = {
      label: 'BloomRPC Extended',
      submenu: [
        {
          label: 'About BloomRPC Extended',
          role: 'about',
        },
        { type: 'separator' },
        { label: 'Services', submenu: [] },
        { type: 'separator' },
        {
          label: 'Hide BloomRPC Extended',
          accelerator: 'Command+H',
          role: 'hide',
        },
        {
          label: 'Hide Others',
          accelerator: 'Command+Shift+H',
          role: 'hideOthers',
        },
        { label: 'Show All', role: 'unhide' },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    };
    const subMenuEdit: MenuItemConstructorOptions = {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'Command+Z', role: 'undo' },
        { label: 'Redo', accelerator: 'Shift+Command+Z', role: 'redo' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'Command+X', role: 'cut' },
        { label: 'Copy', accelerator: 'Command+C', role: 'copy' },
        { label: 'Paste', accelerator: 'Command+V', role: 'paste' },
        {
          label: 'Select All',
          accelerator: 'Command+A',
          role: 'selectAll',
        },
        {
          label: 'Clear Storage',
          accelerator: 'Ctrl+Command+D',
          click() {
            require('./storage').clearAll();
          },
        },
      ],
    };
    const subMenuViewDev: MenuItemConstructorOptions = {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'Command+R',
          click: () => {
            this.mainWindow.webContents.reload();
          },
        },
        {
          label: 'Toggle Full Screen',
          accelerator: 'Ctrl+Command+F',
          click: () => {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
          },
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'Alt+Command+I',
          click: () => {
            this.mainWindow.webContents.toggleDevTools();
          },
        },
      ],
    };
    const subMenuViewProd: MenuItemConstructorOptions = {
      label: 'View',
      submenu: [
        {
          label: 'Toggle Full Screen',
          accelerator: 'Ctrl+Command+F',
          click: () => {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
          },
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'Alt+Command+I',
          click: () => {
            this.mainWindow.webContents.toggleDevTools();
          },
        },
      ],
    };
    const subMenuWindow: MenuItemConstructorOptions = {
      label: 'Window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'Command+M',
          role: 'minimize',
        },
        { label: 'Close', accelerator: 'Command+W', role: 'close' },
        { type: 'separator' },
        { label: 'Bring All to Front', role: 'front' },
      ],
    };
    const subMenuHelp: MenuItemConstructorOptions = {
      label: 'Help',
      submenu: [
        {
          label: 'Learn More',
          click() {
            shell.openExternal('https://github.com/ahmethakanbesel/bloomrpc-extended');
          },
        },
        {
          label: 'Documentation',
          click() {
            shell.openExternal(
              'https://github.com/ahmethakanbesel/bloomrpc-extended/blob/master/README.md'
            );
          },
        },
        {
          label: 'Community Discussions',
          click() {
            shell.openExternal('https://github.com/ahmethakanbesel/bloomrpc-extended/issues');
          },
        },
        {
          label: 'Search Issues',
          click() {
            shell.openExternal('https://github.com/ahmethakanbesel/bloomrpc-extended/issues');
          },
        },
      ],
    };

    const subMenuView =
      process.env.NODE_ENV === 'development' ? subMenuViewDev : subMenuViewProd;

    return [subMenuAbout, subMenuEdit, subMenuView, subMenuWindow, subMenuHelp];
  }

  buildDefaultTemplate(): MenuItemConstructorOptions[] {
    const templateDefault: MenuItemConstructorOptions[] = [
      {
        label: '&File',
        submenu: [
          {
            label: '&Open',
            accelerator: 'Ctrl+O',
          },
          {
            label: '&Quit',
            accelerator: 'Ctrl+Q',
            click: app.quit,
          },
        ],
      },
      {
        label: '&View',
        submenu:
          process.env.NODE_ENV === 'development'
            ? [
                {
                  label: '&Reload',
                  accelerator: 'Ctrl+R',
                  click: () => {
                    this.mainWindow.webContents.reload();
                  },
                },
                {
                  label: 'Toggle &Full Screen',
                  accelerator: 'F11',
                  click: () => {
                    this.mainWindow.setFullScreen(
                      !this.mainWindow.isFullScreen()
                    );
                  },
                },
                {
                  label: 'Toggle &Developer Tools',
                  accelerator: 'Alt+Ctrl+I',
                  click: () => {
                    this.mainWindow.webContents.toggleDevTools();
                  },
                },
              ]
            : [
                {
                  label: 'Toggle &Full Screen',
                  accelerator: 'F11',
                  click: () => {
                    this.mainWindow.setFullScreen(
                      !this.mainWindow.isFullScreen()
                    );
                  },
                },
                {
                  label: 'Toggle &Developer Tools',
                  accelerator: 'Alt+Ctrl+I',
                  click: () => {
                    this.mainWindow.webContents.toggleDevTools();
                  },
                },
              ],
      },
      {
        label: 'Help',
        submenu: [
          {
            label: 'Learn More',
            click() {
              shell.openExternal('https://github.com/ahmethakanbesel/bloomrpc-extended');
            },
          },
          {
            label: 'Documentation',
            click() {
              shell.openExternal(
                'https://github.com/ahmethakanbesel/bloomrpc-extended/blob/master/README.md'
              );
            },
          },
          {
            label: 'Community Discussions',
            click() {
              shell.openExternal('https://github.com/ahmethakanbesel/bloomrpc-extended/issues');
            },
          },
          {
            label: 'Search Issues',
            click() {
              shell.openExternal('https://github.com/ahmethakanbesel/bloomrpc-extended/issues');
            },
          },
          {
            label: 'About BloomRPC Extended',
            click: () => {
              openAboutWindow(this.mainWindow);
            },
          },
        ],
      },
    ];

    return templateDefault;
  }
}
