import { useState } from 'react';
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

interface Category {
  id: string;
  name: string;
  description: string;
}

export const CategoryManagement = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const { toast } = useToast();

  const handleAddCategory = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
    setOpenDialog(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, description: category.description });
    setOpenDialog(true);
  };

  const handleDeleteCategory = (categoryId: string) => {
    setCategories(categories.filter(cat => cat.id !== categoryId));
    toast({
      title: 'Category Deleted',
      description: 'The category has been deleted successfully',
    });
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Category name is required',
        variant: 'destructive',
      });
      return;
    }

    if (editingCategory) {
      setCategories(categories.map(cat =>
        cat.id === editingCategory.id ? { ...cat, ...formData } : cat
      ));
      toast({
        title: 'Category Updated',
        description: 'The category has been updated successfully',
      });
    } else {
      const newCategory: Category = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData,
      };
      setCategories([...categories, newCategory]);
      toast({
        title: 'Category Added',
        description: 'The new category has been added successfully',
      });
    }

    setOpenDialog(false);
    setFormData({ name: '', description: '' });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Category Management</h2>
        <Button onClick={handleAddCategory}>
          <Plus className="w-4 h-4 mr-2" />
          Add Category
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
          {categories.map((category) => (
            <TableRow key={category.id}>
              <TableCell>{category.name}</TableCell>
              <TableCell>{category.description}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditCategory(category)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteCategory(category.id)}
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
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? 'Edit the category details below'
                : 'Enter the details for the new category'}
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
                placeholder="Category name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Category description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingCategory ? 'Update' : 'Add'} Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 