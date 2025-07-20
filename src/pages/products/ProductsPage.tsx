import { useState, useRef, useEffect } from 'react';
import { 
  Package, Plus, FileDown, FileUp, 
  Search, Filter, MoreHorizontal, Edit, Trash2, 
  Maximize2, AlertCircle, UploadCloud, Image as ImageIcon,
  QrCode, Eye, EyeOff, Tag, Percent, Hash
} from 'lucide-react';

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
import { Switch } from '@/components/ui/switch';
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
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

// Dummy images for products
const dummyImages = [
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=facearea&w=256&q=80',
  'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=facearea&w=256&q=80',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=facearea&w=256&q=80',
  'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=facearea&w=256&q=80',
];
const defaultImage = 'https://placehold.co/80x80?text=Product';

interface Product {
  id: string;
  name: string;
  price: number;
  sale_price: number;
  discount: number;
  discount_type: 'percentage' | 'fixed';
  barcode: string;
  sku: string;
  category_id: string;
  brand_id: string;
  product_type_id: string;
  stock_quantity: number;
  min_stock_level: number;
  // supplier_id: string; // REMOVE supplier_id
  image?: string;
  description?: string;
  tax?: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
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

interface Supplier {
  id: string;
  name: string;
  phones: string[];
  company?: string;
}

declare global {
  interface Window {
    electronAPI?: {
      getProducts: () => Promise<Product[]>;
      addProduct: (product: Product) => Promise<{ success: boolean; id: string }>;
      updateProduct: (product: Product) => Promise<{ success: boolean }>;
      deleteProduct: (id: string) => Promise<{ success: boolean }>;
      getCategories: () => Promise<Category[]>;
      getBrands: () => Promise<Brand[]>;
      getProductTypes: () => Promise<ProductType[]>;
      getSuppliers: () => Promise<Supplier[]>;
    };
  }
}

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  // const [suppliers, setSuppliers] = useState<Supplier[]>([]); // REMOVE this line
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [showDialog, setShowDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    sale_price: '',
    discount: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    barcode: '',
    sku: '',
    category_id: '',
    brand_id: '',
    product_type_id: '',
    stock_quantity: '',
    min_stock_level: '',
    // supplier_id: '', // REMOVE supplier_id
    description: '',
    tax: '',
    is_active: true,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Fetch data from DB on mount
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchBrands();
    fetchProductTypes();
    // fetchSuppliers(); // REMOVE this line
  }, []);

  const fetchProducts = async () => {
    try {
      if (window.electronAPI?.getProducts) {
        const data = await window.electronAPI.getProducts();
        setProducts(data);
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to load products', variant: 'destructive' });
    }
  };

  const fetchCategories = async () => {
    try {
      if (window.electronAPI?.getCategories) {
        const data = await window.electronAPI.getCategories();
        setCategories(data);
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to load categories', variant: 'destructive' });
    }
  };

  const fetchBrands = async () => {
    try {
      if (window.electronAPI?.getBrands) {
        const data = await window.electronAPI.getBrands();
        setBrands(data);
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to load brands', variant: 'destructive' });
    }
  };

  const fetchProductTypes = async () => {
    try {
      if (window.electronAPI?.getProductTypes) {
        const data = await window.electronAPI.getProductTypes();
        setProductTypes(data);
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to load product types', variant: 'destructive' });
    }
  };

  // Remove fetchSuppliers function

  // Generate auto product ID
  const generateProductId = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `PROD-${timestamp}-${random}`.toUpperCase();
  };

  // Generate SKU
  const generateSKU = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 3);
    return `SKU-${timestamp}-${random}`.toUpperCase();
  };

  // Filter products based on search term and filters
  const filteredProducts = products.filter((product) => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode.includes(searchTerm) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
    const matchesBrand = selectedBrand === 'all' || product.brand_id === selectedBrand;
    
    return matchesSearch && matchesCategory && matchesBrand;
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      sale_price: '',
      discount: '',
      discount_type: 'percentage',
      barcode: '',
      sku: '',
      category_id: '',
      brand_id: '',
      product_type_id: '',
      stock_quantity: '',
      min_stock_level: '',
      // supplier_id: '', // REMOVE supplier_id
      description: '',
      tax: '',
      is_active: true,
    });
    setImagePreview(null);
    setEditingProduct(null);
  };

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle barcode scanning
  const handleBarcodeScan = (barcode: string) => {
    setFormData(prev => ({ ...prev, barcode }));
    setShowBarcodeScanner(false);
  };

  // Calculate final price after discount
  const calculateFinalPrice = () => {
    const price = parseFloat(formData.price) || 0;
    const discount = parseFloat(formData.discount) || 0;
    
    if (formData.discount_type === 'percentage') {
      return price - (price * discount / 100);
    } else {
      return price - discount;
    }
  };

  // Add or update product
  const handleAddOrUpdateProduct = async () => {
    if (!formData.name.trim() || !formData.price || !formData.barcode || !formData.category_id) {
      toast({ title: 'Missing fields', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    try {
      if (window.electronAPI) {
        const productData: Product = {
          id: editingProduct?.id || generateProductId(),
          name: formData.name,
          price: parseFloat(formData.price),
          sale_price: calculateFinalPrice(),
          discount: parseFloat(formData.discount) || 0,
          discount_type: formData.discount_type,
          barcode: formData.barcode,
          sku: formData.sku || generateSKU(),
          category_id: formData.category_id,
          brand_id: formData.brand_id,
          product_type_id: formData.product_type_id,
          stock_quantity: parseInt(formData.stock_quantity) || 0,
          min_stock_level: parseInt(formData.min_stock_level) || 0,
          // supplier_id: formData.supplier_id, // REMOVE supplier_id
          description: formData.description,
          tax: parseFloat(formData.tax) || 0,
          is_active: formData.is_active,
          image: imagePreview || '',
        };

        if (editingProduct) {
          await window.electronAPI.updateProduct(productData);
          toast({ title: 'Product updated', description: formData.name });
        } else {
          await window.electronAPI.addProduct(productData);
          toast({ title: 'Product added', description: formData.name });
        }
        setShowDialog(false);
        resetForm();
        fetchProducts();
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to save product', variant: 'destructive' });
    }
  };

  // Edit product
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      sale_price: product.sale_price.toString(),
      discount: product.discount.toString(),
      discount_type: product.discount_type,
      barcode: product.barcode,
      sku: product.sku,
      category_id: product.category_id,
      brand_id: product.brand_id,
      product_type_id: product.product_type_id,
      stock_quantity: product.stock_quantity.toString(),
      min_stock_level: product.min_stock_level.toString(),
      // supplier_id: product.supplier_id, // REMOVE supplier_id
      description: product.description || '',
      tax: product.tax?.toString() || '',
      is_active: product.is_active,
    });
    setImagePreview(product.image || null);
    setShowDialog(true);
  };

  // Delete product
  const handleDeleteClick = async (product: Product) => {
    try {
      if (window.electronAPI?.deleteProduct) {
        await window.electronAPI.deleteProduct(product.id);
        toast({ title: 'Product deleted', description: product.name });
        fetchProducts();
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to delete product', variant: 'destructive' });
    }
  };

  // Toggle product status
  const handleToggleStatus = async (product: Product) => {
    try {
      if (window.electronAPI?.updateProduct) {
        const updatedProduct = { ...product, is_active: !product.is_active };
        await window.electronAPI.updateProduct(updatedProduct);
        setProducts(products.map(p => p.id === product.id ? updatedProduct : p));
        toast({ 
          title: 'Status Updated', 
          description: `${product.name} is now ${updatedProduct.is_active ? 'active' : 'inactive'}` 
        });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  };

  // Helper functions to get names from IDs
  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'Unknown';
  };

  const getBrandName = (brandId: string) => {
    return brands.find(b => b.id === brandId)?.name || 'Unknown';
  };

  const getProductTypeName = (typeId: string) => {
    return productTypes.find(t => t.id === typeId)?.name || 'Unknown';
  };

  // Remove getSupplierName function

  return (
    <div className="w-full max-w-7xl mx-auto px-2 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold">Product Management</h2>
          <p className="text-muted-foreground">Manage your products, prices, and stock</p>
        </div>
        <Button onClick={() => { setShowDialog(true); resetForm(); }}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Product
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search products by name, barcode, or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Categories" />
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
        <Select value={selectedBrand} onValueChange={setSelectedBrand}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Brands" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            {brands.map((brand) => (
              <SelectItem key={brand.id} value={brand.id}>
                {brand.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full text-center text-muted-foreground py-12">
            <ImageIcon className="mx-auto mb-2 h-10 w-10 text-slate-300" />
            No products found. {searchTerm || selectedCategory !== 'all' || selectedBrand !== 'all' ? 'Try adjusting your filters.' : 'Add your first product!'}
          </div>
        ) : (
          filteredProducts.map((product, idx) => (
            <Card key={product.id} className={`flex flex-col h-full shadow-md hover:shadow-lg transition-all ${!product.is_active ? 'opacity-60' : ''}`}>
              <div className="flex justify-center items-center h-32 bg-slate-100 dark:bg-slate-800 rounded-t-lg overflow-hidden relative">
                <img
                  src={product.image || dummyImages[idx % dummyImages.length] || defaultImage}
                  alt={product.name}
                  className="object-cover h-28 w-28 rounded-lg shadow"
                  onError={e => (e.currentTarget.src = defaultImage)}
                />
                {!product.is_active && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Badge variant="secondary">Inactive</Badge>
                  </div>
                )}
              </div>
              <CardContent className="flex-1 flex flex-col gap-2 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-base truncate">{product.name}</h3>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs">{getCategoryName(product.category_id)}</Badge>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => handleToggleStatus(product)}
                    >
                      {product.is_active ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-green-600 font-bold text-lg">LKR {product.sale_price.toLocaleString()}</div>
                  {product.discount > 0 && (
                    <div className="text-sm text-muted-foreground line-through">
                      LKR {product.price.toLocaleString()}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">Stock:</span>
                  <span className={product.stock_quantity > product.min_stock_level ? 'text-green-600' : product.stock_quantity > 0 ? 'text-orange-500' : 'text-red-500'}>
                    {product.stock_quantity}
                  </span>
                  <span className="text-muted-foreground">Min:</span>
                  <span>{product.min_stock_level}</span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">Brand:</span>
                  <span>{getBrandName(product.brand_id)}</span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">Type:</span>
                  <span>{getProductTypeName(product.product_type_id)}</span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">SKU:</span>
                  <span className="font-mono">{product.sku}</span>
                </div>

                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="outline" onClick={() => handleEditProduct(product)}>
                    <Edit className="w-4 h-4 mr-1" /> Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDeleteClick(product)}>
                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Add/Edit Product Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Update the product details below' : 'Enter the details for the new product'}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={e => {
              e.preventDefault();
              handleAddOrUpdateProduct();
            }}
            className="space-y-6"
          >
            {/* Product Image */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative h-32 w-32 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="object-cover h-full w-full" />
                ) : (
                  <ImageIcon className="h-12 w-12 text-slate-300" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleImageChange}
                />
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="absolute bottom-2 right-2 bg-white/80 hover:bg-white"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadCloud className="h-4 w-4" />
                </Button>
              </div>
              <span className="text-xs text-muted-foreground">Upload product image (optional)</span>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Rice - Basmati (5kg)"
                />
              </div>
              <div>
                <Label htmlFor="sku">SKU</Label>
                <div className="flex gap-2">
                  <Input
                    id="sku"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    placeholder="Auto-generated if empty"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setFormData(prev => ({ ...prev, sku: generateSKU() }))}
                  >
                    <Hash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Categories and Brand */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category_id} onValueChange={(value) => handleSelectChange('category_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="brand">Brand *</Label>
                <Select value={formData.brand_id} onValueChange={(value) => handleSelectChange('brand_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Product Type and Supplier */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="product_type">Product Type *</Label>
                <Select value={formData.product_type_id} onValueChange={(value) => handleSelectChange('product_type_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select product type" />
                  </SelectTrigger>
                  <SelectContent>
                    {productTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* REMOVE Supplier select field */}
            </div>

            {/* Barcode */}
            <div>
              <Label htmlFor="barcode">Barcode *</Label>
              <div className="flex gap-2">
                <Input
                  id="barcode"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleInputChange}
                  required
                  placeholder="Scan or type barcode"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowBarcodeScanner(true)}
                >
                  <QrCode className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price">Regular Price (LKR) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="discount">Discount</Label>
                <div className="flex gap-2">
                  <Input
                    id="discount"
                    name="discount"
                    type="number"
                    value={formData.discount}
                    onChange={handleInputChange}
                    min={0}
                    step="0.01"
                    placeholder="0.00"
                  />
                  <Select value={formData.discount_type} onValueChange={(value: 'percentage' | 'fixed') => setFormData(prev => ({ ...prev, discount_type: value }))}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">%</SelectItem>
                      <SelectItem value="fixed">LKR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Final Price</Label>
                <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center">
                  <span className="font-semibold">LKR {calculateFinalPrice().toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Stock Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="stock_quantity">Stock Quantity *</Label>
                <Input
                  id="stock_quantity"
                  name="stock_quantity"
                  type="number"
                  value={formData.stock_quantity}
                  onChange={handleInputChange}
                  required
                  min={0}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="min_stock_level">Minimum Stock Level</Label>
                <Input
                  id="min_stock_level"
                  name="min_stock_level"
                  type="number"
                  value={formData.min_stock_level}
                  onChange={handleInputChange}
                  min={0}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="tax">Tax (%)</Label>
                <Input
                  id="tax"
                  name="tax"
                  type="number"
                  value={formData.tax}
                  onChange={handleInputChange}
                  min={0}
                  max={100}
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Product description (optional)"
                rows={3}
              />
            </div>

            {/* Status */}
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="is_active">Product is active</Label>
            </div>

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="btn-primary">
                {editingProduct ? 'Update Product' : 'Add Product'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Barcode Scanner Dialog */}
      <Dialog open={showBarcodeScanner} onOpenChange={setShowBarcodeScanner}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Scan Barcode</DialogTitle>
            <DialogDescription>
              Use your barcode scanner or manually enter the barcode below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Scan barcode here..."
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleBarcodeScan(e.currentTarget.value);
                }
              }}
            />
            <div className="text-center text-sm text-muted-foreground">
              Press Enter after scanning or typing the barcode
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBarcodeScanner(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductsPage;