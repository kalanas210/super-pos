import { useState, useEffect } from 'react';
import { 
  Store, Search, Filter, MoreHorizontal, Edit, 
  Trash2, AlertTriangle, Plus, FileDown, FileUp 
} from 'lucide-react';
// Remove mockProducts import
// import { mockProducts } from '@/utils/mockData';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  stockQuantity: number;
  minStockLevel: number;
  lastRestocked: string;
  supplier: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

interface NewStockData {
  name: string;
  category: string;
  barcode: string;
  quantity: string;
  supplier: string;
  notes: string;
}

// Add warehouse/location support
interface Warehouse {
  id: string;
  name: string;
}

interface Supplier {
  id: string;
  name: string;
}

interface Brand {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  brand_id: string;
  category_id: string;
}

const InventoryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openStockDialog, setOpenStockDialog] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [newStockData, setNewStockData] = useState<NewStockData>({
    name: '',
    category: '',
    barcode: '',
    quantity: '',
    supplier: '',
    notes: '',
  });
  const { toast } = useToast();

  const [products, setProducts] = useState<any[]>([]); // DB products
  const [categories, setCategories] = useState<any[]>([]); // DB categories
  const [stockMovements, setStockMovements] = useState<any[]>([]);

  const [brands, setBrands] = useState<Brand[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([{ id: 'main', name: 'Main' }]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  // Cascading filter states for add stock dialog
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('main');

  // Filtered products based on cascading selection
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  const [cost, setCost] = useState('');
  const [processNumber, setProcessNumber] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [totalCost, setTotalCost] = useState('');

  // Fetch products, categories, and stock movements from DB
  useEffect(() => {
    const fetchData = async () => {
      try {
        const dbProducts = window.electronAPI?.getProducts ? await window.electronAPI.getProducts() : [];
        setAllProducts(dbProducts);
        setProducts(dbProducts);
        const dbCategories = window.electronAPI?.getCategories ? await window.electronAPI.getCategories() : [];
        setCategories(dbCategories);
        const dbBrands = window.electronAPI?.getBrands ? await window.electronAPI.getBrands() : [];
        setBrands(dbBrands);
        const dbSuppliers = window.electronAPI?.getSuppliers ? await window.electronAPI.getSuppliers() : [];
        setSuppliers(dbSuppliers);
        const dbWarehouses = window.electronAPI?.getWarehouses ? await window.electronAPI.getWarehouses() : [];
        setWarehouses([{ id: 'main', name: 'Main' }, ...dbWarehouses]);
        const dbStockMovements = window.electronAPI?.getStockMovements ? await window.electronAPI.getStockMovements() : [];
        setStockMovements(dbStockMovements);
      } catch (err) {
        // handle error
      }
    };
    fetchData();
  }, []);

  // Cascading filter logic
  useEffect(() => {
    // Filter brands based on selected category
    if (selectedCategory && selectedCategory !== 'all') {
      const categoryProducts = allProducts.filter(product => product.category_id === selectedCategory);
      const brandIds = [...new Set(categoryProducts.map(p => p.brand_id))];
      const filteredBrands = brands.filter(brand => brandIds.includes(brand.id));
      setFilteredBrands(filteredBrands);
      setSelectedBrand(''); // Reset brand selection
      setSelectedProduct(''); // Reset product selection
    } else {
      setFilteredBrands(brands);
      setSelectedBrand('');
      setSelectedProduct('');
    }
  }, [selectedCategory, allProducts, brands]);

  // Filter products based on selected brand
  useEffect(() => {
    if (selectedBrand) {
      const filteredProducts = allProducts.filter(product => 
        product.brand_id === selectedBrand && 
        (selectedCategory === 'all' || product.category_id === selectedCategory)
      );
      setFilteredProducts(filteredProducts);
      setSelectedProduct(''); // Reset product selection
    } else {
      setFilteredProducts([]);
      setSelectedProduct('');
    }
  }, [selectedBrand, selectedCategory, allProducts]);

  // Convert products to inventory items
  const inventoryItems: InventoryItem[] = products.map(product => {
    const category = categories.find(cat => cat.id === product.category_id)?.name || 'Unknown';
    const brand = brands.find(brand => brand.id === product.brand_id)?.name || 'Unknown';
    
    return {
      id: product.id,
      name: product.name,
      category: category,
      stockQuantity: product.stock_quantity || 0,
      minStockLevel: product.min_stock_level || 0,
      lastRestocked: 'N/A', // Will be updated from stock movements
      supplier: brand, // Using brand as supplier for now
      status: (product.stock_quantity || 0) === 0 
        ? 'out_of_stock' 
        : (product.stock_quantity || 0) < (product.min_stock_level || 0)
        ? 'low_stock' 
        : 'in_stock'
    };
  });

  // Filter inventory items based on search term and category
  const filteredItems = inventoryItems.filter((item) => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleExport = () => {
    try {
      // Convert inventory items to CSV format
      const headers = ['Name', 'Category', 'Stock Quantity', 'Min Stock Level', 'Last Restocked', 'Supplier', 'Status'];
      const csvData = [
        headers.join(','),
        ...inventoryItems.map(item => [
          item.name,
          item.category,
          item.stockQuantity,
          item.minStockLevel,
          item.lastRestocked,
          item.supplier,
          item.status
        ].join(','))
      ].join('\n');

      // Create a Blob and download link
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `inventory-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'Export Successful',
        description: 'Inventory data has been exported to CSV',
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: 'Failed to export inventory data',
        variant: 'destructive',
      });
    }
  };

  const handleImport = () => {
    // Create a file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const csvText = event.target?.result as string;
            const lines = csvText.split('\n');
            const headers = lines[0].split(',');
            
            // Skip header row and parse data
            const newItems = lines.slice(1).map(line => {
              const values = line.split(',');
              return {
                id: Math.random().toString(36).substr(2, 9),
                name: values[0],
                category: values[1],
                stockQuantity: parseInt(values[2]),
                minStockLevel: parseInt(values[3]),
                lastRestocked: values[4],
                supplier: values[5],
                status: values[6] as 'in_stock' | 'low_stock' | 'out_of_stock'
              };
            });

            // In a real app, this would update the database
            toast({
              title: 'Import Successful',
              description: `${newItems.length} items have been imported`,
            });
          } catch (error) {
            toast({
              title: 'Import Failed',
              description: 'Failed to parse CSV file. Please check the file format.',
              variant: 'destructive',
            });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleUpdateStock = (item: InventoryItem) => {
    setSelectedItem(item);
    setOpenStockDialog(true);
  };

  const handleAddStock = () => {
    setOpenAddDialog(true);
    setNewStockData({
      name: '',
      category: '',
      barcode: '',
      quantity: '',
      supplier: '',
      notes: '',
    });
    setSelectedBrand('');
    setSelectedProduct('');
    setSelectedSupplier('');
    setSelectedWarehouse('main');
    setCost('');
    setProcessNumber(`INV-${Date.now().toString(36).toUpperCase()}`);
    setDateTime(new Date().toISOString().slice(0, 16));
    setTotalCost('');
  };

  const handleQuantityOrCostChange = (quantity: string, costValue: string) => {
    setTotalCost((parseFloat(quantity) || 0) * (parseFloat(costValue) || 0) + '');
  };

  const handleAddStockSubmit = async () => {
    if (!selectedProduct || !selectedBrand || !selectedSupplier || !selectedCategory || !newStockData.quantity || !cost) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    try {
      const movement = {
        id: generateId(),
        product_id: selectedProduct,
        brand_id: selectedBrand,
        supplier_id: selectedSupplier,
        warehouse_id: selectedWarehouse,
        type: 'in',
        quantity: parseInt(newStockData.quantity),
        cost: parseFloat(cost),
        total_cost: parseFloat(totalCost) || (parseInt(newStockData.quantity) * parseFloat(cost)),
        process_number: processNumber,
        reason: 'Stock In',
        notes: newStockData.notes,
        date: dateTime || new Date().toISOString(),
      };
      
      // Add stock movement
      await window.electronAPI.addStockMovement(movement);
      
      // Update product stock quantity
      const selectedProductData = allProducts.find(p => p.id === selectedProduct);
      if (selectedProductData) {
        const updatedProduct = {
          ...selectedProductData,
          stock_quantity: (selectedProductData.stock_quantity || 0) + parseInt(newStockData.quantity)
        };
        await window.electronAPI.updateProduct(updatedProduct);
      }
      
      toast({
        title: 'Inventory Process Added',
        description: `Added ${newStockData.quantity} units of product.`
      });
      
      setOpenAddDialog(false);
      setNewStockData({
        name: '',
        category: '',
        barcode: '',
        quantity: '',
        supplier: '',
        notes: '',
      });
      
      // Refresh stock movements and products
      const dbStockMovements = window.electronAPI?.getStockMovements ? await window.electronAPI.getStockMovements() : [];
      setStockMovements(dbStockMovements);
      const dbProducts = window.electronAPI?.getProducts ? await window.electronAPI.getProducts() : [];
      setProducts(dbProducts);
      setAllProducts(dbProducts);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to add inventory process', variant: 'destructive' });
    }
  };

  const getStatusBadge = (status: InventoryItem['status']) => {
    switch (status) {
      case 'in_stock':
        return <Badge variant="outline">In Stock</Badge>;
      case 'low_stock':
        return <Badge variant="secondary">Low Stock</Badge>;
      case 'out_of_stock':
        return <Badge variant="destructive">Out of Stock</Badge>;
    }
  };

  // Add this helper for generating unique IDs
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Update the restock/adjust stock handler to use the database
  const handleRestock = async (product: any, quantity: number, reason = 'Restock') => {
    try {
      // 1. Add stock movement
      const movement = {
        id: generateId(),
        product_id: product.id,
        type: 'in',
        quantity,
        reason,
        date: new Date().toISOString(),
      };
      await (window as any).electronAPI.addStockMovement(movement);
      // 2. Update product stock in DB
      const updatedProduct = { ...product, stockQuantity: product.stockQuantity + quantity };
      await (window as any).electronAPI.updateProduct(updatedProduct);
      // 3. Refresh products and stock movements
      const dbProducts = await (window as any).electronAPI.getProducts();
      setProducts(dbProducts);
      const dbStockMovements = await (window as any).electronAPI.getStockMovements();
      setStockMovements(dbStockMovements);
      toast({ title: 'Stock Updated', description: `Added ${quantity} to ${product.name}` });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to update stock', variant: 'destructive' });
    }
  };

  // Update the adjust stock handler similarly
  const handleAdjustStock = async (product: any, quantity: number, reason = 'Adjustment') => {
    try {
      // 1. Add stock movement
      const movement = {
        id: generateId(),
        product_id: product.id,
        type: quantity > 0 ? 'in' : 'out',
        quantity: Math.abs(quantity),
        reason,
        date: new Date().toISOString(),
      };
      await (window as any).electronAPI.addStockMovement(movement);
      // 2. Update product stock in DB
      const updatedProduct = { ...product, stockQuantity: product.stockQuantity + quantity };
      await (window as any).electronAPI.updateProduct(updatedProduct);
      // 3. Refresh products and stock movements
      const dbProducts = await (window as any).electronAPI.getProducts();
      setProducts(dbProducts);
      const dbStockMovements = await (window as any).electronAPI.getStockMovements();
      setStockMovements(dbStockMovements);
      toast({ title: 'Stock Adjusted', description: `Adjusted ${product.name} by ${quantity}` });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to adjust stock', variant: 'destructive' });
    }
  };

  // Add Category
  const handleAddCategory = async (name: string, description: string) => {
    try {
      const newCategory = { id: generateId(), name, description };
      await (window as any).electronAPI.addCategory(newCategory);
      const dbCategories = (window as any).electronAPI?.getCategories ? await (window as any).electronAPI.getCategories() : [];
      setCategories(['all', ...dbCategories.map((cat: any) => cat.name)]);
      toast({ title: 'Category Added', description: `Added category: ${name}` });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to add category', variant: 'destructive' });
    }
  };

  // Edit Category
  const handleEditCategory = async (id: string, name: string, description: string) => {
    try {
      const updatedCategory = { id, name, description };
      await (window as any).electronAPI.updateCategory(updatedCategory);
      const dbCategories = (window as any).electronAPI?.getCategories ? await (window as any).electronAPI.getCategories() : [];
      setCategories(['all', ...dbCategories.map((cat: any) => cat.name)]);
      toast({ title: 'Category Updated', description: `Updated category: ${name}` });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to update category', variant: 'destructive' });
    }
  };

  // Delete Category
  const handleDeleteCategory = async (id: string) => {
    try {
      await (window as any).electronAPI.deleteCategory(id);
      const dbCategories = (window as any).electronAPI?.getCategories ? await (window as any).electronAPI.getCategories() : [];
      setCategories(['all', ...dbCategories.map((cat: any) => cat.name)]);
      toast({ title: 'Category Deleted', description: 'Category has been deleted' });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to delete category', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage your stock levels
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <FileDown className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" onClick={handleImport}>
            <FileUp className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button onClick={handleAddStock}>
            <Plus className="mr-2 h-4 w-4" />
            Add Stock
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stock Overview</CardTitle>
          <CardDescription>
            {inventoryItems.length} items in {categories.length - 1} categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search inventory..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Store className="h-12 w-12 mb-2 opacity-20" />
              <p>No inventory items found</p>
              <p className="text-sm">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-center">Stock Level</TableHead>
                    <TableHead className="text-center">Min. Stock</TableHead>
                    <TableHead>Last Restocked</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.category}</Badge>
                      </TableCell>
                      <TableCell className="text-center">{item.stockQuantity}</TableCell>
                      <TableCell className="text-center">{item.minStockLevel}</TableCell>
                      <TableCell>{item.lastRestocked}</TableCell>
                      <TableCell>{item.supplier}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleUpdateStock(item)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Update Stock
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <AlertTriangle className="mr-2 h-4 w-4" />
                              Set Alert Level
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove Item
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Update Stock Dialog */}
      <Dialog open={openStockDialog} onOpenChange={setOpenStockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Stock Level</DialogTitle>
            <DialogDescription>
              Adjust the stock quantity for {selectedItem?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Current Stock Level</label>
                <Input 
                  type="number" 
                  defaultValue={selectedItem.stockQuantity}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Minimum Stock Level</label>
                <Input 
                  type="number" 
                  defaultValue={selectedItem.minStockLevel}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Supplier</label>
                <Input 
                  defaultValue={selectedItem.supplier}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenStockDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast({
                title: 'Stock Updated',
                description: `Stock level for ${selectedItem?.name} has been updated.`
              });
              setOpenStockDialog(false);
            }}>
              Update Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Stock Dialog */}
      <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
        <DialogContent className="max-w-3xl w-full">
          <DialogHeader>
            <DialogTitle>Add Inventory Process</DialogTitle>
            <DialogDescription>
              Enter the details for the new inventory process
            </DialogDescription>
          </DialogHeader>
          <form>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category *</label>
              <Select
                value={selectedCategory}
                onValueChange={(value) => {
                  setSelectedCategory(value);
                  setSelectedBrand('');
                  setSelectedProduct('');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Brand *</label>
              <Select
                value={selectedBrand}
                onValueChange={(value) => {
                  setSelectedBrand(value);
                  setSelectedProduct('');
                }}
                disabled={!selectedCategory || selectedCategory === 'all'}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedCategory === 'all' ? 'Select category first' : 'Select brand'} />
                </SelectTrigger>
                <SelectContent>
                  {filteredBrands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Product *</label>
              <Select
                value={selectedProduct}
                onValueChange={(value) => setSelectedProduct(value)}
                disabled={!selectedBrand}
              >
                <SelectTrigger>
                  <SelectValue placeholder={!selectedBrand ? 'Select brand first' : 'Select product'} />
                </SelectTrigger>
                <SelectContent>
                  {filteredProducts.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">Supplier *</label>
                <Select
                  value={selectedSupplier}
                  onValueChange={setSelectedSupplier}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Quantity *</label>
              <Input
                type="number"
                value={newStockData.quantity}
                  onChange={(e) => {
                    setNewStockData({ ...newStockData, quantity: e.target.value });
                    handleQuantityOrCostChange(e.target.value, cost);
                  }}
                  placeholder="Enter quantity"
              />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">Cost (Item Price) *</label>
              <Input
                  type="number"
                  value={cost}
                  onChange={(e) => {
                    setCost(e.target.value);
                    handleQuantityOrCostChange(newStockData.quantity, e.target.value);
                  }}
                  placeholder="Enter item price"
              />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">Warehouse/Location</label>
                <Select
                  value={selectedWarehouse}
                  onValueChange={setSelectedWarehouse}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select warehouse/location" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium">Notes</label>
                <Textarea
                value={newStockData.notes}
                onChange={(e) => setNewStockData({ ...newStockData, notes: e.target.value })}
                  placeholder="Additional notes (optional)"
              />
              </div>
              <div className="grid grid-cols-2 gap-4 col-span-2">
                <div>
                  <label className="text-sm font-medium">Process Number</label>
                  <Input value={processNumber} readOnly />
                </div>
                <div>
                  <label className="text-sm font-medium">Date/Time</label>
                  <Input value={dateTime} readOnly />
                </div>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">Total Cost</label>
                <Input value={totalCost} readOnly />
              </div>
            </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddStockSubmit}>
                Add Inventory
            </Button>
          </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryPage;