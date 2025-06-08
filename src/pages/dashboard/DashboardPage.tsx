import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingCart, Package, CreditCard, TrendingUp, 
  AlertTriangle, Users, ArrowUpRight, ArrowDownRight 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockDashboardData } from '@/utils/mockData';

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  trend: number;
  icon: React.ReactNode;
  linkTo?: string;
}

const StatCard = ({ title, value, description, trend, icon, linkTo }: StatCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
      <CardFooter>
        <div className="flex items-center text-sm">
          {trend > 0 ? (
            <span className="flex items-center text-green-500">
              <ArrowUpRight className="mr-1 h-4 w-4" />
              {trend}%
            </span>
          ) : (
            <span className="flex items-center text-red-500">
              <ArrowDownRight className="mr-1 h-4 w-4" />
              {Math.abs(trend)}%
            </span>
          )}
          <span className="ml-1 text-muted-foreground">from last month</span>
        </div>
        {linkTo && (
          <Link to={linkTo} className="ml-auto">
            <Button variant="link" size="sm" className="h-auto p-0">
              View Details
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  );
};

const DashboardPage = () => {
  const { user, checkPermission } = useAuth();
  const [period, setPeriod] = useState('today');
  const [salesData, setSalesData] = useState(mockDashboardData.sales);
  const [lowStockItems, setLowStockItems] = useState(mockDashboardData.lowStockItems);
  const [recentInvoices, setRecentInvoices] = useState(mockDashboardData.recentInvoices);

  useEffect(() => {
    // In a real app, we would fetch data based on the selected period
    if (period === 'today') {
      setSalesData(mockDashboardData.sales);
    } else if (period === 'week') {
      setSalesData({
        ...mockDashboardData.sales,
        total: mockDashboardData.sales.total * 5.7,
        count: mockDashboardData.sales.count * 6.3,
        trend: 12.8
      });
    } else if (period === 'month') {
      setSalesData({
        ...mockDashboardData.sales,
        total: mockDashboardData.sales.total * 22.4,
        count: mockDashboardData.sales.count * 23.1,
        trend: 8.2
      });
    }
  }, [period]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}! Here's an overview of your business.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Tabs value={period} onValueChange={setPeriod} className="w-[400px]">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="week">This Week</TabsTrigger>
              <TabsTrigger value="month">This Month</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {checkPermission('create_sale') && (
            <Link to="/sales">
              <Button>
                <ShoppingCart className="mr-2 h-4 w-4" />
                New Sale
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Sales" 
          value={`₹${salesData.total.toLocaleString()}`} 
          description={`${salesData.count} transactions`}
          trend={salesData.trend}
          icon={<ShoppingCart className="h-4 w-4" />}
          linkTo="/reports"
        />
        <StatCard 
          title="Products" 
          value={mockDashboardData.products.count} 
          description={`${mockDashboardData.products.categories} categories`}
          trend={mockDashboardData.products.trend}
          icon={<Package className="h-4 w-4" />}
          linkTo="/products"
        />
        <StatCard 
          title="Revenue" 
          value={`₹${mockDashboardData.revenue.total.toLocaleString()}`} 
          description="After tax & discounts"
          trend={mockDashboardData.revenue.trend}
          icon={<CreditCard className="h-4 w-4" />}
          linkTo="/reports"
        />
        <StatCard 
          title="Active Users" 
          value={mockDashboardData.users.active} 
          description={`of ${mockDashboardData.users.total} total users`}
          trend={mockDashboardData.users.trend}
          icon={<Users className="h-4 w-4" />}
          linkTo="/users"
        />
      </div>

      {/* Content grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Top selling products */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>
              Your best performing products for this period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockDashboardData.topProducts.map((product) => (
                <div key={product.id} className="flex items-center">
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{product.name}</span>
                      <span className="text-sm font-medium">₹{product.sales.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center">
                      <Progress value={product.percentage} className="h-2 flex-1" />
                      <span className="ml-2 text-xs text-muted-foreground">{product.percentage}%</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-muted-foreground">{product.quantity} units</span>
                      <Badge variant="outline" className="text-xs">
                        {product.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Link to="/reports" className="w-full">
              <Button variant="outline" className="w-full">View All Products</Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Recent Invoices */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
            <CardDescription>
              Latest {recentInvoices.length} invoices processed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      INV-{invoice.id}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {invoice.date} · {invoice.items} items
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-sm font-medium">₹{invoice.total.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{invoice.customer}</p>
                    </div>
                    <Badge variant={invoice.status === 'Paid' ? 'default' : 'outline'}>
                      {invoice.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Link to="/invoices" className="w-full">
              <Button variant="outline" className="w-full">View All Invoices</Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Low stock alert */}
        {lowStockItems.length > 0 && (
          <Card className="col-span-7">
            <CardHeader className="flex flex-row items-center">
              <div className="flex-1">
                <CardTitle className="text-red-500 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Low Stock Alert
                </CardTitle>
                <CardDescription>
                  Products that require immediate restocking
                </CardDescription>
              </div>
              <Link to="/inventory">
                <Button variant="outline" size="sm">
                  Manage Inventory
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lowStockItems.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.category}</p>
                        </div>
                        <Badge variant="destructive">
                          {item.currentStock} left
                        </Badge>
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Current Stock</span>
                          <span>{item.currentStock} / {item.minStock}</span>
                        </div>
                        <Progress 
                          value={(item.currentStock / item.minStock) * 100} 
                          className="h-2" 
                          indicatorClassName="bg-red-500"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;