interface Supplier {
  id: string;
  name: string;
  phones: string[];
  company?: string;
  email?: string;
  address?: string;
  notes?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  sale_price?: number;
  discount?: number;
  discount_type?: string;
  barcode?: string;
  sku?: string;
  category_id?: string;
  brand_id?: string;
  product_type_id?: string;
  stock_quantity: number;
  min_stock_level?: number;
  tax?: number;
  description?: string;
  is_active: boolean;
  image?: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface Brand {
  id: string;
  name: string;
  description?: string;
}

interface ProductType {
  id: string;
  name: string;
  description?: string;
}

interface Warehouse {
  id: string;
  name: string;
  description?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  password?: string;
  status?: string;
  lastActive?: string;
}

interface Invoice {
  id: string;
  date: string;
  customer_id?: string;
  total: number;
  status?: string;
  notes?: string;
}

interface StockMovement {
  id: string;
  product_id: string;
  brand_id?: string;
  supplier_id?: string;
  warehouse_id?: string;
  type: string;
  quantity: number;
  cost?: number;
  total_cost?: number;
  process_number?: string;
  reason?: string;
  notes?: string;
  date?: string;
}

declare global {
  interface Window {
    electronAPI?: {
      // App utilities
      getAppVersion: () => Promise<string>;
      showSaveDialog: (options: any) => Promise<any>;
      showOpenDialog: (options: any) => Promise<any>;
      
      // Navigation
      onNavigateTo: (callback: (event: unknown, path: string) => void) => void;
      
      // Printing
      onPrintReceipt: (callback: (event: unknown) => void) => void;
      
      // Data management
      onBackupData: (callback: (event: unknown, filePath: string) => void) => void;
      onRestoreData: (callback: (event: unknown, filePath: string) => void) => void;
      
      // Remove listeners
      removeAllListeners: (channel: string) => void;

      // Products CRUD
      getProducts: () => Promise<Product[]>;
      addProduct: (product: Product) => Promise<{ success: boolean; id: string }>;
      updateProduct: (product: Product) => Promise<{ success: boolean }>;
      deleteProduct: (id: string) => Promise<{ success: boolean }>;

      // Product Types CRUD
      getProductTypes: () => Promise<ProductType[]>;
      addProductType: (type: ProductType) => Promise<{ success: boolean; id: string }>;
      updateProductType: (type: ProductType) => Promise<{ success: boolean }>;
      deleteProductType: (id: string) => Promise<{ success: boolean }>;

      // Stock Movements CRUD
      getStockMovements: (productId?: string) => Promise<StockMovement[]>;
      addStockMovement: (movement: StockMovement) => Promise<{ success: boolean; id: string }>;
      deleteStockMovement: (id: string) => Promise<{ success: boolean }>;

      // Categories CRUD
      getCategories: () => Promise<Category[]>;
      addCategory: (category: Category) => Promise<{ success: boolean; id: string }>;
      updateCategory: (category: Category) => Promise<{ success: boolean }>;
      deleteCategory: (id: string) => Promise<{ success: boolean }>;

      // Users CRUD
      getUsers: () => Promise<User[]>;
      addUser: (user: User) => Promise<{ success: boolean; id: string }>;
      updateUser: (user: User) => Promise<{ success: boolean }>;
      deleteUser: (id: string) => Promise<{ success: boolean }>;

      // Invoices CRUD
      getInvoices: () => Promise<Invoice[]>;
      addInvoice: (invoice: Invoice) => Promise<{ success: boolean; id: string }>;
      updateInvoice: (invoice: Invoice) => Promise<{ success: boolean }>;
      deleteInvoice: (id: string) => Promise<{ success: boolean }>;

      // Reports/Analytics
      getSalesSummary: (params: { startDate: string; endDate: string }) => Promise<any>;
      getSalesByDay: (params: { startDate: string; endDate: string }) => Promise<any>;
      getSalesByCategory: (params: { startDate: string; endDate: string }) => Promise<any>;
      getTopProducts: (params: { startDate: string; endDate: string; limit?: number }) => Promise<any>;

      // Brands CRUD
      getBrands: () => Promise<Brand[]>;
      addBrand: (brand: Brand) => Promise<{ success: boolean; id: string }>;
      updateBrand: (brand: Brand) => Promise<{ success: boolean }>;
      deleteBrand: (id: string) => Promise<{ success: boolean }>;

      // Warehouses CRUD
      getWarehouses: () => Promise<Warehouse[]>;
      addWarehouse: (warehouse: Warehouse) => Promise<{ success: boolean; id: string }>;
      updateWarehouse: (warehouse: Warehouse) => Promise<{ success: boolean }>;
      deleteWarehouse: (id: string) => Promise<{ success: boolean }>;

      // Suppliers CRUD
      getSuppliers: () => Promise<Supplier[]>;
      addSupplier: (supplier: Supplier) => Promise<{ success: boolean; id: string }>;
      updateSupplier: (supplier: Supplier) => Promise<{ success: boolean }>;
      deleteSupplier: (id: string) => Promise<{ success: boolean }>;
    };
  }
}

export {}; 