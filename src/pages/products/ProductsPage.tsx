import { useState, useRef, useEffect } from 'react';
import { 
  Package, Plus, FileDown, FileUp, 
  Search, Filter, MoreHorizontal, Edit, Trash2, 
  Maximize2, AlertCircle, UploadCloud, Image as ImageIcon 
} from 'lucide-react';
// Remove mockProducts import
// import { mockProducts } from '@/utils/mockData';

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
  barcode: string;
  category: string;
  stockQuantity: number;
  minStockLevel: number;
  supplier?: string;
  image?: string;
  stock_quantity?: number; // Added for DB compatibility
  min_stock_level?: number; // Added for DB compatibility
  supplier_id?: string; // Added for DB compatibility
  category_id?: string; // Added for DB compatibility
}

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showDialog, setShowDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    barcode: '',
    category: '',
    stockQuantity: '',
    minStockLevel: '',
    supplier: '',
    image: '',
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Fetch products from DB on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      if ((window as any).electronAPI && (window as any).electronAPI.getProducts) {
        const dbProducts = await (window as any).electronAPI.getProducts();
        setProducts(dbProducts);
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to load products', variant: 'destructive' });
    }
  };

  // Get categories from products
  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      barcode: '',
      category: '',
      stockQuantity: '',
      minStockLevel: '',
      supplier: '',
      image: '',
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
        setFormData((prev) => ({ ...prev, image: ev.target?.result as string }));
        setImagePreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add or update product (DB version)
  const handleAddOrUpdateProduct = async () => {
    if (!formData.name.trim() || !formData.price || !formData.barcode || !formData.category || !formData.stockQuantity) {
      toast({ title: 'Missing fields', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    try {
      if ((window as any).electronAPI) {
        if (editingProduct) {
          // Update
          await (window as any).electronAPI.updateProduct({
            id: editingProduct.id,
            name: formData.name,
            price: Number(formData.price),
            barcode: formData.barcode,
            category_id: formData.category,
            stock_quantity: Number(formData.stockQuantity),
            min_stock_level: Number(formData.minStockLevel) || 0,
            supplier_id: formData.supplier,
            image: formData.image || imagePreview || '',
          });
          toast({ title: 'Product updated', description: formData.name });
        } else {
          // Add
          const newId = Math.random().toString(36).substr(2, 9);
          await (window as any).electronAPI.addProduct({
            id: newId,
            name: formData.name,
            price: Number(formData.price),
            barcode: formData.barcode,
            category_id: formData.category,
            stock_quantity: Number(formData.stockQuantity),
            min_stock_level: Number(formData.minStockLevel) || 0,
            supplier_id: formData.supplier,
            image: formData.image || imagePreview || '',
          });
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

  // Edit product (load from DB row)
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      barcode: product.barcode,
      category: product.category,
      stockQuantity: product.stockQuantity?.toString() || product.stock_quantity?.toString() || '',
      minStockLevel: product.minStockLevel?.toString() || product.min_stock_level?.toString() || '',
      supplier: product.supplier || product.supplier_id || '',
      image: product.image || '',
    });
    setImagePreview(product.image || null);
    setShowDialog(true);
  };

  // Delete product (DB version)
  const handleDeleteClick = async (product: Product) => {
    try {
      if ((window as any).electronAPI && (window as any).electronAPI.deleteProduct) {
        await (window as any).electronAPI.deleteProduct(product.id);
        toast({ title: 'Product deleted', description: product.name });
        fetchProducts();
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to delete product', variant: 'destructive' });
    }
  };

  const confirmDelete = () => {
    if (editingProduct) {
      setProducts(products.filter(p => p.id !== editingProduct.id));
      toast({
        title: 'Product Deleted',
        description: `${editingProduct.name} has been deleted successfully`,
      });
      setShowDialog(false);
      setEditingProduct(null);
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

  // Responsive layout: grid for products, form in dialog
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.length === 0 ? (
          <div className="col-span-full text-center text-muted-foreground py-12">
            <ImageIcon className="mx-auto mb-2 h-10 w-10 text-slate-300" />
            No products yet. Add your first product!
          </div>
        ) : (
          products.map((product, idx) => (
            <Card key={product.id} className="flex flex-col h-full shadow-md hover:shadow-lg transition-all">
              <div className="flex justify-center items-center h-32 bg-slate-100 dark:bg-slate-800 rounded-t-lg overflow-hidden">
                <img
                  src={product.image || dummyImages[idx % dummyImages.length] || defaultImage}
                  alt={product.name}
                  className="object-cover h-28 w-28 rounded-lg shadow"
                  onError={e => (e.currentTarget.src = defaultImage)}
                />
              </div>
              <CardContent className="flex-1 flex flex-col gap-2 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-base truncate">{product.name}</h3>
                  <Badge variant="outline" className="text-xs">{product.category}</Badge>
                </div>
                <div className="text-green-600 font-bold text-lg">LKR {product.price.toLocaleString()}</div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">Stock:</span>
                  <span className={product.stockQuantity > 5 ? 'text-green-600' : product.stockQuantity > 0 ? 'text-orange-500' : 'text-red-500'}>{product.stockQuantity}</span>
                  <span className="ml-2 text-muted-foreground">Barcode:</span>
                  <span className="font-mono">{product.barcode}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">Supplier:</span>
                  <span>{product.supplier || '-'}</span>
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={e => {
              e.preventDefault();
              handleAddOrUpdateProduct();
            }}
            className="space-y-4"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="relative h-24 w-24 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="object-cover h-full w-full" />
                ) : (
                  <ImageIcon className="h-10 w-10 text-slate-300" />
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
                  className="absolute bottom-1 right-1 bg-white/80 hover:bg-white"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadCloud className="h-4 w-4" />
                </Button>
              </div>
              <span className="text-xs text-muted-foreground">Upload product image (optional)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Product Name *</label>
                <Input name="name" value={formData.name} onChange={handleInputChange} required placeholder="e.g. Rice - Basmati (5kg)" />
              </div>
              <div>
                <label className="text-sm font-medium">Category *</label>
                <Input name="category" value={formData.category} onChange={handleInputChange} required placeholder="e.g. Groceries" />
              </div>
              <div>
                <label className="text-sm font-medium">Barcode *</label>
                <Input name="barcode" value={formData.barcode} onChange={handleInputChange} required placeholder="e.g. 4791234567890" />
              </div>
              <div>
                <label className="text-sm font-medium">Supplier</label>
                <Input name="supplier" value={formData.supplier} onChange={handleInputChange} placeholder="e.g. Dilna Suppliers" />
              </div>
              <div>
                <label className="text-sm font-medium">Price (LKR) *</label>
                <Input name="price" type="number" value={formData.price} onChange={handleInputChange} required min={0} placeholder="e.g. 250.00" />
              </div>
              <div>
                <label className="text-sm font-medium">Stock Quantity *</label>
                <Input name="stockQuantity" type="number" value={formData.stockQuantity} onChange={handleInputChange} required min={0} placeholder="e.g. 100" />
              </div>
              <div>
                <label className="text-sm font-medium">Min Stock Level</label>
                <Input name="minStockLevel" type="number" value={formData.minStockLevel} onChange={handleInputChange} min={0} placeholder="e.g. 10" />
              </div>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDialog && editingProduct !== null} onOpenChange={setShowDialog}>
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
          {editingProduct && (
            <div className="py-4 border-y">
              <p className="font-medium">{editingProduct.name}</p>
              <p className="text-sm text-muted-foreground">Category: {editingProduct.category} - Price: LKR {editingProduct.price.toLocaleString()}</p>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowDialog(false)}
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