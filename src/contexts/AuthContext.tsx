import { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export type UserRole = 'admin' | 'sales_manager' | 'cashier' | 'inventory_manager';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  checkPermission: () => false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('pos_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // In a real app, this would be an API call
      // For demo, we'll simulate different users
      let mockUser: User | null = null;

      if (email === 'admin@example.com' && password === 'password') {
        mockUser = {
          id: '1',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin',
        };
      } else if (email === 'sales@example.com' && password === 'password') {
        mockUser = {
          id: '2',
          name: 'Sales Manager',
          email: 'sales@example.com',
          role: 'sales_manager',
        };
      } else if (email === 'cashier@example.com' && password === 'password') {
        mockUser = {
          id: '3',
          name: 'Cashier',
          email: 'cashier@example.com',
          role: 'cashier',
        };
      } else if (email === 'inventory@example.com' && password === 'password') {
        mockUser = {
          id: '4',
          name: 'Inventory Manager',
          email: 'inventory@example.com',
          role: 'inventory_manager',
        };
      } else {
        throw new Error('Invalid credentials');
      }

      if (mockUser) {
        setUser(mockUser);
        localStorage.setItem('pos_user', JSON.stringify(mockUser));
        toast({
          title: 'Login successful',
          description: `Welcome back, ${mockUser.name}!`,
        });
      }
    } catch (error) {
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pos_user');
    toast({
      title: 'Logged out',
      description: 'You have been logged out successfully',
    });
  };

  const checkPermission = (permission: string): boolean => {
    if (!user) return false;

    const permissionMap: Record<string, UserRole[]> = {
      'manage_users': ['admin'],
      'manage_settings': ['admin'],
      'edit_products': ['admin', 'sales_manager', 'inventory_manager'],
      'view_reports': ['admin', 'sales_manager'],
      'manage_invoices': ['admin', 'sales_manager'],
      'create_sale': ['admin', 'sales_manager', 'cashier'],
      'manage_inventory': ['admin', 'inventory_manager'],
    };

    const allowedRoles = permissionMap[permission] || [];
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkPermission }}>
      {children}
    </AuthContext.Provider>
  );
};