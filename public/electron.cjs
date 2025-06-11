const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const isDev = !app.isPackaged;

let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.cjs')
    },
    icon: path.join(__dirname, 'icon.png'),
    titleBarStyle: 'default',
    show: false
  });

  // Load the app
  const startUrl = isDev 
    ? 'http://localhost:5173' 
    : `file://${path.join(__dirname, '../dist/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Open DevTools in development
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Create application menu
  createMenu();
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Sale',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            mainWindow.webContents.send('navigate-to', '/sales');
          }
        },
        {
          label: 'Print Receipt',
          accelerator: 'CmdOrCtrl+P',
          click: () => {
            mainWindow.webContents.send('print-receipt');
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Dashboard',
          accelerator: 'CmdOrCtrl+D',
          click: () => {
            mainWindow.webContents.send('navigate-to', '/dashboard');
          }
        },
        {
          label: 'Products',
          accelerator: 'CmdOrCtrl+Shift+P',
          click: () => {
            mainWindow.webContents.send('navigate-to', '/products');
          }
        },
        {
          label: 'Inventory',
          accelerator: 'CmdOrCtrl+I',
          click: () => {
            mainWindow.webContents.send('navigate-to', '/inventory');
          }
        },
        {
          label: 'Reports',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.webContents.send('navigate-to', '/reports');
          }
        }
      ]
    },
    {
      label: 'Tools',
      submenu: [
        {
          label: 'Backup Data',
          click: async () => {
            const result = await dialog.showSaveDialog(mainWindow, {
              title: 'Save Backup',
              defaultPath: `superpos-backup-${new Date().toISOString().split('T')[0]}.json`,
              filters: [
                { name: 'JSON Files', extensions: ['json'] }
              ]
            });
            
            if (!result.canceled) {
              mainWindow.webContents.send('backup-data', result.filePath);
            }
          }
        },
        {
          label: 'Restore Data',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              title: 'Select Backup File',
              filters: [
                { name: 'JSON Files', extensions: ['json'] }
              ],
              properties: ['openFile']
            });
            
            if (!result.canceled) {
              mainWindow.webContents.send('restore-data', result.filePaths[0]);
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Settings',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            mainWindow.webContents.send('navigate-to', '/settings');
          }
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About SuperPOS',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About SuperPOS',
              message: 'SuperPOS Desktop v1.0.0',
              detail: 'Professional Point of Sale System for Sri Lankan Supermarkets\n\nBuilt with Electron and React'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// App event listeners
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('show-save-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, options);
  return result;
});

ipcMain.handle('show-open-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, options);
  return result;
});