import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

interface SalesData {
  date: string;
  amount: number;
  items: number;
}

interface CategorySales {
  category: string;
  amount: number;
  percentage: number;
}

interface ReportData {
  title: string;
  period: string;
  totalSales: number;
  totalItems: number;
  averageOrderValue: number;
  salesByDay: SalesData[];
  salesByCategory: CategorySales[];
}

export const generateReport = (data: ReportData) => {
  const doc = new jsPDF() as any;
  const pageWidth = doc.internal.pageSize.width;

  // Add header
  doc.setFontSize(20);
  doc.text('SuperPOS Store', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(16);
  doc.text(data.title, pageWidth / 2, 30, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(`Period: ${data.period}`, pageWidth / 2, 40, { align: 'center' });
  doc.text(`Generated on: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, pageWidth / 2, 47, { align: 'center' });

  // Add summary
  doc.setFontSize(14);
  doc.text('Summary', 15, 60);
  
  doc.setFontSize(11);
  doc.text([
    `Total Sales: Rs. ${data.totalSales.toFixed(2)}`,
    `Total Items Sold: ${data.totalItems}`,
    `Average Order Value: Rs. ${data.averageOrderValue.toFixed(2)}`,
  ], 15, 70);

  // Add daily sales table
  doc.autoTable({
    startY: 95,
    head: [['Date', 'Sales Amount (Rs.)', 'Items Sold']],
    body: data.salesByDay.map(day => [
      format(new Date(day.date), 'dd/MM/yyyy'),
      day.amount.toFixed(2),
      day.items.toString()
    ]),
    theme: 'grid',
    headStyles: { fillColor: [76, 175, 80] },
  });

  // Add category sales table
  const finalY = doc.lastAutoTable.finalY + 20;
  
  doc.setFontSize(14);
  doc.text('Sales by Category', 15, finalY);

  doc.autoTable({
    startY: finalY + 10,
    head: [['Category', 'Amount (Rs.)', 'Percentage']],
    body: data.salesByCategory.map(cat => [
      cat.category,
      cat.amount.toFixed(2),
      `${cat.percentage.toFixed(1)}%`
    ]),
    theme: 'grid',
    headStyles: { fillColor: [76, 175, 80] },
  });

  return doc;
}; 