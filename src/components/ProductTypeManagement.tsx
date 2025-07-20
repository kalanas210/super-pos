import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface ProductType {
  id: string;
  name: string;
  description?: string;
}

declare global {
  interface Window {
    electronAPI?: {
      getProductTypes: () => Promise<ProductType[]>;
      addProductType: (type: ProductType) => Promise<{ success: boolean; id: string }>;
      updateProductType: (type: ProductType) => Promise<{ success: boolean }>;
      deleteProductType: (id: string) => Promise<{ success: boolean }>;
    };
  }
}

export const ProductTypeManagement = () => {
  const [types, setTypes] = useState<ProductType[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingType, setEditingType] = useState<ProductType | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const { toast } = useToast();

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    if (window.electronAPI?.getProductTypes) {
      try {
        const data = await window.electronAPI.getProductTypes();
        setTypes(data);
      } catch (err) {
        toast({ title: 'Error', description: 'Failed to load product types', variant: 'destructive' });
      }
    }
  };

  const handleAddType = () => {
    setEditingType(null);
    setFormData({ name: '', description: '' });
    setOpenDialog(true);
  };

  const handleEditType = (type: ProductType) => {
    setEditingType(type);
    setFormData({ name: type.name, description: type.description || '' });
    setOpenDialog(true);
  };

  const handleDeleteType = async (typeId: string) => {
    if (window.electronAPI?.deleteProductType) {
      try {
        await window.electronAPI.deleteProductType(typeId);
        setTypes(types.filter(t => t.id !== typeId));
        toast({
          title: 'Product Type Deleted',
          description: 'The product type has been deleted successfully',
        });
      } catch (err) {
        toast({ title: 'Error', description: 'Failed to delete product type', variant: 'destructive' });
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Product type name is required',
        variant: 'destructive',
      });
      return;
    }

    if (editingType) {
      if (window.electronAPI?.updateProductType) {
        try {
          await window.electronAPI.updateProductType({ ...editingType, ...formData });
          setTypes(types.map(t =>
            t.id === editingType.id ? { ...t, ...formData } : t
          ));
          toast({
            title: 'Product Type Updated',
            description: 'The product type has been updated successfully',
          });
        } catch (err) {
          toast({ title: 'Error', description: 'Failed to update product type', variant: 'destructive' });
        }
      }
    } else {
      if (window.electronAPI?.addProductType) {
        try {
          const newType: ProductType = {
            id: Math.random().toString(36).substr(2, 9),
            ...formData,
          };
          await window.electronAPI.addProductType(newType);
          setTypes([...types, newType]);
          toast({
            title: 'Product Type Added',
            description: 'The new product type has been added successfully',
          });
        } catch (err) {
          toast({ title: 'Error', description: 'Failed to add product type', variant: 'destructive' });
        }
      }
    }

    setOpenDialog(false);
    setFormData({ name: '', description: '' });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Product Type Management</h2>
        <Button onClick={handleAddType}>
          <Plus className="w-4 h-4 mr-2" />
          Add Product Type
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {types.map((type) => (
            <TableRow key={type.id}>
              <TableCell>{type.name}</TableCell>
              <TableCell>{type.description}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditType(type)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteType(type.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingType ? 'Edit Product Type' : 'Add New Product Type'}
            </DialogTitle>
            <DialogDescription>
              {editingType
                ? 'Edit the product type details below'
                : 'Enter the details for the new product type'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Product type name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Product type description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingType ? 'Update' : 'Add'} Product Type
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 