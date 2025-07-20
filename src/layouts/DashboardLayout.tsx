// Add window interface at the top
declare global {
  interface Window {
    electronAPI?: {
      onNavigateTo: (callback: (event: unknown, path: string) => void) => void;
      removeAllListeners: (event: string) => void;
      printPDF: (blob: Blob) => void; // Added for printing
    }
  }
}

import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Store, ShoppingCart, Package, FileText, 
  BarChart3, Users, Settings, Menu, X, LogOut, ArrowUpDown,
  Moon, Sun, Bell, Calculator as CalculatorIcon, CreditCard, Printer, 
  Database, Shield, Zap, TrendingUp, DollarSign, Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/components/theme-provider';
import { useSync } from '@/contexts/SyncContext';
import { cn } from '@/lib/utils';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Calculator as CalculatorComponent } from '@/components/Calculator';
import { generateReport } from '@/utils/reportGenerator';
import { mockProducts } from '@/utils/mockData';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const { user, logout, checkPermission } = useAuth();
  const { theme, setTheme } = useTheme();
  const { isOnline, pendingChanges, syncNow, syncStatus, lastSyncTime } = useSync();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    // Handle Electron navigation events
    if (typeof window !== 'undefined' && window.electronAPI) {
      window.electronAPI.onNavigateTo((event, path) => {
        navigate(path);
      });

      return () => {
        window.electronAPI?.removeAllListeners('navigate-to');
      };
    }
  }, [navigate]);

  useEffect(() => {
    // Close sidebar on mobile when route changes
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const formatLastSyncTime = () => {
    if (!lastSyncTime) return 'Never';
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(lastSyncTime);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handlePrint = () => {
    try {
      // Generate mock data for the report
      const today = new Date();
      const lastWeek = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(today.getDate() - i);
        return {
          date: date.toISOString(),
          amount: Math.floor(Math.random() * 50000) + 10000,
          items: Math.floor(Math.random() * 100) + 20,
        };
      });
      const categories = Array.from(new Set(mockProducts.map(p => p.category)));
      const totalSales = lastWeek.reduce((sum, day) => sum + day.amount, 0);
      const salesByCategory = categories.map(cat => ({
        category: cat,
        amount: Math.floor(Math.random() * 100000) + 20000,
        percentage: Math.random() * 100 / categories.length,
      }));
      const reportData = {
        title: 'Sales Report',
        period: `${format(new Date(lastWeek[6].date), 'dd/MM/yyyy')} - ${format(new Date(lastWeek[0].date), 'dd/MM/yyyy')}`,
        totalSales,
        totalItems: lastWeek.reduce((sum, day) => sum + day.items, 0),
        averageOrderValue: totalSales / lastWeek.length,
        salesByDay: lastWeek.reverse(),
        salesByCategory,
      };
      const doc = generateReport(reportData);
      // Print logic
      if (window.electronAPI && window.electronAPI.printPDF) {
        window.electronAPI.printPDF(doc.output('blob'));
      } else {
        const pdfBlob = doc.output('blob');
        const url = URL.createObjectURL(pdfBlob);
        const printWindow = window.open(url);
        if (printWindow) {
          printWindow.onload = () => {
            printWindow.print();
          };
        }
      }
      toast({
        title: 'Printing Report',
        description: 'The sales report is being printed.',
      });
    } catch (error) {
      toast({
        title: 'Print Failed',
        description: 'Failed to generate report',
        variant: 'destructive',
      });
    }
  };

  const navigationItems = [
    {
      name: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      path: '/dashboard',
      permission: true,
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      name: 'Sales',
      icon: <ShoppingCart className="h-5 w-5" />,
      path: '/sales',
      permission: checkPermission('create_sale'),
      color: 'text-green-600 dark:text-green-400',
    },
    {
      name: 'Products',
      icon: <Package className="h-5 w-5" />,
      path: '/products',
      permission: checkPermission('edit_products'),
      color: 'text-purple-600 dark:text-purple-400',
    },
    {
      name: 'Inventory',
      icon: <Store className="h-5 w-5" />,
      path: '/inventory',
      permission: checkPermission('manage_inventory'),
      color: 'text-orange-600 dark:text-orange-400',
    },
    {
      name: 'Suppliers',
      icon: <Building2 className="h-5 w-5" />,
      path: '/suppliers',
      permission: true,
      color: 'text-teal-600 dark:text-teal-400',
    },
    {
      name: 'Invoices',
      icon: <FileText className="h-5 w-5" />,
      path: '/invoices',
      permission: checkPermission('manage_invoices'),
      color: 'text-indigo-600 dark:text-indigo-400',
    },
    {
      name: 'Reports',
      icon: <BarChart3 className="h-5 w-5" />,
      path: '/reports',
      permission: checkPermission('view_reports'),
      color: 'text-red-600 dark:text-red-400',
    },
    {
      name: 'Users',
      icon: <Users className="h-5 w-5" />,
      path: '/users',
      permission: checkPermission('manage_users'),
      color: 'text-teal-600 dark:text-teal-400',
    },
    {
      name: 'Settings',
      icon: <Settings className="h-5 w-5" />,
      path: '/settings',
      permission: checkPermission('manage_settings'),
      color: 'text-gray-600 dark:text-gray-400',
    },
  ].filter(item => item.permission);

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-56 flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 shadow-xl transition-all duration-300 ease-in-out md:relative",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-16"
        )}
      >
        {/* Sidebar header */}
        <div className="flex h-16 items-center justify-between px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Store className="h-6 w-6" />
            </div>
            {sidebarOpen && (
              <div>
                <span className="font-bold text-lg">SuperPOS</span>
                <p className="text-xs text-green-100">Sri Lanka Edition</p>
              </div>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="text-white hover:bg-white/20 md:flex"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="text-white hover:bg-white/20 md:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Sidebar content */}
        <div className="flex flex-1 flex-col">
          <nav className="flex-1 space-y-2 px-3 py-4">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 group nav-item",
                  location.pathname === item.path
                    ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white",
                  !sidebarOpen && "justify-center px-3"
                )}
              >
                <TooltipProvider disableHoverableContent={sidebarOpen}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className={cn("flex items-center", sidebarOpen && "gap-3")}>
                        <span className={cn(
                          "transition-colors duration-200",
                          location.pathname === item.path ? "text-white" : item.color
                        )}>
                          {item.icon}
                        </span>
                        {sidebarOpen && <span className="text-current">{item.name}</span>}
                      </span>
                    </TooltipTrigger>
                    {!sidebarOpen && (
                      <TooltipContent side="right">
                        {item.name}
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </Link>
            ))}
          </nav>

          {/* Sync status */}
          <div className={cn("p-4 space-y-3", !sidebarOpen && "hidden")}>
            <Separator className="bg-slate-200 dark:bg-slate-700" />
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Database className="h-4 w-4" />
                    Sync Status
                  </span>
                  <Badge 
                    variant={isOnline ? "outline" : "destructive"}
                    className="text-xs"
                  >
                    {isOnline ? (
                      <span className="flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        Online
                      </span>
                    ) : (
                      "Offline"
                    )}
                  </Badge>
                </div>
                {pendingChanges > 0 && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 dark:text-slate-400">Pending changes</span>
                    <Badge variant="secondary">{pendingChanges}</Badge>
                  </div>
                )}
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 dark:text-slate-400">Last synced</span>
                  <span className="text-muted-foreground">{formatLastSyncTime()}</span>
                </div>
                <Button 
                  size="sm" 
                  className="w-full mt-1 btn-primary"
                  onClick={syncNow}
                  disabled={!isOnline || syncStatus === 'syncing' || pendingChanges === 0}
                >
                  <ArrowUpDown className="h-4 w-4 mr-1" />
                  {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}
                </Button>
              </div>
            </div>
          </div>

          {/* User section */}
          <div className="border-t border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800">
            {sidebarOpen ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-full h-10 w-10 bg-gradient-to-r from-green-500 to-green-600 text-white flex items-center justify-center font-bold">
                    {user?.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{user?.name}</p>
                    <p className="text-xs text-muted-foreground capitalize flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      {user?.role.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 dropdown-menu-trigger"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="dark:bg-slate-800 dark:border-slate-700">
                    <DropdownMenuItem 
                      onClick={() => setTheme('light')}
                      className="dark:text-slate-200 dark:hover:bg-slate-700 bg-white dark:bg-slate-800"
                    >
                      <Sun className="h-4 w-4 mr-2" />
                      Light Theme
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setTheme('dark')}
                      className="dark:text-slate-200 dark:hover:bg-slate-700 bg-white dark:bg-slate-800"
                    >
                      <Moon className="h-4 w-4 mr-2" />
                      Dark Theme
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="dark:text-slate-200 dark:hover:bg-slate-700 bg-white dark:bg-slate-800 font-medium"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="rounded-full h-10 w-10 bg-gradient-to-r from-green-500 to-green-600 text-white flex items-center justify-center font-bold">
                        {user?.name.charAt(0)}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {user?.name} - {user?.role.replace('_', ' ')}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 bg-white dark:bg-slate-900"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="dark:bg-slate-800 dark:border-slate-700">
                    <DropdownMenuItem 
                      onClick={() => setTheme('light')}
                      className="dark:text-slate-200 dark:hover:bg-slate-700 bg-white dark:bg-slate-800"
                    >
                      <Sun className="h-4 w-4 mr-2" />
                      Light
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => setTheme('dark')}
                      className="dark:text-slate-200 dark:hover:bg-slate-700 bg-white dark:bg-slate-800"
                    >
                      <Moon className="h-4 w-4 mr-2" />
                      Dark
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="dark:text-slate-200 dark:hover:bg-slate-700 bg-white dark:bg-slate-800 font-medium"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <div className="container mx-auto px-6 py-6 max-w-7xl h-full">
            <Outlet />
          </div>
        </main>
      </div>
      <CalculatorComponent open={calculatorOpen} onOpenChange={setCalculatorOpen} />
    </div>
  );
};

export default DashboardLayout;