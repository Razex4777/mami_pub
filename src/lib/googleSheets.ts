// Google Sheets Export Utility for Orders
// Exports orders data to Google Sheets via Apps Script Web App

// The Google Sheet ID from environment variable
const SPREADSHEET_ID = import.meta.env.VITE_SPREADSHEET_ID || '1cmhqoXAckCmfAP3Z_cTE96pFRtvLPMmRtMpNvds9zEQ';
// Google Apps Script Web App URL
const APPS_SCRIPT_URL = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbzyuKqgx1RzBjPoSo1oFguOx0R78tYuCVK4AckrPTqwaVSzKFX-URbOlIvlJknmDTbX/exec';

// Order interface for export
interface OrderForExport {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  status: string;
  total: number;
  subtotal: number;
  shipping: number;
  discount?: number;
  couponCode?: string;
  createdAt: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
  };
  notes?: string;
}

// Status labels in French
const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  processing: 'En cours',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
};

// Format currency for export (plain number for sheets calculations)
const formatCurrencyForSheet = (amount: number): string => {
  return amount.toFixed(2);
};

// Format currency for display
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-DZ', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount) + ' DA';
};

// Format date
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Get headers for spreadsheet
const getHeaders = (): string[] => [
  'N° Commande',
  'Date',
  'Client',
  'Téléphone',
  'Email',
  'Adresse',
  'Wilaya',
  'Commune',
  'Produits',
  'Quantité',
  'Sous-total (DA)',
  'Livraison (DA)',
  'Remise (DA)',
  'Code Promo',
  'Total (DA)',
  'Statut',
  'Notes',
];

// Convert single order to row
const orderToRow = (order: OrderForExport): string[] => {
  const productsList = order.items
    .map(item => `${item.productName} (x${item.quantity})`)
    .join(', ');
  
  const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
  
  return [
    order.orderNumber,
    formatDate(order.createdAt),
    order.customer.name,
    order.customer.phone,
    order.customer.email || '',
    order.shippingAddress.street || '',
    order.shippingAddress.state || '',
    order.shippingAddress.city || '',
    productsList,
    totalQuantity.toString(),
    formatCurrencyForSheet(order.subtotal),
    formatCurrencyForSheet(order.shipping),
    order.discount ? formatCurrencyForSheet(order.discount) : '0',
    order.couponCode || '',
    formatCurrencyForSheet(order.total),
    STATUS_LABELS[order.status] || order.status,
    order.notes || '',
  ];
};

// Convert orders to spreadsheet rows (with headers)
const ordersToRows = (orders: OrderForExport[], includeHeaders = true): string[][] => {
  const rows: string[][] = [];
  
  if (includeHeaders) {
    rows.push(getHeaders());
  }
  
  for (const order of orders) {
    rows.push(orderToRow(order));
  }
  
  return rows;
};

// Export result interface
interface ExportResult {
  success: boolean;
  message: string;
  updatedRows?: number;
  spreadsheetUrl?: string;
}


// Export orders to Google Sheets via Apps Script Web App
export async function exportOrdersToGoogleSheets(
  orders: OrderForExport[],
  clearFirst: boolean = true
): Promise<ExportResult> {
  try {
    if (orders.length === 0) {
      return {
        success: false,
        message: 'Aucune commande à exporter',
      };
    }

    const headers = getHeaders();
    const dataRows = orders.map(order => orderToRow(order));

    // Send data to Google Apps Script
    // Note: Using no-cors mode means we cannot verify the response.
    // The request is sent but success cannot be confirmed programmatically.
    await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', // Required for Apps Script cross-origin (returns opaque response)
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        headers: headers,
        rows: dataRows,
        clearFirst: clearFirst,
      }),
    });

    const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}`;

    // Open the spreadsheet in a new tab
    window.open(spreadsheetUrl, '_blank');

    return {
      success: true,
      message: `${orders.length} commande(s) envoyée(s) vers Google Sheets (vérifiez la feuille)`,
      updatedRows: orders.length,
      spreadsheetUrl: spreadsheetUrl,
    };
  } catch (error) {
    console.error('Export error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

// Copy orders to clipboard as tab-separated values (for easy paste into Sheets)
export async function copyOrdersToClipboard(
  orders: OrderForExport[]
): Promise<ExportResult> {
  try {
    if (orders.length === 0) {
      return {
        success: false,
        message: 'Aucune commande à copier',
      };
    }

    const rows = ordersToRows(orders);
    
    // Convert to tab-separated values
    const tsvContent = rows
      .map(row => row.join('\t'))
      .join('\n');
    
    // Check if clipboard API is available
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(tsvContent);
    } else {
      // Fallback: use execCommand for older browsers or non-secure contexts
      const textArea = document.createElement('textarea');
      textArea.value = tsvContent;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      textArea.style.top = '-9999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (!successful) {
        throw new Error('execCommand copy failed');
      }
    }
    
    return {
      success: true,
      message: `${orders.length} commande(s) copiée(s) ! Collez dans Google Sheets (Ctrl+V)`,
      updatedRows: orders.length,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}`,
    };
  } catch (error) {
    console.error('Clipboard error:', error);
    return {
      success: false,
      message: 'Impossible de copier dans le presse-papiers',
    };
  }
}

// Export to CSV file (download)
export function exportOrdersToCSV(orders: OrderForExport[]): ExportResult {
  try {
    if (orders.length === 0) {
      return {
        success: false,
        message: 'Aucune commande à exporter',
      };
    }

    const rows = ordersToRows(orders);
    
    // Convert to CSV string
    const csvContent = rows
      .map(row => 
        row.map(cell => {
          // Escape quotes and wrap in quotes if contains comma, newline, or quote
          const escaped = String(cell).replace(/"/g, '""');
          return /[,\n"]/.test(String(cell)) ? `"${escaped}"` : escaped;
        }).join(',')
      )
      .join('\n');
    
    // Add BOM for Excel UTF-8 compatibility
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create download link
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `commandes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return {
      success: true,
      message: `${orders.length} commande(s) exportée(s) en CSV`,
      updatedRows: orders.length,
    };
  } catch (error) {
    console.error('CSV export error:', error);
    return {
      success: false,
      message: 'Erreur lors de l\'export CSV',
    };
  }
}

// Export to Excel-compatible format (XLSX would require a library, so we use CSV)
export function exportOrdersToExcel(orders: OrderForExport[]): ExportResult {
  // For now, use CSV which Excel can open
  return exportOrdersToCSV(orders);
}

// Open Google Sheets in new tab
export function openGoogleSheet(): void {
  window.open(`https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}`, '_blank');
}

// Get the spreadsheet URL
export function getSpreadsheetUrl(): string {
  return `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}`;
}

export { SPREADSHEET_ID, STATUS_LABELS, formatCurrency, formatDate };
export type { OrderForExport, ExportResult };
