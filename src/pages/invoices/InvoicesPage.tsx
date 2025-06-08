import { useState } from 'react';
import { 
  FileText, Search, Filter, MoreHorizontal, Printer, 
  Download, Mail, AlertCircle, Receipt, ArrowUpDown 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

// Mock invoices data
const mockInvoices = [
  {
    id: 'INV-001',
    date: '2024-04-18 14:30:00',
    customer: {
      name: 'Rajiv Kumar',
      email: 'rajiv@example.com',
      phone: '+94 71 234 5678',
    },
    items: 8,
    total: 1450,
    status: 'paid',
    paymentMethod: 'cash',
    cashier: 'John Doe',
  },
  {
    id: 'INV-002',
    date: '2024-04-18 13:45:00',
    customer: {
      name: 'Anika Silva',
      email: 'anika@example.com',
      phone: '+94 77 345 6789',
    },
    items: 5,
    total: 870,
    status: 'paid',
    paymentMethod: 'card',
    cashier: 'Jane Smith',
  },
  {
    id: 'INV-003',
    date: '2024-04-17 16:20:00',
    customer: {
      name: 'Malik Fernando',
      email: 'malik@example.com',
      phone: '+94 76 456 7890',
    },
    items: 12,
    total: 2240,
    status: 'pending',
    paymentMethod: 'upi',
    cashier: 'John Doe',
  },
  {
    id: 'INV-004',
    date: '2024-04-17 15:10:00',
    customer: {
      name: 'Priya Patel',
      email: 'priya@example.com',
      phone: '+94 75 567 8901',
    },
    items: 7,
    total: 1100,
    status: 'paid',
    paymentMethod: 'cash',
    cashier: 'Sarah Wilson',
  },
  {
    id: 'INV-005',
    date: '2024-04-17 14:25:00',
    customer: {
      name: 'Mohamed Ali',
      email: 'mohamed@example.com',
      phone: '+94 74 678 9012',
    },
    items: 3,
    total: 450,
    status: 'void',
    paymentMethod: 'card',
    cashier: 'Jane Smith',
  },
];

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState(mockInvoices);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState<typeof mockInvoices[0] | null>(null);
  const [showVoidDialog, setShowVoidDialog] = useState(false);
  const { toast } = useToast();

  // Filter invoices based on search term and status
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch = 
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer.phone.includes(searchTerm);
    
    const matchesStatus = selectedStatus === 'all' || invoice.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handlePrint = (invoice: typeof mockInvoices[0]) => {
    toast({
      title: 'Printing Invoice',
      description: `Invoice ${invoice.id} is being sent to printer`,
    });
  };

  const handleDownload = (invoice: typeof mockInvoices[0]) => {
    toast({
      title: 'Downloading Invoice',
      description: `Invoice ${invoice.id} PDF is being generated`,
    });
  };

  const handleEmailInvoice = (invoice: typeof mockInvoices[0]) => {
    toast({
      title: 'Email Sent',
      description: `Invoice ${invoice.id} has been emailed to ${invoice.customer.email}`,
    });
  };

  const handleVoidInvoice = () => {
    if (selectedInvoice) {
      setInvoices(invoices.map(inv => 
        inv.id === selectedInvoice.id 
          ? { ...inv, status: 'void' }
          : inv
      ));
      toast({
        title: 'Invoice Voided',
        description: `Invoice ${selectedInvoice.id} has been voided`,
      });
      setShowVoidDialog(false);
      setSelectedInvoice(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="outline">Paid</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'void':
        return <Badge variant="destructive">Void</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">
            View and manage sales invoices
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleDownload(filteredInvoices[0])}>
            <Download className="mr-2 h-4 w-4" />
            Export All
          </Button>
          <Button>
            <Receipt className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
          <CardDescription>
            {invoices.length} total invoices, {invoices.filter(i => i.status === 'paid').length} paid
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="void">Void</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredInvoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <FileText className="h-12 w-12 mb-2 opacity-20" />
              <p>No invoices found</p>
              <p className="text-sm">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-center">Items</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Cashier</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.id}</TableCell>
                      <TableCell>{invoice.date}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{invoice.customer.name}</p>
                          <p className="text-xs text-muted-foreground">{invoice.customer.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{invoice.items}</TableCell>
                      <TableCell className="text-right">₹{invoice.total}</TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {invoice.paymentMethod.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{invoice.cashier}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handlePrint(invoice)}>
                              <Printer className="mr-2 h-4 w-4" />
                              Print
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownload(invoice)}>
                              <Download className="mr-2 h-4 w-4" />
                              Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEmailInvoice(invoice)}>
                              <Mail className="mr-2 h-4 w-4" />
                              Email Invoice
                            </DropdownMenuItem>
                            {invoice.status !== 'void' && (
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => {
                                  setSelectedInvoice(invoice);
                                  setShowVoidDialog(true);
                                }}
                              >
                                <AlertCircle className="mr-2 h-4 w-4" />
                                Void Invoice
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Void Invoice Dialog */}
      <Dialog open={showVoidDialog} onOpenChange={setShowVoidDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center text-destructive">
              <AlertCircle className="h-5 w-5 mr-2" />
              Void Invoice
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to void this invoice? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedInvoice && (
            <div className="py-4 border-y">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{selectedInvoice.id}</span>
                <span className="text-muted-foreground">{selectedInvoice.date}</span>
              </div>
              <p className="text-sm">{selectedInvoice.customer.name}</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-muted-foreground">
                  {selectedInvoice.items} items
                </span>
                <span className="font-medium">₹{selectedInvoice.total}</span>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowVoidDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleVoidInvoice}
            >
              Void Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InvoicesPage;