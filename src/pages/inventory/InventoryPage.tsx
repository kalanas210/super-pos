import { useState } from 'react';
import { 
  Store, Search, Filter, MoreHorizontal, Edit, 
  Trash2, AlertTriangle, Plus, FileDown, FileUp 
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

const InventoryPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openStockDialog, setOpenStockDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const { toast } = useToast();

  // Convert mock products to inventory items
  const inventoryItems: InventoryItem[] = mockProducts.map(product => ({
    id: product.id,
    name: product.name,
    category: product.category,
    stockQuantity: product.stockQuantity,
    minStockLevel: product.minStockLevel,
    lastRestocked: '2024-04-15', // Mock date
    supplier: 'Default Supplier Ltd',
    status: product.stockQuantity === 0 
      ? 'out_of_stock' 
      : product.stockQuantity < product.minStockLevel 
      ? 'low_stock' 
      : 'in_stock'
  }));

  const categories = ['all', ...Array.from(new Set(inventoryItems.map(item => item.category)))];

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
    toast({
      title: 'Export Started',
      description: 'Inventory data is being exported to CSV',
    });
  };

  const handleImport = () => {
    toast({
      title: 'Import',
      description: 'Please select a CSV file to import inventory data',
    });
  };

  const handleUpdateStock = (item: InventoryItem) => {
    setSelectedItem(item);
    setOpenStockDialog(true);
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
          <Button>
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
    </div>
  );
};

export default InventoryPage;