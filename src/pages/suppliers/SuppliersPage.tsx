import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface Supplier {
  id: string;
  name: string;
  phones: string[];
  company?: string;
  email?: string;
  address?: string;
  notes?: string;
}

declare global {
  interface Window {
    electronAPI?: {
      getSuppliers: () => Promise<Supplier[]>;
      addSupplier: (supplier: Supplier) => Promise<{ success: boolean; id: string }>;
      updateSupplier: (supplier: Supplier) => Promise<{ success: boolean }>;
      deleteSupplier: (id: string) => Promise<{ success: boolean }>;
    };
  }
}

const emptySupplier = {
  name: '',
  phones: [''],
  company: '',
  email: '',
  address: '',
  notes: '',
};

const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({ ...emptySupplier });
  const { toast } = useToast();

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    if (window.electronAPI?.getSuppliers) {
      try {
        const data = await window.electronAPI.getSuppliers();
        setSuppliers(data);
      } catch (err) {
        toast({ title: 'Error', description: 'Failed to load suppliers', variant: 'destructive' });
      }
    }
  };

  const handleAddSupplier = () => {
    setEditingSupplier(null);
    setFormData({ ...emptySupplier });
    setOpenDialog(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({ ...supplier, phones: [...supplier.phones] });
    setOpenDialog(true);
  };

  const handleDeleteSupplier = async (id: string) => {
    if (window.electronAPI?.deleteSupplier) {
      try {
        await window.electronAPI.deleteSupplier(id);
        setSuppliers(suppliers.filter(s => s.id !== id));
        toast({ title: 'Supplier Deleted', description: 'The supplier has been deleted successfully' });
      } catch (err) {
        toast({ title: 'Error', description: 'Failed to delete supplier', variant: 'destructive' });
      }
    }
  };

  const handlePhoneChange = (idx: number, value: string) => {
    setFormData((prev) => {
      const phones = [...prev.phones];
      phones[idx] = value;
      return { ...prev, phones };
    });
  };

  const handleAddPhone = () => {
    setFormData((prev) => ({ ...prev, phones: [...prev.phones, ''] }));
  };

  const handleRemovePhone = (idx: number) => {
    setFormData((prev) => ({ ...prev, phones: prev.phones.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({ title: 'Error', description: 'Supplier name is required', variant: 'destructive' });
      return;
    }
    if (formData.phones.some((p) => !p.trim())) {
      toast({ title: 'Error', description: 'All phone numbers must be filled', variant: 'destructive' });
      return;
    }
    if (editingSupplier) {
      if (window.electronAPI?.updateSupplier) {
        try {
          await window.electronAPI.updateSupplier({ ...editingSupplier, ...formData });
          setSuppliers(suppliers.map(s => s.id === editingSupplier.id ? { ...editingSupplier, ...formData } : s));
          toast({ title: 'Supplier Updated', description: 'The supplier has been updated successfully' });
        } catch (err) {
          toast({ title: 'Error', description: 'Failed to update supplier', variant: 'destructive' });
        }
      }
    } else {
      if (window.electronAPI?.addSupplier) {
        try {
          const newSupplier: Supplier = {
            id: Math.random().toString(36).substr(2, 9),
            ...formData,
          };
          await window.electronAPI.addSupplier(newSupplier);
          setSuppliers([...suppliers, newSupplier]);
          toast({ title: 'Supplier Added', description: 'The new supplier has been added successfully' });
        } catch (err) {
          toast({ title: 'Error', description: 'Failed to add supplier', variant: 'destructive' });
        }
      }
    }
    setOpenDialog(false);
    setFormData({ ...emptySupplier });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Suppliers</h1>
          <p className="text-muted-foreground">Manage your suppliers and their details</p>
        </div>
        <Button onClick={handleAddSupplier}>
          <Plus className="w-4 h-4 mr-2" />
          Add Supplier
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Supplier List</CardTitle>
          <CardDescription>All suppliers in your system</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phones</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell>{supplier.name}</TableCell>
                  <TableCell>{supplier.phones.join(', ')}</TableCell>
                  <TableCell>{supplier.company || '-'}</TableCell>
                  <TableCell>{supplier.email || '-'}</TableCell>
                  <TableCell>{supplier.address || '-'}</TableCell>
                  <TableCell>{supplier.notes || '-'}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditSupplier(supplier)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteSupplier(supplier.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}</DialogTitle>
            <DialogDescription>
              {editingSupplier ? 'Edit the supplier details below' : 'Enter the details for the new supplier'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Supplier name"
              />
            </div>
            <div>
              <label className="text-sm font-medium flex items-center">Phone Numbers
                <Button type="button" size="sm" variant="ghost" className="ml-2" onClick={handleAddPhone}>
                  <Phone className="w-4 h-4" /> Add
                </Button>
              </label>
              {formData.phones.map((phone, idx) => (
                <div key={idx} className="flex items-center space-x-2 mt-1">
                  <Input
                    value={phone}
                    onChange={(e) => handlePhoneChange(idx, e.target.value)}
                    placeholder={`Phone #${idx + 1}`}
                  />
                  {formData.phones.length > 1 && (
                    <Button type="button" size="icon" variant="ghost" onClick={() => handleRemovePhone(idx)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <div>
              <label className="text-sm font-medium">Company Name</label>
              <Input
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Company name (optional)"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Email (optional)"
                type="email"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Address</label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Address (optional)"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Notes</label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notes (optional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingSupplier ? 'Update' : 'Add'} Supplier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuppliersPage; 