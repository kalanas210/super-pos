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

interface Warehouse {
  id: string;
  name: string;
  description?: string;
}

declare global {
  interface Window {
    electronAPI?: {
      getWarehouses: () => Promise<Warehouse[]>;
      addWarehouse: (warehouse: Warehouse) => Promise<{ success: boolean; id: string }>;
      updateWarehouse: (warehouse: Warehouse) => Promise<{ success: boolean }>;
      deleteWarehouse: (id: string) => Promise<{ success: boolean }>;
    };
  }
}

export const WarehouseManagement = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const { toast } = useToast();

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    if (window.electronAPI?.getWarehouses) {
      try {
        const data = await window.electronAPI.getWarehouses();
        setWarehouses(data);
      } catch (err) {
        toast({ title: 'Error', description: 'Failed to load warehouses', variant: 'destructive' });
      }
    }
  };

  const handleAddWarehouse = () => {
    setEditingWarehouse(null);
    setFormData({ name: '', description: '' });
    setOpenDialog(true);
  };

  const handleEditWarehouse = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
    setFormData({ name: warehouse.name, description: warehouse.description || '' });
    setOpenDialog(true);
  };

  const handleDeleteWarehouse = async (warehouseId: string) => {
    if (window.electronAPI?.deleteWarehouse) {
      try {
        await window.electronAPI.deleteWarehouse(warehouseId);
        setWarehouses(warehouses.filter(w => w.id !== warehouseId));
        toast({
          title: 'Warehouse Deleted',
          description: 'The warehouse/location has been deleted successfully',
        });
      } catch (err) {
        toast({ title: 'Error', description: 'Failed to delete warehouse', variant: 'destructive' });
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Warehouse/location name is required',
        variant: 'destructive',
      });
      return;
    }

    if (editingWarehouse) {
      if (window.electronAPI?.updateWarehouse) {
        try {
          await window.electronAPI.updateWarehouse({ ...editingWarehouse, ...formData });
          setWarehouses(warehouses.map(w =>
            w.id === editingWarehouse.id ? { ...w, ...formData } : w
          ));
          toast({
            title: 'Warehouse Updated',
            description: 'The warehouse/location has been updated successfully',
          });
        } catch (err) {
          toast({ title: 'Error', description: 'Failed to update warehouse', variant: 'destructive' });
        }
      }
    } else {
      if (window.electronAPI?.addWarehouse) {
        try {
          const newWarehouse: Warehouse = {
            id: Math.random().toString(36).substr(2, 9),
            ...formData,
          };
          await window.electronAPI.addWarehouse(newWarehouse);
          setWarehouses([...warehouses, newWarehouse]);
          toast({
            title: 'Warehouse Added',
            description: 'The new warehouse/location has been added successfully',
          });
        } catch (err) {
          toast({ title: 'Error', description: 'Failed to add warehouse', variant: 'destructive' });
        }
      }
    }

    setOpenDialog(false);
    setFormData({ name: '', description: '' });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Warehouse/Location Management</h2>
        <Button onClick={handleAddWarehouse}>
          <Plus className="w-4 h-4 mr-2" />
          Add Warehouse/Location
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
          {warehouses.map((warehouse) => (
            <TableRow key={warehouse.id}>
              <TableCell>{warehouse.name}</TableCell>
              <TableCell>{warehouse.description}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditWarehouse(warehouse)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteWarehouse(warehouse.id)}
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
              {editingWarehouse ? 'Edit Warehouse/Location' : 'Add New Warehouse/Location'}
            </DialogTitle>
            <DialogDescription>
              {editingWarehouse
                ? 'Edit the warehouse/location details below'
                : 'Enter the details for the new warehouse/location'}
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
                placeholder="Warehouse/location name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Warehouse/location description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingWarehouse ? 'Update' : 'Add'} Warehouse/Location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 