import { useState } from 'react';
import { 
  BarChart3, Download, Calendar, Filter, 
  TrendingUp, TrendingDown, DollarSign, Package,
  Users, ShoppingCart, ArrowUpRight, ArrowDownRight,
  FileDown, Printer
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { mockDashboardData } from '@/utils/mockData';
import { generateSalesReport } from '@/utils/pdfGenerator';
import { format } from 'date-fns';

// Mock data for reports
const salesData = {
  daily: {
    total: 24850,
    count: 45,
    trend: 7.2,
    items: 156,
    averageOrder: 552,
  },
  weekly: {
    total: 158920,
    count: 287,
    trend: 5.4,
    items: 982,
    averageOrder: 554,
  },
  monthly: {
    total: 685400,
    count: 1245,
    trend: 12.8,
    items: 4268,
    averageOrder: 550,
  },
};

const topProducts = mockDashboardData.topProducts;

const salesByCategory = [
  { category: 'Groceries', sales: 285400, percentage: 42, trend: 8.5 },
  { category: 'Dairy', sales: 142300, percentage: 21, trend: -2.3 },
  { category: 'Snacks', sales: 98600, percentage: 14, trend: 15.7 },
  { category: 'Beverages', sales: 85400, percentage: 12, trend: 4.2 },
  { category: 'Personal Care', sales: 73700, percentage: 11, trend: 6.8 },
];

const ReportsPage = () => {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [category, setCategory] = useState('all');
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const { toast } = useToast();

  const currentData = salesData[period];

  const handleGeneratePDF = () => {
    try {
      const reportData = {
        period: period === 'daily' ? 'Daily' : period === 'weekly' ? 'Weekly' : 'Monthly',
        startDate,
        endDate,
        salesData: currentData,
        topProducts,
        salesByCategory,
      };

      const doc = generateSalesReport(reportData);
      doc.save(`sales-report-${period}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);

      toast({
        title: 'Report Generated',
        description: 'The sales report has been downloaded as a PDF.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate the report. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handlePrint = () => {
    try {
      const reportData = {
        period: period === 'daily' ? 'Daily' : period === 'weekly' ? 'Weekly' : 'Monthly',
        startDate,
        endDate,
        salesData: currentData,
        topProducts,
        salesByCategory,
      };
      const doc = generateSalesReport(reportData);
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
        description: 'Failed to print report',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            View and analyze your business performance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handleGeneratePDF}>
            <FileDown className="mr-2 h-4 w-4" />
            Generate PDF
          </Button>
          <Button onClick={handlePrint} variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Print Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Customize your report view
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="text-sm font-medium">Time Period</label>
              <Select value={period} onValueChange={(value: 'daily' | 'weekly' | 'monthly') => setPeriod(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {salesByCategory.map((cat) => (
                    <SelectItem key={cat.category} value={cat.category.toLowerCase()}>
                      {cat.category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Start Date</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">End Date</label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{currentData.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {currentData.count} transactions
            </p>
            <div className="mt-2 flex items-center text-sm">
              {currentData.trend > 0 ? (
                <span className="flex items-center text-green-500">
                  <ArrowUpRight className="mr-1 h-4 w-4" />
                  {currentData.trend}%
                </span>
              ) : (
                <span className="flex items-center text-red-500">
                  <ArrowDownRight className="mr-1 h-4 w-4" />
                  {Math.abs(currentData.trend)}%
                </span>
              )}
              <span className="ml-1 text-muted-foreground">from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentData.items}</div>
            <p className="text-xs text-muted-foreground">
              Across {currentData.count} orders
            </p>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-muted-foreground">
                Avg {(currentData.items / currentData.count).toFixed(1)} items per order
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{currentData.averageOrder}</div>
            <p className="text-xs text-muted-foreground">
              Per transaction
            </p>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-muted-foreground">
                Based on {currentData.count} orders
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <p className="text-xs text-muted-foreground">
              Unique customers
            </p>
            <div className="mt-2 flex items-center text-sm">
              <span className="flex items-center text-green-500">
                <ArrowUpRight className="mr-1 h-4 w-4" />
                12%
              </span>
              <span className="ml-1 text-muted-foreground">new customers</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Sales by Category</CardTitle>
          <CardDescription>
            Distribution of sales across different product categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {salesByCategory.map((cat) => (
              <div key={cat.category}>
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <span className="text-sm font-medium">{cat.category}</span>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span>₹{cat.sales.toLocaleString()}</span>
                      {cat.trend > 0 ? (
                        <span className="flex items-center text-green-500 ml-2">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          {cat.trend}%
                        </span>
                      ) : (
                        <span className="flex items-center text-red-500 ml-2">
                          <TrendingDown className="h-4 w-4 mr-1" />
                          {Math.abs(cat.trend)}%
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge variant="secondary">{cat.percentage}%</Badge>
                </div>
                <div className="h-2 bg-muted rounded-full">
                  <div 
                    className="h-2 bg-primary rounded-full" 
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Selling Products</CardTitle>
          <CardDescription>
            Products with the highest sales volume
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Sales</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Performance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.category}</Badge>
                  </TableCell>
                  <TableCell className="text-right">₹{product.sales.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{product.quantity} units</TableCell>
                  <TableCell className="text-right">
                    <Badge 
                      variant={product.percentage >= 70 ? "default" : "secondary"}
                    >
                      {product.percentage}% of target
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;