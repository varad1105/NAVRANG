import { jsPDF } from 'jspdf';

export const generateReceipt = (orderDetails) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let yPos = 20;

  // Add logo and header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(249, 115, 22); // Orange color
  doc.text('NAVRANG', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Order Receipt', pageWidth / 2, yPos, { align: 'center' });
  
  // Add order details
  yPos += 20;
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  
  // Order ID and Date
  doc.text(`Order #${orderDetails.orderId}`, margin, yPos);
  doc.text(new Date().toLocaleDateString(), pageWidth - margin, yPos, { align: 'right' });
  
  // Line separator
  yPos += 10;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  
  // Items
  yPos += 15;
  doc.setFont('helvetica', 'bold');
  doc.text('ITEM', margin, yPos);
  doc.text('QTY', pageWidth - margin - 30, yPos, { align: 'right' });
  doc.text('PRICE', pageWidth - margin, yPos, { align: 'right' });
  
  yPos += 10;
  doc.setFont('helvetica', 'normal');
  
  // Add items (example - you'll need to pass actual items from your order)
  const items = orderDetails.items || [
    { name: 'Product Name', quantity: 1, price: orderDetails.amount || 0 }
  ];
  
  items.forEach(item => {
    doc.text(item.name, margin, yPos);
    doc.text(item.quantity.toString(), pageWidth - margin - 30, yPos, { align: 'right' });
    doc.text(`₹${item.price.toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
    yPos += 8;
  });
  
  // Total
  yPos += 10;
  doc.setDrawColor(200, 200, 200);
  doc.line(pageWidth - 100, yPos, pageWidth - margin, yPos);
  yPos += 10;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Total:', pageWidth - 60, yPos);
  doc.text(`₹${orderDetails.amount?.toFixed(2) || '0.00'}`, pageWidth - margin, yPos, { align: 'right' });
  
  // Payment details
  yPos += 20;
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Details', margin, yPos);
  yPos += 10;
  doc.setFont('helvetica', 'normal');
  doc.text(`Payment ID: ${orderDetails.paymentId || 'N/A'}`, margin, yPos);
  yPos += 8;
  doc.text(`Status: ${orderDetails.status || 'Paid'}`, margin, yPos);
  yPos += 8;
  doc.text(`Date: ${new Date().toLocaleString()}`, margin, yPos);
  
  // Thank you note
  yPos += 20;
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  doc.text('Thank you for shopping with Navrang!', pageWidth / 2, yPos, { align: 'center' });
  
  // Save the PDF
  doc.save(`navrang-receipt-${orderDetails.orderId}.pdf`);
  
  return doc.output('datauristring');
};
