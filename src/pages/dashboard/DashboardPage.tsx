import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart, Package, CreditCard, TrendingUp, TrendingDown, AlertTriangle, Users, Printer, BarChart3, PieChart, LineChart, RefreshCw, Settings, Info, ArrowUpRight, ArrowDownRight, Calendar, ChevronDown
} from 'lucide-react';
import {
  BarChart as ReBarChart, Bar, XAxis, YAxis, Tooltip as ReTooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell, LineChart as ReLineChart, Line, Legend
} from 'recharts';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { mockDashboardData } from '@/utils/mockData';
import { ChartContainer } from '@/components/ui/chart';
import { format } from 'date-fns';

// Mock data for charts
const salesVsPurchases = [
  { day: 'Mon', sales: 12000, purchases: 8000 },
  { day: 'Tue', sales: 18000, purchases: 12000 },
  { day: 'Wed', sales: 22000, purchases: 15000 },
  { day: 'Thu', sales: 26000, purchases: 17000 },
  { day: 'Fri', sales: 24000, purchases: 16000 },
  { day: 'Sat', sales: 25000, purchases: 18000 },
  { day: 'Sun', sales: 17000, purchases: 11000 },
];
const topProducts = [
  { name: 'Red Chili Powder', value: 120 },
  { name: 'Coconut Powder', value: 90 },
  { name: 'Turmeric Powder', value: 80 },
  { name: 'Coriander Seeds', value: 60 },
  { name: 'Cumin Seeds', value: 50 },
];
const monthlyProfit = [
  { month: 'Jan', profit: 40000 },
  { month: 'Feb', profit: 45000 },
  { month: 'Mar', profit: 50000 },
  { month: 'Apr', profit: 60000 },
  { month: 'May', profit: 65000 },
  { month: 'Jun', profit: 70000 },
  { month: 'Jul', profit: 75000 },
  { month: 'Aug', profit: 72000 },
  { month: 'Sep', profit: 68000 },
  { month: 'Oct', profit: 70000 },
  { month: 'Nov', profit: 73000 },
  { month: 'Dec', profit: 80000 },
];
const salesTrend = [
  { week: 'W1', revenue: 12000, profit: 4000 },
  { week: 'W2', revenue: 15000, profit: 5000 },
  { week: 'W3', revenue: 18000, profit: 6000 },
  { week: 'W4', revenue: 22000, profit: 7000 },
  { week: 'W5', revenue: 26000, profit: 8000 },
];

// Mock data for top selling products and recent invoices
const topSellingProductsList = [
  { name: 'Rice - Basmati (5kg)', sales: 4500, units: 10, percent: 85, category: 'Groceries', color: 'bg-green-500' },
  { name: 'Sunflower Oil (1L)', sales: 2800, units: 20, percent: 72, category: 'Groceries', color: 'bg-yellow-400' },
  { name: 'Potato Chips (Large)', sales: 2000, units: 50, percent: 65, category: 'Snacks', color: 'bg-blue-500' },
  { name: 'Biscuits (Pack)', sales: 1750, units: 70, percent: 58, category: 'Snacks', color: 'bg-purple-500' },
];
const recentInvoices = [
  { id: 'INV-10057', date: '2023-04-18', items: 8, customer: 'Rajiv Kumar', amount: 1450, status: 'Paid' },
  { id: 'INV-10056', date: '2023-04-18', items: 5, customer: 'Anika Silva', amount: 870, status: 'Paid' },
  { id: 'INV-10055', date: '2023-04-17', items: 12, customer: 'Malik Fernando', amount: 2240, status: 'Pending' },
  { id: 'INV-10054', date: '2023-04-17', items: 7, customer: 'Priya Patel', amount: 1100, status: 'Paid' },
];

// Mock data for top stock products and top customers
const topStockProducts = [
  { name: 'Rice - Basmati (5kg)', stock: 120, category: 'Groceries', color: 'bg-green-500' },
  { name: 'Sunflower Oil (1L)', stock: 90, category: 'Groceries', color: 'bg-yellow-400' },
  { name: 'Potato Chips (Large)', stock: 80, category: 'Snacks', color: 'bg-blue-500' },
  { name: 'Biscuits (Pack)', stock: 75, category: 'Snacks', color: 'bg-pink-500' },
];
const topCustomers = [
  { name: 'Nimal Perera', purchases: 15, total: 45000, status: 'VIP', color: 'bg-purple-500' },
  { name: 'Samanthi Silva', purchases: 12, total: 38000, status: 'Regular', color: 'bg-blue-500' },
  { name: 'Ruwan Jayasuriya', purchases: 10, total: 32000, status: 'Regular', color: 'bg-green-500' },
  { name: 'Dilani Fernando', purchases: 8, total: 25000, status: 'New', color: 'bg-orange-500' },
];

// Dummy customer feedbacks (Google reviews style)
const dummyFeedbacks = [
  {
    name: 'Nimal Perera',
    rating: 5,
    comment: 'Excellent service and great product selection! Highly recommended.',
    date: '2024-06-01',
  },
  {
    name: 'Samanthi Silva',
    rating: 4,
    comment: 'Friendly staff and quick checkout. Will visit again.',
    date: '2024-05-28',
  },
  {
    name: 'Ruwan Jayasuriya',
    rating: 5,
    comment: 'Best POS experience in Colombo. Clean and modern store.',
    date: '2024-05-25',
  },
  {
    name: 'Dilani Fernando',
    rating: 3,
    comment: 'Good prices but sometimes out of stock on popular items.',
    date: '2024-05-20',
  },
];

// Dummy promotions
const initialPromotions = [
  { title: 'Buy 1 Get 1 Free on Sunflower Oil', validTill: '2024-06-15', description: 'Limited time offer on all 1L Sunflower Oil packs.' },
  { title: '10% Off on All Spices', validTill: '2024-06-10', description: 'Get 10% discount on all spice powders and seeds.' },
];

export default function DashboardPage() {
  // Stat cards data
  const stats = [
    { label: "Today's Sales", value: 25000, icon: <ShoppingCart className="h-8 w-8 text-blue-600" />, sub: 'Sales today', subColor: 'text-blue-500' },
    { label: "Today's Purchases", value: 15000, icon: <Package className="h-8 w-8 text-orange-500" />, sub: 'Purchases today', subColor: 'text-orange-500' },
    { label: 'Stock Value', value: 125000, icon: <CreditCard className="h-8 w-8 text-purple-600" />, sub: 'Inventory value', subColor: 'text-purple-600' },
    { label: 'Total Products', value: 45, icon: <Package className="h-8 w-8 text-violet-600" />, sub: 'Active items', subColor: 'text-violet-600' },
    { label: "Today's Profit", value: 7500, icon: <TrendingUp className="h-8 w-8 text-green-600" />, sub: 'Net profit', subColor: 'text-green-600' },
    { label: 'Total Customers', value: 28, icon: <Users className="h-8 w-8 text-cyan-600" />, sub: 'Unique customers', subColor: 'text-cyan-600' },
  ];

  // Promotions state
  const [promotions, setPromotions] = useState(initialPromotions);
  const [newPromo, setNewPromo] = useState({ title: '', validTill: '', description: '' });
  const [addingPromo, setAddingPromo] = useState(false);

  return (
    <div className="space-y-6">
      {/* Dashboard header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="font-bold text-2xl text-blue-700">DS</span>
            </div>
            <div className="min-w-0">
              <div className="font-bold text-lg truncate">Good Morning, Welcome to Dilna Spices POS</div>
              <div className="flex items-center text-xs text-muted-foreground gap-1 mt-0.5">
                <Calendar className="h-4 w-4 mr-1 text-blue-500" />
                Today: {format(new Date(), 'M/d/yyyy')}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            Today <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
          <Button variant="default" size="sm" className="flex items-center gap-2">
            <Printer className="h-4 w-4" /> Print Report
          </Button>
          <Button variant="outline" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="rounded-xl shadow-sm p-0">
            <CardContent className="flex items-center justify-between h-24 p-4">
              <div className="flex flex-col justify-center flex-1 min-w-0">
                <div className="text-xs text-muted-foreground font-medium truncate">{stat.label}</div>
                <div className="text-lg font-bold leading-tight truncate mt-1">LKR {stat.value.toLocaleString()}</div>
                <div className={`text-xs font-semibold mt-1 ${stat.subColor}`}>{stat.sub}</div>
              </div>
              <div className="ml-4 flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800">
                {stat.icon}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System alert/info */}
      <Card className="bg-yellow-50 border-yellow-200 flex items-center px-6 py-4">
        <Info className="text-yellow-600 mr-3" />
        <div className="flex-1">
          <span className="font-semibold text-yellow-800">System Alert</span> — 3 products are running low on stock and require attention.
        </div>
        <Link to="/inventory">
          <Button variant="outline" className="ml-4">View Inventory</Button>
        </Link>
      </Card>

      {/* Top Selling Products & Recent Invoices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>Your best performing products for this period</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topSellingProductsList.map((prod) => (
              <div key={prod.name} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm truncate">{prod.name}</span>
                  <span className="font-bold text-slate-700">Rs {prod.sales.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{prod.units} units</span>
                  <Progress value={prod.percent} className="flex-1 h-2 mx-2 bg-slate-200" style={{ backgroundColor: '#f3f4f6' }} />
                  <span className="text-xs font-semibold text-slate-700">{prod.percent}%</span>
                  <Badge variant="secondary" className={`ml-2 ${prod.color} bg-opacity-20 text-xs font-medium`}>{prod.category}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        {/* Recent Invoices */}
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
            <CardDescription>Latest 4 invoices processed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentInvoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between border-b last:border-b-0 pb-2 last:pb-0">
                <div>
                  <div className="font-medium text-sm">{inv.id}</div>
                  <div className="text-xs text-muted-foreground">{inv.date} · {inv.items} items</div>
                  <div className="text-xs text-muted-foreground">{inv.customer}</div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-bold text-slate-700">Rs {inv.amount.toLocaleString()}</span>
                  <Badge variant={inv.status === 'Paid' ? 'outline' : 'secondary'} className={`text-xs font-medium ${inv.status === 'Paid' ? 'bg-green-100 text-green-700 border-green-300' : 'bg-yellow-100 text-yellow-700 border-yellow-300'}`}>{inv.status}</Badge>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full mt-2">View All Invoices</Button>
          </CardContent>
        </Card>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Sales vs Purchases, Top Selling Products, Monthly Profit Trend */}
        <div className="space-y-6 col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sales vs Purchases */}
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle>Sales vs Purchases</CardTitle>
                <CardDescription>Last 7 days comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}}>
                  <ResponsiveContainer width="100%" height={200}>
                    <ReBarChart data={salesVsPurchases} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <XAxis dataKey="day" />
                      <YAxis />
                      <ReTooltip />
                      <Legend />
                      <Bar dataKey="sales" fill="#059669" name="Sales" />
                      <Bar dataKey="purchases" fill="#f59e42" name="Purchases" />
                    </ReBarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
            {/* Top Selling Products */}
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
                <CardDescription>Top 5 by quantity this week</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}}>
                  <ResponsiveContainer width="100%" height={200}>
                    <RePieChart>
                      <Pie data={topProducts} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                        <Cell fill="#3b82f6" />
                        <Cell fill="#10b981" />
                        <Cell fill="#f59e42" />
                        <Cell fill="#f43f5e" />
                        <Cell fill="#a855f7" />
                      </Pie>
                      <ReTooltip />
                      <Legend />
                    </RePieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
          {/* Monthly Profit Trend */}
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle>Monthly Profit Trend</CardTitle>
              <CardDescription>Current year performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}}>
                <ResponsiveContainer width="100%" height={200}>
                  <ReLineChart data={monthlyProfit} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ReTooltip />
                    <Legend />
                    <Line type="monotone" dataKey="profit" stroke="#059669" strokeWidth={3} dot={false} name="Profit" />
                  </ReLineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
        {/* Right column: Sales Trend Analysis, Business Insights, Quick Actions */}
        <div className="space-y-6">
          {/* Sales Trend Analysis */}
          <Card className="rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Sales Trend Analysis</CardTitle>
                <CardDescription>Weekly revenue and profit trends</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">Daily</Button>
                <Button size="sm" variant="default">Weekly</Button>
                <Button size="sm" variant="outline">Monthly</Button>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}}>
                <ResponsiveContainer width="100%" height={120}>
                  <ReLineChart data={salesTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <XAxis dataKey="week" />
                    <YAxis />
                    <ReTooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={false} name="Revenue" />
                    <Line type="monotone" dataKey="profit" stroke="#059669" strokeWidth={2} dot={false} name="Profit" />
                  </ReLineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
          {/* Business Insights */}
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle>Business Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Profit Margin</span>
                <span className="font-bold text-green-600">30%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Best Selling Category</span>
                <span className="font-bold text-blue-600">Spice powders</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Inventory Turnover</span>
                <span className="font-bold text-purple-600">4.2x</span>
              </div>
            </CardContent>
          </Card>
          {/* Quick Actions */}
          <Card className="rounded-xl">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button variant="outline" className="flex items-center gap-2"><RefreshCw className="h-4 w-4" />Refresh</Button>
              <Button variant="outline" className="flex items-center gap-2"><Printer className="h-4 w-4" />Print Report</Button>
              <Button variant="outline" className="flex items-center gap-2"><Settings className="h-4 w-4" />Settings</Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Top Stock Products & Top Customers Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Top Stock Products */}
        <Card className="shadow-md border-0 bg-gradient-to-br from-green-50 to-white dark:from-slate-800 dark:to-slate-900">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold text-green-700 dark:text-green-300">Top Stock Products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topStockProducts.map((product, idx) => (
              <div key={product.name} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-900 dark:text-slate-100">{product.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{product.category}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${product.color} text-white`}>{product.stock} in stock</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        {/* Top Customers */}
        <Card className="shadow-md border-0 bg-gradient-to-br from-blue-50 to-white dark:from-slate-800 dark:to-slate-900">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold text-blue-700 dark:text-blue-300">Top Customers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topCustomers.map((customer, idx) => (
              <div key={customer.name} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-900 dark:text-slate-100">{customer.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{customer.purchases} purchases</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${customer.color} text-white`}>{customer.status}</span>
                  <span className="text-sm font-bold text-blue-700 dark:text-blue-300">LKR {customer.total.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* More sections after charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Customer Feedback */}
        <Card className="rounded-xl bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle>Customer Feedback</CardTitle>
            <CardDescription>Recent customer reviews and ratings</CardDescription>
          </CardHeader>
          <CardContent>
            {dummyFeedbacks.length === 0 ? (
              <div className="text-sm text-muted-foreground">No feedback yet. Coming soon!</div>
            ) : (
              <div className="space-y-4">
                {dummyFeedbacks.map((fb, idx) => (
                  <div key={idx} className="bg-white dark:bg-slate-900 rounded-lg p-3 shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{fb.name}</span>
                      <span className="flex items-center gap-0.5 ml-2">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < fb.rating ? 'text-yellow-400' : 'text-slate-300'}>★</span>
                        ))}
                      </span>
                      <span className="ml-auto text-xs text-muted-foreground">{fb.date}</span>
                    </div>
                    <div className="text-sm text-slate-700 dark:text-slate-200">{fb.comment}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        {/* Upcoming Promotions */}
        <Card className="rounded-xl bg-pink-50 border-pink-200">
          <CardHeader>
            <CardTitle>Upcoming Promotions</CardTitle>
            <CardDescription>Plan and track your next offers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {promotions.length === 0 && <div className="text-sm text-muted-foreground">No promotions scheduled.</div>}
              {promotions.map((promo, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900 rounded-lg p-3 shadow-sm border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-pink-700 dark:text-pink-300">{promo.title}</span>
                    <span className="text-xs text-muted-foreground">Valid till {promo.validTill}</span>
                  </div>
                  <div className="text-sm text-slate-700 dark:text-slate-200">{promo.description}</div>
                </div>
              ))}
              {addingPromo ? (
                <form className="space-y-2 mt-2" onSubmit={e => {
                  e.preventDefault();
                  if (!newPromo.title || !newPromo.validTill) return;
                  setPromotions([...promotions, newPromo]);
                  setNewPromo({ title: '', validTill: '', description: '' });
                  setAddingPromo(false);
                }}>
                  <input
                    className="w-full rounded border px-2 py-1 text-sm"
                    placeholder="Promotion Title"
                    value={newPromo.title}
                    onChange={e => setNewPromo({ ...newPromo, title: e.target.value })}
                    required
                  />
                  <input
                    className="w-full rounded border px-2 py-1 text-sm"
                    type="date"
                    value={newPromo.validTill}
                    onChange={e => setNewPromo({ ...newPromo, validTill: e.target.value })}
                    required
                  />
                  <textarea
                    className="w-full rounded border px-2 py-1 text-sm"
                    placeholder="Description (optional)"
                    value={newPromo.description}
                    onChange={e => setNewPromo({ ...newPromo, description: e.target.value })}
                  />
                  <div className="flex gap-2 mt-1">
                    <button type="submit" className="btn-primary px-3 py-1 rounded text-white">Add</button>
                    <button type="button" className="btn-secondary px-3 py-1 rounded text-white" onClick={() => setAddingPromo(false)}>Cancel</button>
                  </div>
                </form>
              ) : (
                <button className="btn-primary px-3 py-1 rounded text-white mt-2" onClick={() => setAddingPromo(true)}>
                  + Add Promotion
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}