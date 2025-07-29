const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Path to the database file in the project root
const dbPath = path.join(__dirname, '../superpos.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to database:', err.message);
  } else {
    console.log('Connected to SQLite database at', dbPath);
    initializeTables();
  }
});

function initializeTables() {
  // Products table
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    sale_price REAL,
    discount REAL DEFAULT 0,
    discount_type TEXT DEFAULT 'percentage',
    barcode TEXT,
    sku TEXT,
    category_id TEXT,
    brand_id TEXT,
    product_type_id TEXT,
    stock_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 0,
    tax REAL DEFAULT 0,
    description TEXT,
    is_active INTEGER DEFAULT 1,
    image TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  // Categories table
  db.run(`CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  // Sales table
  db.run(`CREATE TABLE IF NOT EXISTS sales (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    customer_id TEXT,
    total REAL NOT NULL,
    payment_method TEXT,
    cashier_id TEXT,
    status TEXT DEFAULT 'completed',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  // Sale items table
  db.run(`CREATE TABLE IF NOT EXISTS sale_items (
    id TEXT PRIMARY KEY,
    sale_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    subtotal REAL NOT NULL
  )`);

  // Customers table
  db.run(`CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    lastActive TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  // Add missing columns to users table if not exist
  db.all("PRAGMA table_info(users)", (err, columns) => {
    if (Array.isArray(columns)) {
      if (!columns.some(col => col.name === 'status')) {
        db.run(`ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active'`);
      }
      if (!columns.some(col => col.name === 'lastActive')) {
        db.run(`ALTER TABLE users ADD COLUMN lastActive TEXT`);
      }
    }
  });

  // Suppliers table
  db.run(`CREATE TABLE IF NOT EXISTS suppliers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    contact TEXT,
    email TEXT,
    address TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  // Add missing columns to suppliers table if not exist
  db.all("PRAGMA table_info(suppliers)", (err, columns) => {
    if (Array.isArray(columns)) {
      if (!columns.some(col => col.name === 'company')) {
        db.run(`ALTER TABLE suppliers ADD COLUMN company TEXT`);
      }
      if (!columns.some(col => col.name === 'notes')) {
        db.run(`ALTER TABLE suppliers ADD COLUMN notes TEXT`);
      }
    }
  });

  // Add missing columns to products table if not exist
  db.all("PRAGMA table_info(products)", (err, columns) => {
    if (Array.isArray(columns)) {
      if (!columns.some(col => col.name === 'sale_price')) {
        db.run(`ALTER TABLE products ADD COLUMN sale_price REAL`);
      }
      if (!columns.some(col => col.name === 'discount')) {
        db.run(`ALTER TABLE products ADD COLUMN discount REAL DEFAULT 0`);
      }
      if (!columns.some(col => col.name === 'discount_type')) {
        db.run(`ALTER TABLE products ADD COLUMN discount_type TEXT DEFAULT 'percentage'`);
      }
      if (!columns.some(col => col.name === 'barcode')) {
        db.run(`ALTER TABLE products ADD COLUMN barcode TEXT`);
      }
      if (!columns.some(col => col.name === 'sku')) {
        db.run(`ALTER TABLE products ADD COLUMN sku TEXT`);
      }
      if (!columns.some(col => col.name === 'category_id')) {
        db.run(`ALTER TABLE products ADD COLUMN category_id TEXT`);
      }
      if (!columns.some(col => col.name === 'brand_id')) {
        db.run(`ALTER TABLE products ADD COLUMN brand_id TEXT`);
      }
      if (!columns.some(col => col.name === 'product_type_id')) {
        db.run(`ALTER TABLE products ADD COLUMN product_type_id TEXT`);
      }
      if (!columns.some(col => col.name === 'stock_quantity')) {
        db.run(`ALTER TABLE products ADD COLUMN stock_quantity INTEGER DEFAULT 0`);
      }
      if (!columns.some(col => col.name === 'min_stock_level')) {
        db.run(`ALTER TABLE products ADD COLUMN min_stock_level INTEGER DEFAULT 0`);
      }
      if (!columns.some(col => col.name === 'tax')) {
        db.run(`ALTER TABLE products ADD COLUMN tax REAL DEFAULT 0`);
      }
      if (!columns.some(col => col.name === 'description')) {
        db.run(`ALTER TABLE products ADD COLUMN description TEXT`);
      }
      if (!columns.some(col => col.name === 'is_active')) {
        db.run(`ALTER TABLE products ADD COLUMN is_active INTEGER DEFAULT 1`);
      }
      if (!columns.some(col => col.name === 'image')) {
        db.run(`ALTER TABLE products ADD COLUMN image TEXT`);
      }
      if (!columns.some(col => col.name === 'created_at')) {
        db.run(`ALTER TABLE products ADD COLUMN created_at TEXT DEFAULT CURRENT_TIMESTAMP`);
      }
      if (!columns.some(col => col.name === 'updated_at')) {
        db.run(`ALTER TABLE products ADD COLUMN updated_at TEXT DEFAULT CURRENT_TIMESTAMP`);
      }
    }
  });

  // Invoices table
  db.run(`CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    customer_id TEXT,
    total REAL NOT NULL,
    status TEXT DEFAULT 'paid',
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  // Add missing columns to invoices table if not exist
  db.all("PRAGMA table_info(invoices)", (err, columns) => {
    if (Array.isArray(columns)) {
      if (!columns.some(col => col.name === 'customer_id')) {
        db.run(`ALTER TABLE invoices ADD COLUMN customer_id TEXT`);
      }
      if (!columns.some(col => col.name === 'notes')) {
        db.run(`ALTER TABLE invoices ADD COLUMN notes TEXT`);
      }
      // Remove sale_id if it exists (we're using customer_id instead)
      if (columns.some(col => col.name === 'sale_id')) {
        // Note: SQLite doesn't support DROP COLUMN directly, but we can ignore this for now
        console.log('Warning: invoices table has sale_id column which should be customer_id');
      }
    }
  });

  // Settings table
  db.run(`CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  )`);

  // Promotions table
  db.run(`CREATE TABLE IF NOT EXISTS promotions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    valid_till TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  // Stock movements table
  db.run(`CREATE TABLE IF NOT EXISTS stock_movements (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    brand_id TEXT,
    supplier_id TEXT,
    warehouse_id TEXT DEFAULT 'main',
    type TEXT NOT NULL, -- in, out, adjust
    quantity INTEGER NOT NULL,
    cost REAL,
    total_cost REAL,
    process_number TEXT,
    reason TEXT,
    notes TEXT,
    date TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  // Feedback table
  db.run(`CREATE TABLE IF NOT EXISTS feedback (
    id TEXT PRIMARY KEY,
    customer_id TEXT,
    rating INTEGER,
    comment TEXT,
    date TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  // Brands table
  db.run(`CREATE TABLE IF NOT EXISTS brands (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  // Product types table
  db.run(`CREATE TABLE IF NOT EXISTS product_types (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  // Warehouses table
  db.run(`CREATE TABLE IF NOT EXISTS warehouses (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

  // Supplier phones table (for multiple phone numbers per supplier)
  db.run(`CREATE TABLE IF NOT EXISTS supplier_phones (
    id TEXT PRIMARY KEY,
    supplier_id TEXT NOT NULL,
    phone TEXT NOT NULL,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE
  )`);

  console.log('All tables initialized.');
}

module.exports = db; 