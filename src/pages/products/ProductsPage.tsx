import { useState } from 'react';
import { 
  Package, Plus, FileDown, FileUp, 
  Search, Filter, MoreHorizontal, Edit, Trash2, 
  Maximize2, AlertCircle 
} from 'lucide-react';
import { mockProducts } from '@/utils/mockData';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  price: number;
  barcode: string;
  category: string;
  stockQuantity: number;
  minStockLevel: number;
}

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    barcode: '',
    category: '',
    stockQuantity: '',
    minStockLevel: '',
  });
  
  const { toast } = useToast();

  const categories = ['all', ...Array.from(new Set(mockProducts.map(p => p.category)))];

  // Filter products based on search term and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode.includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      barcode: '',
      category: '',
      stockQuantity: '',
      minStockLevel: '',
    });
    setCurrentProduct(null);
  };

  const handleAddOrUpdateProduct = () => {
    // Validate form
    if (!formData.name || !formData.price || !formData.barcode || !formData.category) {
      toast({
        title: 'Validation Error',
        description: 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }

    const newProduct: Product = {
      id: currentProduct ? currentProduct.id : Date.now().toString(),
      name: formData.name,
      price: parseFloat(formData.price),
      barcode: formData.barcode,
      category: formData.category,
      stockQuantity: parseInt(formData.stockQuantity) || 0,
      minStockLevel: parseInt(formData.minStockLevel) || 0,
    };

    if (currentProduct) {
      // Update existing product
      setProducts(products.map(p => (p.id === currentProduct.id ? newProduct : p)));
      toast({
        title: 'Product Updated',
        description: `${newProduct.name} has been updated successfully`,
      });
    } else {
      // Add new product
      setProducts([...products, newProduct]);
      toast({
        title: 'Product Added',
        description: `${newProduct.name} has been added successfully`,
      });
    }

    setOpenAddDialog(false);
    resetForm();
  };

  const handleEditProduct = (product: Product) => {
    setCurrentProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      barcode: product.barcode,
      category: product.category,
      stockQuantity: product.stockQuantity.toString(),
      minStockLevel: product.minStockLevel.toString(),
    });
    setOpenAddDialog(true);
  };

  const handleDeleteClick = (product: Product) => {
    setCurrentProduct(product);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (currentProduct) {
      setProducts(products.filter(p => p.id !== currentProduct.id));
      toast({
        title: 'Product Deleted',
        description: `${currentProduct.name} has been deleted successfully`,
      });
      setOpenDeleteDialog(false);
      setCurrentProduct(null);
    }
  };

  const handleExport = () => {
    // In a real app, this would export to CSV
    toast({
      title: 'Export Started',
      description: 'Products are being exported to CSV',
    });
  };

  const handleImport = () => {
    // In a real app, this would open a file dialog
    toast({
      title: 'Import',
      description: 'Please select a CSV file to import products',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage your product catalog
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
          <Button onClick={() => { resetForm(); setOpenAddDialog(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Product Catalog</CardTitle>
          <CardDescription>
            Total {products.length} products in {categories.length - 1} categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
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

          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Package className="h-12 w-12 mb-2 opacity-20" />
              <p>No products found</p>
              <p className="text-sm">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead>Barcode</TableHead>
                    <TableHead className="text-center">Stock</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category}</Badge>
                      </TableCell>
                      <TableCell className="text-right">₹{product.price}</TableCell>
                      <TableCell>{product.barcode}</TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant={
                            product.stockQuantity === 0 
                              ? "destructive" 
                              : product.stockQuantity < product.minStockLevel 
                              ? "warning" 
                              : "outline"
                          }
                        >
                          {product.stockQuantity === 0 
                            ? "Out of stock" 
                            : product.stockQuantity < product.minStockLevel 
                            ? `Low: ${product.stockQuantity}` 
                            : product.stockQuantity}
                        </Badge>
                      </TableCell>
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
                            <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteClick(product)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Maximize2 className="mr-2 h-4 w-4" />
                              View Details
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

      {/* Add/Edit Product Dialog */}
      <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{currentProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
              {currentProduct 
                ? 'Update the product details below' 
                : 'Fill in the details for the new product'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Product Name *
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
              <div>
                <label htmlFor="price" className="text-sm font-medium">
                  Price (₹) *
                </label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
              <div>
                <label htmlFor="barcode" className="text-sm font-medium">
                  Barcode *
                </label>
                <Input
                  id="barcode"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
              <div>
                <label htmlFor="category" className="text-sm font-medium">
                  Category *
                </label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => handleSelectChange('category', value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c !== 'all').map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="stockQuantity" className="text-sm font-medium">
                  Stock Quantity
                </label>
                <Input
                  id="stockQuantity"
                  name="stockQuantity"
                  type="number"
                  value={formData.stockQuantity}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
              <div>
                <label htmlFor="minStockLevel" className="text-sm font-medium">
                  Min Stock Level
                </label>
                <Input
                  id="minStockLevel"
                  name="minStockLevel"
                  type="number"
                  value={formData.minStockLevel}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setOpenAddDialog(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddOrUpdateProduct}>
              {currentProduct ? 'Update Product' : 'Add Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center text-destructive">
              <AlertCircle className="h-5 w-5 mr-2" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {currentProduct && (
            <div className="py-4 border-y">
              <p className="font-medium">{currentProduct.name}</p>
              <p className="text-sm text-muted-foreground">{currentProduct.category} - ₹{currentProduct.price}</p>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setOpenDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
            >
              Delete Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsPage;