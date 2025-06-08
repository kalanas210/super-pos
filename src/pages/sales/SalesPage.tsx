import { useState, useEffect } from 'react';
import { 
  ShoppingCart, Search, Trash2, Plus, Minus, 
  CreditCard, Printer, Receipt, User, Info 
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
import { mockProducts } from '@/utils/mockData';
import { cn } from '@/lib/utils';

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
  const [filteredProducts, setFilteredProducts] = useState(mockProducts);
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

  // Filter products based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProducts(mockProducts);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredProducts(
        mockProducts.filter(
          (product) =>
            product.name.toLowerCase().includes(term) ||
            product.barcode.includes(term) ||
            product.category.toLowerCase().includes(term)
        )
      );
    }
  }, [searchTerm]);

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

  const handleBarcodeScan = (barcode: string) => {
    const product = mockProducts.find(p => p.barcode === barcode);
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

  const addToCart = (product: typeof mockProducts[0]) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        // Increment quantity if item is already in cart
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
        // Add new item to cart
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
        description: 'Please add products to the cart before proceeding to payment',
        variant: 'destructive',
      });
      return;
    }

    if (paymentMethod === 'cash' && cashReceived < billSummary.total) {
      toast({
        title: 'Insufficient cash',
        description: 'Cash received is less than the total amount',
        variant: 'destructive',
      });
      return;
    }

    // In a real app, we would save the invoice to the database
    const invoiceId = Math.floor(10000 + Math.random() * 90000).toString();
    
    toast({
      title: 'Payment successful',
      description: `Invoice #${invoiceId} has been generated`,
    });

    // Reset state
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
    setShowCheckout(false);
  };

  const handlePrintReceipt = () => {
    toast({
      title: 'Printing receipt',
      description: 'Receipt sent to printer',
    });
  };

  return (
    <div className="grid grid-cols-12 gap-4 h-[calc(100vh-8rem)]">
      {/* Product search and selection panel */}
      <div className="col-span-7 flex flex-col space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle>New Sale</CardTitle>
              <Badge variant="outline" className="ml-2">
                {new Date().toLocaleString()}
              </Badge>
            </div>
            <CardDescription>
              Search for products by name, category, or scan barcode
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products or scan barcode..."
                className="pl-8"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </CardContent>
        </Card>

        {/* Product grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 280px)' }}>
          {filteredProducts.map((product) => (
            <Card 
              key={product.id} 
              className={cn(
                "cursor-pointer transition-all hover:border-primary",
                product.stockQuantity <= 0 && "opacity-50"
              )}
              onClick={() => {
                if (product.stockQuantity > 0) {
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
              <CardContent className="p-3">
                <div className="aspect-square bg-muted rounded-md flex items-center justify-center mb-2">
                  <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-sm line-clamp-1">{product.name}</h3>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-sm font-bold">₹{product.price}</p>
                  <Badge variant={product.stockQuantity > 5 ? "outline" : product.stockQuantity > 0 ? "secondary" : "destructive"} className="text-xs">
                    {product.stockQuantity > 0 ? `${product.stockQuantity} left` : 'Out of stock'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Cart and billing panel */}
      <div className="col-span-5 flex flex-col space-y-4">
        <Card className="flex-1 flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Cart
              </CardTitle>
              {cart.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCart([])}
                >
                  Clear All
                </Button>
              )}
            </div>
            <CardDescription>
              {cart.length} {cart.length === 1 ? 'item' : 'items'} in cart
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
                <ShoppingCart className="h-12 w-12 mb-2 opacity-20" />
                <p>Your cart is empty</p>
                <p className="text-sm">Search for products or scan barcodes to add items</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cart.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-right">₹{item.price}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">₹{item.subtotal}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>

          {cart.length > 0 && (
            <>
              <div className="px-6">
                <div className="flex flex-col space-y-1.5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="discount" className="text-sm">
                        Discount
                      </label>
                      <div className="flex mt-1">
                        <Input
                          id="discount"
                          type="number"
                          value={billSummary.discount}
                          onChange={(e) => handleDiscountChange(e.target.value, billSummary.discountType)}
                          className="rounded-r-none"
                        />
                        <Select
                          value={billSummary.discountType}
                          onValueChange={(value) => handleDiscountChange(billSummary.discount.toString(), value as 'percentage' | 'fixed')}
                        >
                          <SelectTrigger className="w-[80px] rounded-l-none">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">%</SelectItem>
                            <SelectItem value="fixed">₹</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="tax" className="text-sm">
                        Tax (%)
                      </label>
                      <Input
                        id="tax"
                        type="number"
                        value={billSummary.tax}
                        onChange={(e) => handleTaxChange(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <CardFooter className="flex-col border-t mt-4 pt-4">
                {customerData ? (
                  <div className="w-full mb-4 flex items-center justify-between bg-muted p-2 rounded-lg">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{customerData.name}</p>
                        <p className="text-xs text-muted-foreground">{customerData.phone}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowCustomerForm(true)}
                    >
                      Edit
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full mb-4 flex items-center justify-center"
                    onClick={() => setShowCustomerForm(true)}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Add Customer Details
                  </Button>
                )}

                <div className="w-full space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>₹{billSummary.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Discount:</span>
                    <span>- ₹{billSummary.discountAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax ({billSummary.tax}%):</span>
                    <span>+ ₹{billSummary.taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total:</span>
                    <span>₹{billSummary.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex gap-2 w-full mt-4">
                  <Button 
                    variant="outline" 
                    className="flex-1 gap-2"
                    onClick={handlePrintReceipt}
                  >
                    <Printer className="h-4 w-4" />
                    Print
                  </Button>
                  <Button 
                    className="flex-1 gap-2"
                    onClick={() => setShowCheckout(true)}
                  >
                    <CreditCard className="h-4 w-4" />
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Customer Information</DialogTitle>
            <DialogDescription>
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
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>Email (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                    <FormLabel>Address (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit">Save Customer</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Checkout dialog */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
            <DialogDescription>
              Choose payment method and complete the sale
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex justify-between font-bold text-lg border-b pb-2">
              <span>Total Amount:</span>
              <span>₹{billSummary.total.toFixed(2)}</span>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                  className="flex flex-col items-center justify-center h-20"
                  onClick={() => setPaymentMethod('cash')}
                >
                  <Receipt className="h-8 w-8 mb-1" />
                  Cash
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === 'card' ? 'default' : 'outline'}
                  className="flex flex-col items-center justify-center h-20"
                  onClick={() => setPaymentMethod('card')}
                >
                  <CreditCard className="h-8 w-8 mb-1" />
                  Card
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === 'upi' ? 'default' : 'outline'}
                  className="flex flex-col items-center justify-center h-20"
                  onClick={() => setPaymentMethod('upi')}
                >
                  <Info className="h-8 w-8 mb-1" />
                  UPI
                </Button>
              </div>
            </div>
            
            {paymentMethod === 'cash' && (
              <div className="space-y-2">
                <label htmlFor="cashReceived" className="text-sm font-medium">
                  Cash Received (₹)
                </label>
                <Input
                  id="cashReceived"
                  type="number"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(parseFloat(e.target.value) || 0)}
                />
                
                {cashReceived >= billSummary.total && (
                  <div className="flex justify-between mt-2 p-2 bg-muted rounded">
                    <span>Change to return:</span>
                    <span className="font-bold">₹{(cashReceived - billSummary.total).toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}
            
            {paymentMethod === 'card' && (
              <div className="p-3 border rounded bg-muted text-center">
                <p>Please swipe the card on the card reader</p>
              </div>
            )}
            
            {paymentMethod === 'upi' && (
              <div className="p-3 border rounded bg-muted text-center">
                <p>Please scan QR code or enter UPI ID</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCheckout(false)}>
              Cancel
            </Button>
            <Button onClick={handlePayment}>
              Complete Sale
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalesPage;