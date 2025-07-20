import { useState, useEffect } from 'react';
import { 
  ShoppingCart, Search, Trash2, Plus, Minus, 
  CreditCard, Printer, Receipt, User, Info, 
  Scan, Calculator, DollarSign, Percent, 
  Clock, CheckCircle, AlertCircle
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
// Remove mockProducts import
// import { mockProducts } from '@/utils/mockData';
import { cn } from '@/lib/utils';
import { PaymentSuccessDialog } from '@/components/PaymentSuccessDialog';
import { generateInvoicePDF } from '@/utils/pdfGenerator';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  barcode: string;
}

interface BillSummary {
  subtotal: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  discountAmount: number;
  tax: number;
  taxAmount: number;
  total: number;
}

const customerFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
});

const SalesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<any[]>([]); // Fetched from DB
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [billSummary, setBillSummary] = useState<BillSummary>({
    subtotal: 0,
    discount: 0,
    discountType: 'percentage',
    discountAmount: 0,
    tax: 5, // Default tax rate
    taxAmount: 0,
    total: 0,
  });
  const [showCheckout, setShowCheckout] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi'>('cash');
  const [cashReceived, setCashReceived] = useState<number>(0);
  const [customerData, setCustomerData] = useState<z.infer<typeof customerFormSchema> | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [currentInvoiceId, setCurrentInvoiceId] = useState<string>('');
  // Store the last invoice data for printing and PDF
  const [lastInvoiceData, setLastInvoiceData] = useState<any>(null);
  const [showBarcodeDialog, setShowBarcodeDialog] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  
  const { toast } = useToast();
  
  const customerForm = useForm<z.infer<typeof customerFormSchema>>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      address: '',
    },
  });

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch products from DB on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if ((window as any).electronAPI && (window as any).electronAPI.getProducts) {
          const dbProducts = await (window as any).electronAPI.getProducts();
          setProducts(dbProducts);
          setFilteredProducts(dbProducts);
        }
      } catch (err) {
        setProducts([]);
        setFilteredProducts([]);
      }
    };
    fetchProducts();
  }, []);

  // Filter products based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProducts(products);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredProducts(
        products.filter(
          (product) =>
            product.name.toLowerCase().includes(term) ||
            (product.barcode || '').includes(term) ||
            (product.category || '').toLowerCase().includes(term)
        )
      );
    }
  }, [searchTerm, products]);

  // Calculate bill summary whenever cart or discount changes
  useEffect(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
    const discountAmount = billSummary.discountType === 'percentage'
      ? (subtotal * billSummary.discount) / 100
      : billSummary.discount;
    
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = (afterDiscount * billSummary.tax) / 100;
    const total = afterDiscount + taxAmount;

    setBillSummary({
      ...billSummary,
      subtotal,
      discountAmount,
      taxAmount,
      total,
    });
    
    // Reset cash received if it's less than the new total
    if (cashReceived < total) {
      setCashReceived(Math.ceil(total));
    }
  }, [cart, billSummary.discount, billSummary.discountType, billSummary.tax]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Update handleBarcodeScan to use products from DB
  const handleBarcodeScan = (barcode: string) => {
    const product = products.find(p => p.barcode === barcode);
    if (product) {
      addToCart(product);
      toast({
        title: 'Product added',
        description: `${product.name} added to cart`,
      });
    } else {
      toast({
        title: 'Product not found',
        description: `No product found with barcode ${barcode}`,
        variant: 'destructive',
      });
    }
  };

  // Update all product lookups in cart logic to use products from DB
  const addToCart = (product: any) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      const maxQty = product.stock_quantity ?? product.stockQuantity ?? 0;
      if (existingItem) {
        if (existingItem.quantity >= maxQty) {
          toast({
            title: 'Stock limit reached',
            description: `Cannot add more than ${maxQty} units of ${product.name}`,
            variant: 'destructive',
          });
          return prevCart;
        }
        return prevCart.map(item =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * item.price
              }
            : item
        );
      } else {
        if (maxQty < 1) {
          toast({
            title: 'Out of stock',
            description: `${product.name} is currently out of stock`,
            variant: 'destructive',
          });
          return prevCart;
        }
        return [
          ...prevCart,
          {
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            subtotal: product.price,
            barcode: product.barcode,
          },
        ];
      }
    });
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    const product = products.find(p => p.id === id);
    const maxQty = product ? (product.stock_quantity ?? product.stockQuantity ?? 0) : 0;
    if (product && newQuantity > maxQty) {
      toast({
        title: 'Stock limit reached',
        description: `Cannot set quantity above available stock (${maxQty})`,
        variant: 'destructive',
      });
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === id
          ? {
              ...item,
              quantity: newQuantity,
              subtotal: newQuantity * item.price
            }
          : item
      )
    );
  };

  const removeFromCart = (id: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  const handleDiscountChange = (value: string, type: 'percentage' | 'fixed') => {
    const numValue = parseFloat(value) || 0;
    setBillSummary({
      ...billSummary,
      discount: numValue,
      discountType: type,
    });
  };

  const handleTaxChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    setBillSummary({
      ...billSummary,
      tax: numValue,
    });
  };

  const handleCustomerSubmit = (data: z.infer<typeof customerFormSchema>) => {
    setCustomerData(data);
    setShowCustomerForm(false);
    toast({
      title: 'Customer info saved',
      description: `Customer: ${data.name}`,
    });
  };

  const handlePayment = () => {
    if (cart.length === 0) {
      toast({
        title: 'Cart is empty',
        description: 'Please add items to cart before proceeding to payment',
        variant: 'destructive',
      });
      return;
    }

    if (paymentMethod === 'cash' && cashReceived < billSummary.total) {
      toast({
        title: 'Insufficient cash',
        description: 'Cash received is less than total amount',
        variant: 'destructive',
      });
      return;
    }

    // Generate invoice ID
    const invoiceId = `INV-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    setCurrentInvoiceId(invoiceId);

    // Create invoice data
    const invoiceData = {
      id: invoiceId,
      date: new Date().toISOString(),
      customer: customerData || {
        name: 'Walk-in Customer',
        email: '',
        phone: '',
      },
      items: cart.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.subtotal,
      })),
      subtotal: billSummary.subtotal,
      tax: billSummary.taxAmount,
      total: billSummary.total,
      paymentMethod,
      cashier: 'John Doe', // Replace with actual logged-in user
    };
    setLastInvoiceData(invoiceData); // Store for print/pdf

    // In a real app, save the invoice to database here

    // Show success dialog
    setShowPaymentSuccess(true);
    setShowCheckout(false);

    // Clear cart and reset state
    setCart([]);
    setBillSummary({
      subtotal: 0,
      discount: 0,
      discountType: 'percentage',
      discountAmount: 0,
      tax: 5,
      taxAmount: 0,
      total: 0,
    });
    setCashReceived(0);
    setCustomerData(null);

    toast({
      title: 'Payment successful',
      description: `Invoice #${invoiceId} has been generated`,
    });
  };

  const handlePrintReceipt = () => {
    if (!lastInvoiceData) {
      toast({
        title: 'No invoice to print',
        description: 'Please complete a sale first.',
        variant: 'destructive',
      });
      return;
    }
    try {
      // For Electron: use window.print() or Electron print API
      // For web: open PDF and trigger print
      const doc = generateInvoicePDF(lastInvoiceData, true); // true = do not auto-save
      if (window.electronAPI && window.electronAPI.printPDF) {
        // If Electron API is available
        window.electronAPI.printPDF(doc.output('blob'));
      } else {
        // Web: open PDF in new window and print
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
        title: 'Printing receipt',
        description: `Invoice #${lastInvoiceData.id} is being printed`,
      });
    } catch (error) {
      toast({
        title: 'Print failed',
        description: 'Failed to print receipt',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadPDF = () => {
    if (!lastInvoiceData) {
      toast({
        title: 'No invoice to download',
        description: 'Please complete a sale first.',
        variant: 'destructive',
      });
      return;
    }
    try {
      generateInvoicePDF(lastInvoiceData);
      toast({
        title: 'Invoice Downloaded',
        description: `Invoice #${lastInvoiceData.id} has been downloaded successfully`,
      });
    } catch (error) {
      toast({
        title: 'Download failed',
        description: 'Failed to generate invoice PDF',
        variant: 'destructive',
      });
    }
  };

  const handleBarcodeDialogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) {
      toast({
        title: 'Enter a barcode',
        description: 'Please enter or scan a barcode',
        variant: 'destructive',
      });
      return;
    }
    handleBarcodeScan(barcodeInput.trim());
    setBarcodeInput('');
    setShowBarcodeDialog(false);
  };

  return (
    <div className="grid grid-cols-12 gap-6 h-[calc(100vh-8rem)]">
      {/* Product search and selection panel */}
      <div className="col-span-7 flex flex-col space-y-4">
        <Card className="shadow-lg border-0 bg-gradient-to-r from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
          <CardHeader className="pb-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-6 w-6" />
                  New Sale
                </CardTitle>
                <CardDescription className="text-green-100">
                  Search for products by name, category, or scan barcode
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 text-green-100">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-mono">
                  {currentTime.toLocaleTimeString()}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products or scan barcode..."
                  className="pl-10 h-12 text-lg border-2 focus:border-green-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              <Button
                size="lg"
                variant="outline"
                className="px-6 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => setShowBarcodeDialog(true)}
              >
                <Scan className="h-5 w-5 mr-2" />
                Scan
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Product grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 320px)' }}>
          {filteredProducts.map((product) => (
            <Card 
              key={product.id} 
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border-2 hover:border-green-300 dark:hover:border-green-500 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700",
                product.stock_quantity <= 0 && "opacity-50 grayscale"
              )}
              onClick={() => {
                const maxQty = product.stock_quantity ?? product.stockQuantity ?? 0;
                if (maxQty > 0) {
                  addToCart(product);
                } else {
                  toast({
                    title: 'Out of stock',
                    description: `${product.name} is currently out of stock`,
                    variant: 'destructive',
                  });
                }
              }}
            >
              <CardContent className="p-4">
                <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-lg flex items-center justify-center mb-3 shadow-inner">
                  <ShoppingCart className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                </div>
                <h3 className="font-semibold text-sm line-clamp-2 mb-2 text-slate-900 dark:text-slate-100">{product.name}</h3>
                <div className="flex justify-between items-center">
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">Rs {product.price}</p>
                  <Badge 
                    variant={product.stock_quantity > 5 ? "outline" : product.stock_quantity > 0 ? "secondary" : "destructive"} 
                    className="text-xs"
                  >
                    {product.stock_quantity > 0 ? `${product.stock_quantity} left` : 'Out of stock'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{product.category}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Cart and billing panel */}
      <div className="col-span-5 flex flex-col space-y-4">
        <Card className="flex-1 flex flex-col shadow-lg border-0 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
          <CardHeader className="pb-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Shopping Cart
              </CardTitle>
              {cart.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCart([])}
                  className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                >
                  Clear All
                </Button>
              )}
            </div>
            <CardDescription className="text-blue-100">
              {cart.length} {cart.length === 1 ? 'item' : 'items'} • Total: Rs {billSummary.total.toFixed(2)}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-0">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                <div className="bg-slate-100 dark:bg-slate-800 rounded-full p-6 mb-4">
                  <ShoppingCart className="h-12 w-12 opacity-50" />
                </div>
                <p className="text-lg font-medium">Your cart is empty</p>
                <p className="text-sm">Search for products or scan barcodes to add items</p>
              </div>
            ) : (
              <div className="p-4">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-200 dark:border-slate-700">
                      <TableHead className="text-slate-700 dark:text-slate-300">Product</TableHead>
                      <TableHead className="text-right text-slate-700 dark:text-slate-300">Price</TableHead>
                      <TableHead className="text-center text-slate-700 dark:text-slate-300">Qty</TableHead>
                      <TableHead className="text-right text-slate-700 dark:text-slate-300">Subtotal</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cart.map((item) => (
                      <TableRow key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700">
                        <TableCell className="font-medium text-slate-900 dark:text-slate-100">{item.name}</TableCell>
                        <TableCell className="text-right text-slate-700 dark:text-slate-300">Rs {item.price}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-12 text-center font-medium text-slate-900 dark:text-slate-100">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={(() => {
                                const product = products.find(p => p.id === item.id);
                                const maxQty = product ? (product.stock_quantity ?? product.stockQuantity ?? 0) : 0;
                                return maxQty < 1;
                              })()}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-slate-900 dark:text-slate-100">Rs {item.subtotal}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>

          {cart.length > 0 && (
            <>
              <div className="px-6 py-4 border-t bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="discount" className="text-sm font-medium flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Percent className="h-4 w-4" />
                      Discount
                    </label>
                    <div className="flex mt-2">
                      <Input
                        id="discount"
                        type="number"
                        value={billSummary.discount}
                        onChange={(e) => handleDiscountChange(e.target.value, billSummary.discountType)}
                        className="rounded-r-none bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                      />
                      <Select
                        value={billSummary.discountType}
                        onValueChange={(value) => handleDiscountChange(billSummary.discount.toString(), value as 'percentage' | 'fixed')}
                      >
                        <SelectTrigger className="w-[80px] rounded-l-none border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                          <SelectItem value="percentage">%</SelectItem>
                          <SelectItem value="fixed">Rs</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="tax" className="text-sm font-medium flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Calculator className="h-4 w-4" />
                      Tax (%)
                    </label>
                    <Input
                      id="tax"
                      type="number"
                      value={billSummary.tax}
                      onChange={(e) => handleTaxChange(e.target.value)}
                      className="mt-2 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>

              <CardFooter className="flex-col border-t pt-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
                {customerData ? (
                  <div className="w-full mb-4 flex items-center justify-between bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 dark:bg-green-800 p-2 rounded-full">
                        <User className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{customerData.name}</p>
                        <p className="text-xs text-muted-foreground">{customerData.phone}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowCustomerForm(true)}
                      className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                    >
                      Edit
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full mb-4 h-12 border-dashed border-2 hover:border-green-300 dark:hover:border-green-500 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    onClick={() => setShowCustomerForm(true)}
                  >
                    <User className="mr-2 h-5 w-5" />
                    Add Customer Details (Optional)
                  </Button>
                )}

                <div className="w-full space-y-3 bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">Rs {billSummary.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount:</span>
                    <span className="font-medium text-red-600 dark:text-red-400">- Rs {billSummary.discountAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax ({billSummary.tax}%):</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">+ Rs {billSummary.taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-xl pt-3 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-slate-900 dark:text-slate-100">Total:</span>
                    <span className="text-green-600 dark:text-green-400">Rs {billSummary.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex gap-3 w-full mt-6">
                  <Button 
                    variant="outline" 
                    className="flex-1 h-12 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    onClick={handlePrintReceipt}
                  >
                    <Printer className="h-5 w-5 mr-2" />
                    Print
                  </Button>
                  <Button 
                    className="flex-1 h-12 btn-primary"
                    onClick={() => setShowCheckout(true)}
                  >
                    <CreditCard className="h-5 w-5 mr-2" />
                    Checkout
                  </Button>
                </div>
              </CardFooter>
            </>
          )}
        </Card>
      </div>

      {/* Customer form dialog */}
      <Dialog open={showCustomerForm} onOpenChange={setShowCustomerForm}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <User className="h-5 w-5" />
              Customer Information
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Add customer details for this sale (optional)
            </DialogDescription>
          </DialogHeader>
          
          <Form {...customerForm}>
            <form onSubmit={customerForm.handleSubmit(handleCustomerSubmit)} className="space-y-4">
              <FormField
                control={customerForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 dark:text-slate-300">Name</FormLabel>
                    <FormControl>
                      <Input {...field} className="h-11 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={customerForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 dark:text-slate-300">Phone</FormLabel>
                    <FormControl>
                      <Input {...field} className="h-11 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={customerForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 dark:text-slate-300">Email (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} className="h-11 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={customerForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 dark:text-slate-300">Address (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} className="h-11 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit" className="btn-primary">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Save Customer
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Checkout dialog */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <CreditCard className="h-5 w-5" />
              Complete Payment
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Choose payment method and complete the sale
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="flex justify-between font-bold text-xl border-b pb-4 border-slate-200 dark:border-slate-700">
              <span className="text-slate-900 dark:text-slate-100">Total Amount:</span>
              <span className="text-green-600 dark:text-green-400">Rs {billSummary.total.toFixed(2)}</span>
            </div>
            
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Payment Method</label>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  type="button"
                  variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                  className={cn(
                    "flex flex-col items-center justify-center h-20",
                    paymentMethod === 'cash' ? "btn-primary" : "border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                  onClick={() => setPaymentMethod('cash')}
                >
                  <DollarSign className="h-8 w-8 mb-1" />
                  Cash
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === 'card' ? 'default' : 'outline'}
                  className={cn(
                    "flex flex-col items-center justify-center h-20",
                    paymentMethod === 'card' ? "btn-secondary" : "border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                  onClick={() => setPaymentMethod('card')}
                >
                  <CreditCard className="h-8 w-8 mb-1" />
                  Card
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === 'upi' ? 'default' : 'outline'}
                  className={cn(
                    "flex flex-col items-center justify-center h-20",
                    paymentMethod === 'upi' ? "btn-warning" : "border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                  onClick={() => setPaymentMethod('upi')}
                >
                  <Info className="h-8 w-8 mb-1" />
                  UPI
                </Button>
              </div>
            </div>
            
            {paymentMethod === 'cash' && (
              <div className="space-y-3">
                <label htmlFor="cashReceived" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Cash Received (Rs)
                </label>
                <Input
                  id="cashReceived"
                  type="number"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(parseFloat(e.target.value) || 0)}
                  className="h-12 text-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                />
                
                {cashReceived >= billSummary.total && (
                  <div className="flex justify-between mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <span className="font-medium text-slate-900 dark:text-slate-100">Change to return:</span>
                    <span className="font-bold text-green-600 dark:text-green-400">Rs {(cashReceived - billSummary.total).toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}
            
            {paymentMethod === 'card' && (
              <div className="p-4 border-2 border-dashed rounded-lg bg-blue-50 dark:bg-blue-900/20 text-center border-blue-200 dark:border-blue-800">
                <CreditCard className="h-8 w-8 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                <p className="font-medium text-slate-900 dark:text-slate-100">Please swipe the card on the card reader</p>
                <p className="text-sm text-muted-foreground">Waiting for card...</p>
              </div>
            )}
            
            {paymentMethod === 'upi' && (
              <div className="p-4 border-2 border-dashed rounded-lg bg-orange-50 dark:bg-orange-900/20 text-center border-orange-200 dark:border-orange-800">
                <Info className="h-8 w-8 mx-auto mb-2 text-orange-600 dark:text-orange-400" />
                <p className="font-medium text-slate-900 dark:text-slate-100">Please scan QR code or enter UPI ID</p>
                <p className="text-sm text-muted-foreground">UPI payment pending...</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowCheckout(false)}
              className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button onClick={handlePayment} className="btn-primary">
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete Sale
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Barcode Scan Dialog */}
      <Dialog open={showBarcodeDialog} onOpenChange={setShowBarcodeDialog}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <Scan className="h-5 w-5" />
              Scan or Enter Barcode
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Enter or scan a product barcode to add it to the cart
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBarcodeDialogSubmit} className="space-y-4">
            <Input
              autoFocus
              placeholder="Enter barcode..."
              value={barcodeInput}
              onChange={e => setBarcodeInput(e.target.value)}
              className="h-12 text-lg bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  handleBarcodeDialogSubmit(e as any);
                }
              }}
            />
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setShowBarcodeDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="btn-primary">
                Add to Cart
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <PaymentSuccessDialog
        open={showPaymentSuccess}
        onOpenChange={setShowPaymentSuccess}
        onDownloadPDF={handleDownloadPDF}
        onPrint={handlePrintReceipt}
        invoiceId={currentInvoiceId}
        amount={billSummary.total}
      />
    </div>
  );
};

export default SalesPage;