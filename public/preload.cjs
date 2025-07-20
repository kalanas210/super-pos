const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
  
  // Navigation
  onNavigateTo: (callback) => ipcRenderer.on('navigate-to', callback),
  
  // Printing
  onPrintReceipt: (callback) => ipcRenderer.on('print-receipt', callback),
  
  // Data management
  onBackupData: (callback) => ipcRenderer.on('backup-data', callback),
  onRestoreData: (callback) => ipcRenderer.on('restore-data', callback),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),

  // --- PRODUCTS CRUD ---
  getProducts: () => ipcRenderer.invoke('get-products'),
  addProduct: (product) => ipcRenderer.invoke('add-product', product),
  updateProduct: (product) => ipcRenderer.invoke('update-product', product),
  deleteProduct: (id) => ipcRenderer.invoke('delete-product', id),

  // --- STOCK MOVEMENTS CRUD ---
  getStockMovements: (productId) => ipcRenderer.invoke('get-stock-movements', productId),
  addStockMovement: (movement) => ipcRenderer.invoke('add-stock-movement', movement),
  deleteStockMovement: (id) => ipcRenderer.invoke('delete-stock-movement', id),

  // --- CATEGORIES CRUD ---
  getCategories: () => ipcRenderer.invoke('get-categories'),
  addCategory: (category) => ipcRenderer.invoke('add-category', category),
  updateCategory: (category) => ipcRenderer.invoke('update-category', category),
  deleteCategory: (id) => ipcRenderer.invoke('delete-category', id),

  // --- USERS CRUD ---
  getUsers: () => ipcRenderer.invoke('get-users'),
  addUser: (user) => ipcRenderer.invoke('add-user', user),
  updateUser: (user) => ipcRenderer.invoke('update-user', user),
  deleteUser: (id) => ipcRenderer.invoke('delete-user', id),

  // --- INVOICES CRUD ---
  getInvoices: () => ipcRenderer.invoke('get-invoices'),
  addInvoice: (invoice) => ipcRenderer.invoke('add-invoice', invoice),
  updateInvoice: (invoice) => ipcRenderer.invoke('update-invoice', invoice),
  deleteInvoice: (id) => ipcRenderer.invoke('delete-invoice', id),

  // --- REPORTS/ANALYTICS ---
  getSalesSummary: (params) => ipcRenderer.invoke('get-sales-summary', params),
  getSalesByDay: (params) => ipcRenderer.invoke('get-sales-by-day', params),
  getSalesByCategory: (params) => ipcRenderer.invoke('get-sales-by-category', params),
  getTopProducts: (params) => ipcRenderer.invoke('get-top-products', params),
});