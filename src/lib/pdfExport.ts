// PDF Export Utility for Dashboard Reports
// Uses jsPDF library for PDF generation

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Analytics } from '@/supabase';

// Extend jsPDF type to include lastAutoTable from jspdf-autotable
interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable: {
    finalY: number;
  };
}

// Status labels in French (ASCII safe for PDF)
const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmee',
  processing: 'En cours',
  shipped: 'Expediee',
  delivered: 'Livree',
  cancelled: 'Annulee',
};

// Format currency (using dots as thousand separators for PDF compatibility)
const formatCurrency = (amount: number): string => {
  const formatted = amount.toLocaleString('en-US').replace(/,/g, '.');
  return `${formatted} DA`;
};

// Format date for filename
const formatDateForFilename = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}_${hours}h${minutes}`;
};

// Format date for display
const formatDateForDisplay = (): string => {
  return new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

interface MostViewedProduct {
  name: string;
  price: number;
  viewer_count: number;
}

interface ExportOptions {
  analytics: Analytics;
  mostViewed?: MostViewedProduct[];
  siteName?: string;
}
export async function exportDashboardToPDF(options: ExportOptions): Promise<void> {
  const { analytics, mostViewed = [], siteName = 'MAMI PUB' } = options;
  
  // Create PDF document (A4 size)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  }) as jsPDFWithAutoTable;

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPos = margin;

  // Helper function to add a new page if needed
  const checkNewPage = (requiredSpace: number) => {
    if (yPos + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
      return true;
    }
    return false;
  };

  // ===== HEADER =====
  // Background gradient effect (simplified as solid color)
  doc.setFillColor(79, 70, 229); // Indigo
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  // Logo text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(siteName, margin, 20);
  
  // Subtitle
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Rapport du Tableau de Bord', margin, 28);
  
  // Date
  doc.setFontSize(10);
  doc.text(`Genere le ${formatDateForDisplay()}`, margin, 36);
  
  yPos = 55;

  // ===== KEY METRICS SECTION =====
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Indicateurs Cles', margin, yPos);
  yPos += 10;

  // Metrics table
  const metricsData = [
    ['Chiffre d\'affaires', formatCurrency(analytics.totalRevenue), `${analytics.revenueGrowth >= 0 ? '+' : ''}${analytics.revenueGrowth.toFixed(1)}%`],
    ['Benefice', formatCurrency(analytics.totalProfit ?? 0), '-'],
    ['Commandes', analytics.totalOrders.toString(), `${analytics.ordersGrowth >= 0 ? '+' : ''}${analytics.ordersGrowth.toFixed(1)}%`],
    ['Produits', analytics.totalProducts.toString(), `${analytics.productsGrowth >= 0 ? '+' : ''}${analytics.productsGrowth.toFixed(1)}%`],
    ['Clients', analytics.totalCustomers.toString(), '-'],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['Metrique', 'Valeur', 'Croissance']],
    body: metricsData,
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 4 },
    columnStyles: {
      0: { fontStyle: 'bold' },
      1: { halign: 'right' },
      2: { halign: 'center' },
    },
    margin: { left: margin, right: margin },
  });

  yPos = doc.lastAutoTable.finalY + 15;

  // ===== PRODUCT HEALTH SECTION =====
  checkNewPage(50);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Sante des Produits', margin, yPos);
  yPos += 10;

  const productHealth = analytics.productHealth || { total: 0, active: 0, inactive: 0 };
  const productData = [
    ['Total Produits', productHealth.total.toString()],
    ['Produits Actifs', productHealth.active.toString()],
    ['Produits Inactifs', productHealth.inactive.toString()],
    ['Taux activation', `${((productHealth.active / (productHealth.total || 1)) * 100).toFixed(1)}%`],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['Statut', 'Nombre']],
    body: productData,
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 4 },
    columnStyles: {
      0: { fontStyle: 'bold' },
      1: { halign: 'right' },
    },
    margin: { left: margin, right: margin },
    tableWidth: 100,
  });

  yPos = doc.lastAutoTable.finalY + 15;

  // ===== CATEGORY DISTRIBUTION =====
  checkNewPage(60);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Repartition par Categorie', margin, yPos);
  yPos += 10;

  const categoryDistribution = analytics.categoryDistribution || [];
  if (categoryDistribution.length > 0) {
    const categoryData = categoryDistribution.map(cat => [
      cat.name,
      cat.count.toString(),
      `${cat.percentage}%`,
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Categorie', 'Produits', 'Pourcentage']],
      body: categoryData,
      theme: 'striped',
      headStyles: { fillColor: [139, 92, 246], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: {
        0: { fontStyle: 'bold' },
        1: { halign: 'center' },
        2: { halign: 'center' },
      },
      margin: { left: margin, right: margin },
    });

    yPos = doc.lastAutoTable.finalY + 15;
  }

  // ===== ORDER STATUS =====
  checkNewPage(60);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Statut des Commandes', margin, yPos);
  yPos += 10;

  const ordersByStatus = analytics.ordersByStatus || [];
  if (ordersByStatus.length > 0) {
    const orderData = ordersByStatus.map(item => [
      STATUS_LABELS[item.status] || item.status,
      item.count.toString(),
      `${item.percentage}%`,
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Statut', 'Nombre', 'Pourcentage']],
      body: orderData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: {
        0: { fontStyle: 'bold' },
        1: { halign: 'center' },
        2: { halign: 'center' },
      },
      margin: { left: margin, right: margin },
    });

    yPos = doc.lastAutoTable.finalY + 15;
  }

  // ===== TOP PRODUCTS =====
  checkNewPage(70);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Meilleures Ventes', margin, yPos);
  yPos += 10;

  const topProducts = analytics.topProducts || [];
  if (topProducts.length > 0) {
    const topProductsData = topProducts.map((product, index) => [
      `#${index + 1}`,
      product.name,
      product.sales.toString(),
      formatCurrency(product.revenue),
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Rang', 'Produit', 'Ventes', 'Revenus']],
      body: topProductsData,
      theme: 'striped',
      headStyles: { fillColor: [245, 158, 11], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: {
        0: { halign: 'center', fontStyle: 'bold', cellWidth: 20 },
        1: { cellWidth: 80 },
        2: { halign: 'center', cellWidth: 25 },
        3: { halign: 'right', cellWidth: 40 },
      },
      margin: { left: margin, right: margin },
      tableWidth: 'auto',
    });

    yPos = doc.lastAutoTable.finalY + 15;
  }

  // ===== MOST VIEWED PRODUCTS =====
  if (mostViewed.length > 0) {
    checkNewPage(70);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Produits les Plus Vus', margin, yPos);
    yPos += 10;

    const mostViewedData = mostViewed.map((product, index) => [
      `#${index + 1}`,
      product.name,
      formatCurrency(product.price),
      (product.viewer_count || 0).toString(),
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Rang', 'Produit', 'Prix', 'Vues']],
      body: mostViewedData,
      theme: 'striped',
      headStyles: { fillColor: [6, 182, 212], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: {
        0: { halign: 'center', fontStyle: 'bold', cellWidth: 20 },
        1: { cellWidth: 80 },
        2: { halign: 'right', cellWidth: 40 },
        3: { halign: 'center', cellWidth: 25 },
      },
      margin: { left: margin, right: margin },
      tableWidth: 'auto',
    });

    yPos = doc.lastAutoTable.finalY + 15;
  }

  // ===== REVENUE BY MONTH =====
  const revenueByMonth = analytics.revenueByMonth || [];
  if (revenueByMonth.length > 0) {
    checkNewPage(70);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Revenus par Mois', margin, yPos);
    yPos += 10;

    const revenueData = revenueByMonth.map(item => [
      item.month,
      formatCurrency(item.revenue),
      item.orders.toString(),
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Mois', 'Revenus', 'Commandes']],
      body: revenueData,
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 4 },
      columnStyles: {
        0: { fontStyle: 'bold' },
        1: { halign: 'right' },
        2: { halign: 'center' },
      },
      margin: { left: margin, right: margin },
    });
  }

  // ===== FOOTER =====
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `${siteName} - Rapport genere automatiquement | Page ${i} sur ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Generate filename and save
  const filename = `${siteName.replace(/\s+/g, '_')}_Rapport_${formatDateForFilename()}.pdf`;
  doc.save(filename);
}

export default exportDashboardToPDF;
