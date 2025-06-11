import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

interface SalesData {
  total: number;
  count: number;
  trend: number;
  items: number;
  averageOrder: number;
}

interface TopProduct {
  id: string;
  name: string;
  sales: number;
  quantity: number;
  percentage: number;
  category: string;
}

interface CategorySales {
  category: string;
  sales: number;
  percentage: number;
  trend: number;
}

interface ReportData {
  period: string;
  startDate?: string;
  endDate?: string;
  salesData: SalesData;
  topProducts: TopProduct[];
  salesByCategory: CategorySales[];
}

interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface Customer {
  name: string;
  email: string;
  phone: string;
}

interface InvoiceData {
  id: string;
  date: string;
  customer: Customer;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
  cashier: string;
}

// Extend jsPDF type to include autoTable
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => void;
  lastAutoTable: {
    finalY: number;
  };
}

export const generateSalesReport = (data: ReportData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  
  // Add header
  doc.setFontSize(20);
  doc.text('SuperPOS - Sales Report', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(`Period: ${data.period}`, pageWidth / 2, 30, { align: 'center' });
  if (data.startDate && data.endDate) {
    doc.text(`${data.startDate} - ${data.endDate}`, pageWidth / 2, 37, { align: 'center' });
  }
  
  // Add summary section
  doc.setFontSize(14);
  doc.text('Summary', 14, 50);
  
  const summaryData = [
    ['Total Sales', `Rs ${data.salesData.total.toLocaleString()}`],
    ['Number of Transactions', data.salesData.count.toString()],
    ['Total Items Sold', data.salesData.items.toString()],
    ['Average Order Value', `Rs ${data.salesData.averageOrder.toLocaleString()}`],
    ['Growth', `${data.salesData.trend > 0 ? '+' : ''}${data.salesData.trend}%`],
  ];
  
  autoTable(doc, {
    startY: 55,
    head: [['Metric', 'Value']],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: [76, 175, 80] },
    styles: { fontSize: 10 },
  });
  
  // Add top products section
  doc.text('Top Selling Products', 14, doc.lastAutoTable.finalY + 15);
  
  const productData = data.topProducts.map(product => [
    product.name,
    product.category,
    `Rs ${product.sales.toLocaleString()}`,
    product.quantity.toString(),
    `${product.percentage}%`,
  ]);
  
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 20,
    head: [['Product', 'Category', 'Sales', 'Quantity', 'Share']],
    body: productData,
    theme: 'grid',
    headStyles: { fillColor: [76, 175, 80] },
    styles: { fontSize: 10 },
  });
  
  // Add sales by category section
  doc.text('Sales by Category', 14, doc.lastAutoTable.finalY + 15);
  
  const categoryData = data.salesByCategory.map(cat => [
    cat.category,
    `Rs ${cat.sales.toLocaleString()}`,
    `${cat.percentage}%`,
    `${cat.trend > 0 ? '+' : ''}${cat.trend}%`,
  ]);
  
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 20,
    head: [['Category', 'Sales', 'Share', 'Growth']],
    body: categoryData,
    theme: 'grid',
    headStyles: { fillColor: [76, 175, 80] },
    styles: { fontSize: 10 },
  });
  
  // Add footer
  const now = new Date();
  doc.setFontSize(10);
  doc.setTextColor(128);
  doc.text(
    `Generated on ${format(now, 'PPpp')}`,
    pageWidth / 2,
    doc.internal.pageSize.height - 10,
    { align: 'center' }
  );
  
  return doc;
};

export const generateInvoicePDF = (invoice: InvoiceData) => {
  const doc = new jsPDF() as jsPDFWithAutoTable;
  const pageWidth = doc.internal.pageSize.width;

  // Add business info
  doc.setFontSize(20);
  doc.text('SuperPOS Store', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text('123 Main Street, Colombo 03, Sri Lanka', pageWidth / 2, 30, { align: 'center' });
  doc.text('Tel: +94 11 234 5678 | Email: info@superpos.com', pageWidth / 2, 35, { align: 'center' });

  // Add invoice details
  doc.setFontSize(12);
  doc.text(`Invoice #: ${invoice.id}`, 15, 50);
  doc.text(`Date: ${format(new Date(invoice.date), 'dd/MM/yyyy HH:mm')}`, 15, 57);
  doc.text(`Cashier: ${invoice.cashier}`, 15, 64);

  // Add customer details
  doc.text('Bill To:', 15, 75);
  doc.setFontSize(11);
  doc.text([
    invoice.customer.name,
    invoice.customer.email,
    invoice.customer.phone
  ], 15, 82);

  // Add items table
  doc.autoTable({
    startY: 100,
    head: [['Item', 'Qty', 'Price (Rs.)', 'Total (Rs.)']],
    body: invoice.items.map(item => [
      item.name,
      item.quantity.toString(),
      item.price.toFixed(2),
      item.total.toFixed(2)
    ]),
    foot: [
      ['', '', 'Subtotal', `Rs. ${invoice.subtotal.toFixed(2)}`],
      ['', '', 'Tax (15%)', `Rs. ${invoice.tax.toFixed(2)}`],
      ['', '', 'Total', `Rs. ${invoice.total.toFixed(2)}`]
    ],
    theme: 'grid',
    headStyles: { fillColor: [76, 175, 80] },
    footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0] },
  });

  // Add payment info
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.text(`Payment Method: ${invoice.paymentMethod.toUpperCase()}`, 15, finalY);

  // Add footer
  doc.setFontSize(10);
  doc.text('Thank you for your business!', pageWidth / 2, finalY + 20, { align: 'center' });

  // Save the PDF
  doc.save(`invoice-${invoice.id}.pdf`);
}; 