import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingCart, Package, CreditCard, TrendingUp, 
  AlertTriangle, Users, ArrowUpRight, ArrowDownRight,
  Calendar as CalendarIcon
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockDashboardData } from '@/utils/mockData';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

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
    <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">{title}</CardTitle>
        <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</div>
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
            <Button variant="link" size="sm" className="h-auto p-0 text-blue-600 dark:text-blue-400">
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
  const [date, setDate] = useState<Date | undefined>(new Date());

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
    } else if (period === 'year') {
      setSalesData({
        ...mockDashboardData.sales,
        total: mockDashboardData.sales.total * 265,
        count: mockDashboardData.sales.count * 280,
        trend: 15.5
      });
    } else if (period === 'custom' && date) {
      // In a real app, we would fetch data for the selected date
      setSalesData({
        ...mockDashboardData.sales,
        total: mockDashboardData.sales.total * 1.2,
        count: mockDashboardData.sales.count * 1.5,
        trend: 5.7
      });
    }
  }, [period, date]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}! Here's an overview of your business.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Tabs value={period} onValueChange={setPeriod} className="w-[500px]">
            <TabsList className="grid w-full grid-cols-5 bg-slate-100 dark:bg-slate-800">
              <TabsTrigger value="today" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 text-slate-700 dark:text-slate-300">Today</TabsTrigger>
              <TabsTrigger value="week" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 text-slate-700 dark:text-slate-300">This Week</TabsTrigger>
              <TabsTrigger value="month" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 text-slate-700 dark:text-slate-300">This Month</TabsTrigger>
              <TabsTrigger value="year" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 text-slate-700 dark:text-slate-300">This Year</TabsTrigger>
              <TabsTrigger value="custom" className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 text-slate-700 dark:text-slate-300">Custom</TabsTrigger>
            </TabsList>
          </Tabs>

          {period === 'custom' && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[200px] justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          )}
          
          {checkPermission('create_sale') && (
            <Link to="/sales">
              <Button className="btn-primary">
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
          value={`Rs ${salesData.total.toLocaleString()}`} 
          description={`${salesData.count} transactions`}
          trend={salesData.trend}
          icon={<ShoppingCart className="h-4 w-4 text-green-600 dark:text-green-400" />}
          linkTo="/reports"
        />
        <StatCard 
          title="Products" 
          value={mockDashboardData.products.count} 
          description={`${mockDashboardData.products.categories} categories`}
          trend={mockDashboardData.products.trend}
          icon={<Package className="h-4 w-4 text-purple-600 dark:text-purple-400" />}
          linkTo="/products"
        />
        <StatCard 
          title="Revenue" 
          value={`Rs ${mockDashboardData.revenue.total.toLocaleString()}`} 
          description="After tax & discounts"
          trend={mockDashboardData.revenue.trend}
          icon={<CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
          linkTo="/reports"
        />
        <StatCard 
          title="Active Users" 
          value={mockDashboardData.users.active} 
          description={`of ${mockDashboardData.users.total} total users`}
          trend={mockDashboardData.users.trend}
          icon={<Users className="h-4 w-4 text-orange-600 dark:text-orange-400" />}
          linkTo="/users"
        />
      </div>

      {/* Content grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Top selling products */}
        <Card className="col-span-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-slate-100">Top Selling Products</CardTitle>
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
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{product.name}</span>
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Rs {product.sales.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center">
                      <Progress value={product.percentage} className="h-2 flex-1" />
                      <span className="ml-2 text-xs text-muted-foreground">{product.percentage}%</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-muted-foreground">{product.quantity} units</span>
                      <Badge variant="outline" className="text-xs border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300">
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
              <Button variant="outline" className="w-full border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">View All Products</Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Recent Invoices */}
        <Card className="col-span-3 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-slate-100">Recent Invoices</CardTitle>
            <CardDescription>
              Latest {recentInvoices.length} invoices processed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0 border-slate-200 dark:border-slate-700">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none text-slate-900 dark:text-slate-100">
                      INV-{invoice.id}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {invoice.date} · {invoice.items} items
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Rs {invoice.total.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{invoice.customer}</p>
                    </div>
                    <Badge variant={invoice.status === 'Paid' ? 'default' : 'outline'} className={invoice.status === 'Paid' ? 'bg-green-600 text-white' : 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300'}>
                      {invoice.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Link to="/invoices" className="w-full">
              <Button variant="outline" className="w-full border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">View All Invoices</Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Low stock alert */}
        {lowStockItems.length > 0 && (
          <Card className="col-span-7 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader className="flex flex-row items-center">
              <div className="flex-1">
                <CardTitle className="text-red-500 dark:text-red-400 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Low Stock Alert
                </CardTitle>
                <CardDescription>
                  Products that require immediate restocking
                </CardDescription>
              </div>
              <Link to="/inventory">
                <Button variant="outline" size="sm" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                  Manage Inventory
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lowStockItems.map((item) => (
                  <Card key={item.id} className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.category}</p>
                        </div>
                        <Badge variant="destructive">
                          {item.currentStock} left
                        </Badge>
                      </div>
                      <div className="mt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-700 dark:text-slate-300">Current Stock</span>
                          <span className="text-slate-700 dark:text-slate-300">{item.currentStock} / {item.minStock}</span>
                        </div>
                        <Progress 
                          value={(item.currentStock / item.minStock) * 100} 
                          className="h-2 [&>div]:bg-red-500" 
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