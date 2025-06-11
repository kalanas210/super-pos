import { useState } from 'react';
import { 
  Store, Search, Filter, MoreHorizontal, Edit, 
  Trash2, AlertTriangle, Plus, FileDown, FileUp 
} from 'lucide-react';
import { mockProducts } from '@/utils/mockData';
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
  };

  const handleAddStockSubmit = () => {
    if (!newStockData.name || !newStockData.category || !newStockData.quantity || !newStockData.supplier) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    // In a real app, this would update the database
    toast({
      title: 'Stock Added',
      description: `Added ${newStockData.quantity} units of ${newStockData.name} to inventory`,
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Stock</DialogTitle>
            <DialogDescription>
              Enter the details for the new inventory item
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name *</label>
              <Input
                value={newStockData.name}
                onChange={(e) => setNewStockData({ ...newStockData, name: e.target.value })}
                placeholder="Product name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category *</label>
              <Select
                value={newStockData.category}
                onValueChange={(value) => setNewStockData({ ...newStockData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories
                    .filter(cat => cat !== 'all')
                    .map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Barcode</label>
              <Input
                value={newStockData.barcode}
                onChange={(e) => setNewStockData({ ...newStockData, barcode: e.target.value })}
                placeholder="Product barcode"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Quantity *</label>
              <Input
                type="number"
                value={newStockData.quantity}
                onChange={(e) => setNewStockData({ ...newStockData, quantity: e.target.value })}
                placeholder="Initial stock quantity"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Supplier *</label>
              <Input
                value={newStockData.supplier}
                onChange={(e) => setNewStockData({ ...newStockData, supplier: e.target.value })}
                placeholder="Supplier name"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Input
                value={newStockData.notes}
                onChange={(e) => setNewStockData({ ...newStockData, notes: e.target.value })}
                placeholder="Additional notes"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddStockSubmit}>
              Add Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryPage;