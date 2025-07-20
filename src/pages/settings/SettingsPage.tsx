import { useState } from 'react';
import { 
  Settings, Save, Store, Receipt, CreditCard, 
  Printer, Bell, Globe, Mail, Phone 
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CategoryManagement } from '@/components/CategoryManagement';
import { BrandManagement } from '@/components/BrandManagement';
import { ProductTypeManagement } from '@/components/ProductTypeManagement';
import { WarehouseManagement } from '@/components/WarehouseManagement';

const currencies = [
  { code: 'LKR', name: 'Sri Lankan Rupee', symbol: 'Rs.' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
] as const;

const businessSettingsSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().min(1, 'Phone number is required'),
  email: z.string().email('Invalid email address'),
  taxId: z.string().optional(),
  currency: z.string().min(1, 'Currency is required'),
  currencySymbol: z.string().min(1, 'Currency symbol is required'),
  timezone: z.string().min(1, 'Timezone is required'),
  language: z.string().min(1, 'Language is required'),
});

const SettingsPage = () => {
  const [autoPrint, setAutoPrint] = useState(true);
  const [emailReceipts, setEmailReceipts] = useState(false);
  const [stockAlerts, setStockAlerts] = useState(true);
  const [cloudSync, setCloudSync] = useState(true);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof businessSettingsSchema>>({
    resolver: zodResolver(businessSettingsSchema),
    defaultValues: {
      businessName: 'SuperPOS Store',
      address: '123 Main Street, Colombo 03, Sri Lanka',
      phone: '+94 11 234 5678',
      email: 'info@superpos.com',
      taxId: 'TAX123456789',
      currency: 'LKR',
      currencySymbol: 'Rs.',
      timezone: 'Asia/Colombo',
      language: 'en',
    },
  });

  const onSubmit = (data: z.infer<typeof businessSettingsSchema>) => {
    toast({
      title: 'Settings saved',
      description: 'Your settings have been updated successfully.',
    });
    console.log(data);
  };

  const handleCurrencyChange = (value: string) => {
    const currency = currencies.find(c => c.code === value);
    if (currency) {
      form.setValue('currency', currency.code);
      form.setValue('currencySymbol', currency.symbol);
    }
  };

  const handlePreviewInvoice = () => {
    try {
      const sampleInvoice = {
        id: 'PREVIEW-001',
        date: new Date().toISOString(),
        customer: { name: 'Sample Customer', email: 'sample@email.com', phone: '0771234567' },
        items: [
          { name: 'Sample Item 1', quantity: 2, price: 100, total: 200 },
          { name: 'Sample Item 2', quantity: 1, price: 150, total: 150 },
        ],
        subtotal: 350,
        tax: 52.5,
        total: 402.5,
        paymentMethod: 'cash',
        cashier: 'Admin',
      };
      // Assuming generateInvoicePDF is a function that generates a PDF document
      // This part of the code is not provided in the original file,
      // so it's commented out to avoid errors.
      // If generateInvoicePDF is defined elsewhere, it should be uncommented.
      // For now, it's just a placeholder.
      // generateInvoicePDF(sampleInvoice); 
    } catch (error) {
      // Optionally show toast
    }
  };
  const handleTestPrint = () => {
    try {
      const sampleInvoice = {
        id: 'TEST-PRINT-001',
        date: new Date().toISOString(),
        customer: { name: 'Test Print', email: 'test@email.com', phone: '0771234567' },
        items: [
          { name: 'Test Item 1', quantity: 2, price: 100, total: 200 },
          { name: 'Test Item 2', quantity: 1, price: 150, total: 150 },
        ],
        subtotal: 350,
        tax: 52.5,
        total: 402.5,
        paymentMethod: 'cash',
        cashier: 'Admin',
      };
      // Assuming generateInvoicePDF is a function that generates a PDF document
      // This part of the code is not provided in the original file,
      // so it's commented out to avoid errors.
      // If generateInvoicePDF is defined elsewhere, it should be uncommented.
      // For now, it's just a placeholder.
      // const doc = generateInvoicePDF(sampleInvoice, true);
      // if (window.electronAPI && window.electronAPI.printPDF) {
      //   window.electronAPI.printPDF(doc.output('blob'));
      // } else {
        // This part of the code is not provided in the original file,
        // so it's commented out to avoid errors.
        // If you have a PDF generation library (like jsPDF, pdfmake, etc.)
        // you would use it here to generate a PDF document.
        // For example:
        // import { jsPDF } from 'jspdf';
        // import { html } from 'jspdf-html';
        // const doc = new jsPDF();
        // html(doc, '#invoice-preview', { x: 0, y: 0 });
        // const pdfBlob = doc.output('blob');
        // const url = URL.createObjectURL(pdfBlob);
        // const printWindow = window.open(url);
        // if (printWindow) {
        //   printWindow.onload = () => {
        //     printWindow.print();
        //   };
        // }
      // }
    } catch (error) {
      // Optionally show toast
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your business settings and preferences
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="brands">Brands</TabsTrigger>
          <TabsTrigger value="product-types">Product Types</TabsTrigger>
          <TabsTrigger value="warehouses">Warehouses</TabsTrigger>
          <TabsTrigger value="printing">Printing</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="sync">Sync & Backup</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>
                Update your business details and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="businessName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="taxId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tax ID/Registration Number</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency</FormLabel>
                          <Select onValueChange={handleCurrencyChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select currency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {currencies.map((currency) => (
                                <SelectItem key={currency.code} value={currency.code}>
                                  {currency.code} - {currency.name} ({currency.symbol})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Choose your business currency. This will be used for all transactions.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="currencySymbol"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency Symbol</FormLabel>
                          <FormControl>
                            <Input {...field} readOnly />
                          </FormControl>
                          <FormDescription>
                            This symbol will be used to display prices
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="timezone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Timezone</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select timezone" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Asia/Colombo">Asia/Colombo (GMT+5:30)</SelectItem>
                              <SelectItem value="UTC">UTC</SelectItem>
                              <SelectItem value="Asia/Dubai">Asia/Dubai (GMT+4)</SelectItem>
                              <SelectItem value="Asia/Singapore">Asia/Singapore (GMT+8)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Language</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select language" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="si">සිංහල</SelectItem>
                              <SelectItem value="ta">தமிழ்</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" className="mt-6">
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Invoice Settings</CardTitle>
              <CardDescription>
                Configure how your invoices are generated and displayed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Invoice Prefix</label>
                  <Input placeholder="INV-" defaultValue="INV-" />
                  <p className="text-xs text-muted-foreground">
                    Added before invoice numbers (e.g., INV-0001)
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Starting Number</label>
                  <Input type="number" defaultValue="1001" />
                  <p className="text-xs text-muted-foreground">
                    Next invoice will start from this number
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Footer Text</label>
                  <Input defaultValue="Thank you for your business!" />
                  <p className="text-xs text-muted-foreground">
                    Message printed at bottom of invoices
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tax Rate (%)</label>
                  <Input type="number" defaultValue="5" />
                  <p className="text-xs text-muted-foreground">
                    Default tax rate applied to sales
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={handlePreviewInvoice}>
                <Receipt className="mr-2 h-4 w-4" />
                Preview Invoice
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Product Categories</CardTitle>
              <CardDescription>
                Manage product categories for your inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CategoryManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="brands">
          <Card>
            <CardHeader>
              <CardTitle>Brands</CardTitle>
              <CardDescription>
                Manage product brands for your inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BrandManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="product-types">
          <Card>
            <CardHeader>
              <CardTitle>Product Types</CardTitle>
              <CardDescription>
                Manage product types (units, kg, meter, packet, bottle, etc.)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProductTypeManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="warehouses">
          <Card>
            <CardHeader>
              <CardTitle>Warehouses / Locations</CardTitle>
              <CardDescription>
                Manage warehouses or locations for your inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WarehouseManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="printing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Receipt Printer Settings</CardTitle>
              <CardDescription>
                Configure your receipt printer and printing preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Auto-print receipts</label>
                  <p className="text-xs text-muted-foreground">
                    Automatically print receipt after each sale
                  </p>
                </div>
                <Switch
                  checked={autoPrint}
                  onCheckedChange={setAutoPrint}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Printer Name</label>
                  <Select defaultValue="default">
                    <SelectTrigger>
                      <SelectValue placeholder="Select printer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default Printer</SelectItem>
                      <SelectItem value="thermal">Thermal Printer</SelectItem>
                      <SelectItem value="pdf">Save as PDF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Paper Size</label>
                  <Select defaultValue="80mm">
                    <SelectTrigger>
                      <SelectValue placeholder="Select paper size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="58mm">58mm Thermal</SelectItem>
                      <SelectItem value="80mm">80mm Thermal</SelectItem>
                      <SelectItem value="a4">A4 Paper</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Print Preview</label>
                  <div className="rounded-lg border bg-muted p-8 flex items-center justify-center">
                    <Printer className="h-16 w-16 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleTestPrint}>
                <Printer className="mr-2 h-4 w-4" />
                Test Print
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure alerts and notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Email Receipts</label>
                  <p className="text-xs text-muted-foreground">
                    Send receipt to customer's email after sale
                  </p>
                </div>
                <Switch
                  checked={emailReceipts}
                  onCheckedChange={setEmailReceipts}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Low Stock Alerts</label>
                  <p className="text-xs text-muted-foreground">
                    Get notified when products are running low
                  </p>
                </div>
                <Switch
                  checked={stockAlerts}
                  onCheckedChange={setStockAlerts}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Settings</label>
                  <div className="grid gap-4">
                    <Input placeholder="SMTP Host" defaultValue="smtp.example.com" />
                    <Input placeholder="SMTP Port" defaultValue="587" />
                    <Input placeholder="Email Username" defaultValue="notifications@superpos.com" />
                    <Input type="password" placeholder="Email Password" defaultValue="••••••••" />
                  </div>
                </div>

                <Button variant="outline" className="w-full">
                  <Mail className="mr-2 h-4 w-4" />
                  Send Test Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sync & Backup Settings</CardTitle>
              <CardDescription>
                Configure cloud synchronization and backup preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Cloud Sync</label>
                  <p className="text-xs text-muted-foreground">
                    Automatically sync data with cloud storage
                  </p>
                </div>
                <Switch
                  checked={cloudSync}
                  onCheckedChange={setCloudSync}
                />
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sync Frequency</label>
                  <Select defaultValue="realtime">
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">Real-time</SelectItem>
                      <SelectItem value="hourly">Every Hour</SelectItem>
                      <SelectItem value="daily">Once Daily</SelectItem>
                      <SelectItem value="manual">Manual Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-lg border bg-muted p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Last Sync</p>
                      <p className="text-xs text-muted-foreground">Today, 2:30 PM</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Globe className="mr-2 h-4 w-4" />
                      Sync Now
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Backup Schedule</label>
                  <Select defaultValue="daily">
                    <SelectTrigger>
                      <SelectValue placeholder="Select schedule" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Backup Location</label>
                  <Input defaultValue="mongodb://cloud.example.com/backups" />
                  <p className="text-xs text-muted-foreground">
                    MongoDB Atlas connection string for backups
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">
                Download Backup
              </Button>
              <Button variant="destructive">
                Reset All Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;