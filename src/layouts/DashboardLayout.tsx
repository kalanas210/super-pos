import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Store, ShoppingCart, Package, FileText, 
  BarChart3, Users, Settings, Menu, X, LogOut, ArrowUpDown,
  Moon, Sun, Bell
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

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout, checkPermission } = useAuth();
  const { theme, setTheme } = useTheme();
  const { isOnline, pendingChanges, syncNow, syncStatus, lastSyncTime } = useSync();
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

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

  const navigationItems = [
    {
      name: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      path: '/dashboard',
      permission: true,
    },
    {
      name: 'Sales',
      icon: <ShoppingCart className="h-5 w-5" />,
      path: '/sales',
      permission: checkPermission('create_sale'),
    },
    {
      name: 'Products',
      icon: <Package className="h-5 w-5" />,
      path: '/products',
      permission: checkPermission('edit_products'),
    },
    {
      name: 'Inventory',
      icon: <Store className="h-5 w-5" />,
      path: '/inventory',
      permission: checkPermission('manage_inventory'),
    },
    {
      name: 'Invoices',
      icon: <FileText className="h-5 w-5" />,
      path: '/invoices',
      permission: checkPermission('manage_invoices'),
    },
    {
      name: 'Reports',
      icon: <BarChart3 className="h-5 w-5" />,
      path: '/reports',
      permission: checkPermission('view_reports'),
    },
    {
      name: 'Users',
      icon: <Users className="h-5 w-5" />,
      path: '/users',
      permission: checkPermission('manage_users'),
    },
    {
      name: 'Settings',
      icon: <Settings className="h-5 w-5" />,
      path: '/settings',
      permission: checkPermission('manage_settings'),
    },
  ].filter(item => item.permission);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-card border-r transition-all duration-300 ease-in-out md:relative",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-16"
        )}
      >
        {/* Sidebar header */}
        <div className="flex h-16 items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <Store className="h-6 w-6 text-primary" />
            {sidebarOpen && <span className="font-bold text-lg">SuperPOS</span>}
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="md:flex hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="md:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Sidebar content */}
        <div className="flex flex-1 flex-col">
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  location.pathname === item.path
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  !sidebarOpen && "justify-center px-3"
                )}
              >
                <TooltipProvider disableHoverableContent={sidebarOpen}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className={cn("flex items-center", sidebarOpen && "gap-3")}>
                        {item.icon}
                        {sidebarOpen && <span>{item.name}</span>}
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
          <div className={cn("p-3 space-y-3", !sidebarOpen && "hidden")}>
            <Separator />
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium">Sync Status</span>
                <Badge 
                  variant={isOnline ? "outline" : "destructive"}
                  className="text-xs"
                >
                  {isOnline ? "Online" : "Offline"}
                </Badge>
              </div>
              {pendingChanges > 0 && (
                <div className="flex justify-between items-center text-xs">
                  <span>Pending changes</span>
                  <Badge variant="secondary">{pendingChanges}</Badge>
                </div>
              )}
              <div className="flex justify-between items-center text-xs">
                <span>Last synced</span>
                <span className="text-muted-foreground">{formatLastSyncTime()}</span>
              </div>
              <Button 
                size="sm" 
                className="w-full mt-1"
                variant="outline"
                onClick={syncNow}
                disabled={!isOnline || syncStatus === 'syncing' || pendingChanges === 0}
              >
                <ArrowUpDown className="h-4 w-4 mr-1" />
                {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}
              </Button>
            </div>
          </div>

          {/* User section */}
          <div className="border-t p-4">
            {sidebarOpen ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="rounded-full h-8 w-8 bg-primary text-primary-foreground flex items-center justify-center">
                    {user?.name.charAt(0)}
                  </div>
                  <div className="ml-2">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user?.role.replace('_', ' ')}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setTheme('light')}>
                      <Sun className="h-4 w-4 mr-2" />
                      Light
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme('dark')}>
                      <Moon className="h-4 w-4 mr-2" />
                      Dark
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
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
                      <div className="rounded-full h-8 w-8 bg-primary text-primary-foreground flex items-center justify-center">
                        {user?.name.charAt(0)}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {user?.name} - {user?.role.replace('_', ' ')}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top navbar */}
        <header className="h-16 border-b bg-card flex items-center justify-between px-4">
          <div className="flex items-center md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          <div className="ml-auto flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="outline" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-muted/30 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;