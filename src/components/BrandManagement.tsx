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

interface Brand {
  id: string;
  name: string;
  description: string;
}

declare global {
  interface Window {
    electronAPI?: {
      getBrands: () => Promise<Brand[]>;
      addBrand: (brand: Brand) => Promise<{ success: boolean; id: string }>;
      updateBrand: (brand: Brand) => Promise<{ success: boolean }>;
      deleteBrand: (id: string) => Promise<{ success: boolean }>;
    };
  }
}

export const BrandManagement = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const { toast } = useToast();

  // Fetch brands from DB on mount
  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    if (window.electronAPI?.getBrands) {
      try {
        const data = await window.electronAPI.getBrands();
        setBrands(data);
      } catch (err) {
        toast({ title: 'Error', description: 'Failed to load brands', variant: 'destructive' });
      }
    }
  };

  const handleAddBrand = () => {
    setEditingBrand(null);
    setFormData({ name: '', description: '' });
    setOpenDialog(true);
  };

  const handleEditBrand = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({ name: brand.name, description: brand.description });
    setOpenDialog(true);
  };

  const handleDeleteBrand = async (brandId: string) => {
    if (window.electronAPI?.deleteBrand) {
      try {
        await window.electronAPI.deleteBrand(brandId);
        setBrands(brands.filter(b => b.id !== brandId));
        toast({
          title: 'Brand Deleted',
          description: 'The brand has been deleted successfully',
        });
      } catch (err) {
        toast({ title: 'Error', description: 'Failed to delete brand', variant: 'destructive' });
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Brand name is required',
        variant: 'destructive',
      });
      return;
    }

    if (editingBrand) {
      // Update
      if (window.electronAPI?.updateBrand) {
        try {
          await window.electronAPI.updateBrand({ ...editingBrand, ...formData });
          setBrands(brands.map(b =>
            b.id === editingBrand.id ? { ...b, ...formData } : b
          ));
          toast({
            title: 'Brand Updated',
            description: 'The brand has been updated successfully',
          });
        } catch (err) {
          toast({ title: 'Error', description: 'Failed to update brand', variant: 'destructive' });
        }
      }
    } else {
      // Add
      if (window.electronAPI?.addBrand) {
        try {
          const newBrand: Brand = {
            id: Math.random().toString(36).substr(2, 9),
            ...formData,
          };
          await window.electronAPI.addBrand(newBrand);
          setBrands([...brands, newBrand]);
          toast({
            title: 'Brand Added',
            description: 'The new brand has been added successfully',
          });
        } catch (err) {
          toast({ title: 'Error', description: 'Failed to add brand', variant: 'destructive' });
        }
      }
    }

    setOpenDialog(false);
    setFormData({ name: '', description: '' });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Brand Management</h2>
        <Button onClick={handleAddBrand}>
          <Plus className="w-4 h-4 mr-2" />
          Add Brand
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
          {brands.map((brand) => (
            <TableRow key={brand.id}>
              <TableCell>{brand.name}</TableCell>
              <TableCell>{brand.description}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditBrand(brand)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteBrand(brand.id)}
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
              {editingBrand ? 'Edit Brand' : 'Add New Brand'}
            </DialogTitle>
            <DialogDescription>
              {editingBrand
                ? 'Edit the brand details below'
                : 'Enter the details for the new brand'}
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
                placeholder="Brand name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brand description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingBrand ? 'Update' : 'Add'} Brand
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 