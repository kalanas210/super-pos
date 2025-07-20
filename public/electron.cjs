const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const isDev = !app.isPackaged;
const db = require('./database.cjs');

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

// --- PRODUCTS CRUD IPC HANDLERS ---

// Get all products
ipcMain.handle('get-products', async () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM products', (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
});

// Add a new product
ipcMain.handle('add-product', async (event, product) => {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(`INSERT INTO products (id, name, price, barcode, category_id, stock_quantity, min_stock_level, supplier_id, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    stmt.run([
      product.id,
      product.name,
      product.price,
      product.barcode,
      product.category_id,
      product.stock_quantity,
      product.min_stock_level,
      product.supplier_id,
      product.image
    ], function (err) {
      if (err) reject(err);
      else resolve({ success: true, id: product.id });
    });
    stmt.finalize();
  });
});

// Update a product
ipcMain.handle('update-product', async (event, product) => {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(`UPDATE products SET name=?, price=?, barcode=?, category_id=?, stock_quantity=?, min_stock_level=?, supplier_id=?, image=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`);
    stmt.run([
      product.name,
      product.price,
      product.barcode,
      product.category_id,
      product.stock_quantity,
      product.min_stock_level,
      product.supplier_id,
      product.image,
      product.id
    ], function (err) {
      if (err) reject(err);
      else resolve({ success: true });
    });
    stmt.finalize();
  });
});

// Delete a product
ipcMain.handle('delete-product', async (event, id) => {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM products WHERE id = ?', [id], function (err) {
      if (err) reject(err);
      else resolve({ success: true });
    });
  });
});

// --- STOCK MOVEMENTS CRUD IPC HANDLERS ---

// Get all stock movements, or by product_id if provided
ipcMain.handle('get-stock-movements', async (event, productId) => {
  return new Promise((resolve, reject) => {
    let query = 'SELECT * FROM stock_movements';
    let params = [];
    if (productId) {
      query += ' WHERE product_id = ?';
      params.push(productId);
    }
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
});

// Add a new stock movement
ipcMain.handle('add-stock-movement', async (event, movement) => {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(`INSERT INTO stock_movements (id, product_id, type, quantity, reason, date) VALUES (?, ?, ?, ?, ?, ?)`);
    stmt.run([
      movement.id,
      movement.product_id,
      movement.type,
      movement.quantity,
      movement.reason,
      movement.date || new Date().toISOString(),
    ], function (err) {
      if (err) reject(err);
      else resolve({ success: true, id: movement.id });
    });
    stmt.finalize();
  });
});

// Optionally: Delete a stock movement by id
ipcMain.handle('delete-stock-movement', async (event, id) => {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM stock_movements WHERE id = ?', [id], function (err) {
      if (err) reject(err);
      else resolve({ success: true });
    });
  });
});

// --- CATEGORIES CRUD IPC HANDLERS ---

// Get all categories
ipcMain.handle('get-categories', async () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM categories', (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
});

// Add a new category
ipcMain.handle('add-category', async (event, category) => {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(`INSERT INTO categories (id, name, description) VALUES (?, ?, ?)`);
    stmt.run([
      category.id,
      category.name,
      category.description || '',
    ], function (err) {
      if (err) reject(err);
      else resolve({ success: true, id: category.id });
    });
    stmt.finalize();
  });
});

// Update a category
ipcMain.handle('update-category', async (event, category) => {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE categories SET name = ?, description = ? WHERE id = ?`,
      [category.name, category.description || '', category.id],
      function (err) {
        if (err) reject(err);
        else resolve({ success: true });
      }
    );
  });
});

// Delete a category by id
ipcMain.handle('delete-category', async (event, id) => {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM categories WHERE id = ?', [id], function (err) {
      if (err) reject(err);
      else resolve({ success: true });
    });
  });
});

// --- USERS CRUD IPC HANDLERS ---

// Get all users
ipcMain.handle('get-users', async () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM users', (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
});

// Add a new user
ipcMain.handle('add-user', async (event, user) => {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(`INSERT INTO users (id, name, email, role, password, status, lastActive) VALUES (?, ?, ?, ?, ?, ?, ?)`);
    stmt.run([
      user.id,
      user.name,
      user.email,
      user.role,
      user.password || '',
      user.status || 'active',
      user.lastActive || new Date().toISOString(),
    ], function (err) {
      if (err) reject(err);
      else resolve({ success: true, id: user.id });
    });
    stmt.finalize();
  });
});

// Update a user
ipcMain.handle('update-user', async (event, user) => {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE users SET name = ?, email = ?, role = ?, password = ?, status = ?, lastActive = ? WHERE id = ?`,
      [user.name, user.email, user.role, user.password || '', user.status || 'active', user.lastActive || new Date().toISOString(), user.id],
      function (err) {
        if (err) reject(err);
        else resolve({ success: true });
      }
    );
  });
});

// Delete a user by id
ipcMain.handle('delete-user', async (event, id) => {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM users WHERE id = ?', [id], function (err) {
      if (err) reject(err);
      else resolve({ success: true });
    });
  });
});

// --- INVOICES CRUD IPC HANDLERS ---

// Get all invoices
ipcMain.handle('get-invoices', async () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM invoices', (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
});

// Add a new invoice
ipcMain.handle('add-invoice', async (event, invoice) => {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(`INSERT INTO invoices (id, date, customer_id, total, status, notes) VALUES (?, ?, ?, ?, ?, ?)`);
    stmt.run([
      invoice.id,
      invoice.date || new Date().toISOString(),
      invoice.customer_id || null,
      invoice.total,
      invoice.status || 'paid',
      invoice.notes || '',
    ], function (err) {
      if (err) reject(err);
      else resolve({ success: true, id: invoice.id });
    });
    stmt.finalize();
  });
});

// Update an invoice
ipcMain.handle('update-invoice', async (event, invoice) => {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE invoices SET date = ?, customer_id = ?, total = ?, status = ?, notes = ? WHERE id = ?`,
      [invoice.date, invoice.customer_id, invoice.total, invoice.status, invoice.notes, invoice.id],
      function (err) {
        if (err) reject(err);
        else resolve({ success: true });
      }
    );
  });
});

// Delete an invoice by id
ipcMain.handle('delete-invoice', async (event, id) => {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM invoices WHERE id = ?', [id], function (err) {
      if (err) reject(err);
      else resolve({ success: true });
    });
  });
});

// --- REPORTS/ANALYTICS IPC HANDLERS ---

// Get sales summary for a date range
ipcMain.handle('get-sales-summary', async (event, { startDate, endDate }) => {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT 
        COUNT(*) as count, 
        SUM(total) as total, 
        SUM(items) as items, 
        AVG(total) as averageOrder
      FROM sales
      WHERE date BETWEEN ? AND ?`,
      [startDate, endDate],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });
});

// Get sales by day for a date range
ipcMain.handle('get-sales-by-day', async (event, { startDate, endDate }) => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT date(date) as date, SUM(total) as amount, SUM(items) as items
       FROM sales
       WHERE date BETWEEN ? AND ?
       GROUP BY date(date)
       ORDER BY date(date) ASC`,
      [startDate, endDate],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
});

// Get sales by category for a date range
ipcMain.handle('get-sales-by-category', async (event, { startDate, endDate }) => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT p.category, SUM(si.quantity * si.price) as amount, COUNT(DISTINCT s.id) as transactions
       FROM sale_items si
       JOIN products p ON si.product_id = p.id
       JOIN sales s ON si.sale_id = s.id
       WHERE s.date BETWEEN ? AND ?
       GROUP BY p.category
       ORDER BY amount DESC`,
      [startDate, endDate],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
});

// Get top products for a date range
ipcMain.handle('get-top-products', async (event, { startDate, endDate, limit = 5 }) => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT p.id, p.name, p.category, SUM(si.quantity) as quantity, SUM(si.quantity * si.price) as sales
       FROM sale_items si
       JOIN products p ON si.product_id = p.id
       JOIN sales s ON si.sale_id = s.id
       WHERE s.date BETWEEN ? AND ?
       GROUP BY p.id, p.name, p.category
       ORDER BY sales DESC
       LIMIT ?`,
      [startDate, endDate, limit],
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      }
    );
  });
});