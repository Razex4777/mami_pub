// Email Notification Utility using Resend via Supabase Edge Function

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate email address format
 */
export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

/**
 * Escape HTML special characters to prevent XSS
 */
function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, char => htmlEntities[char] || char);
}

export interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  totalAmount: number;
  itemCount: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  paymentMethod: string;
}

/**
 * Format order data into HTML email
 */
export function formatOrderEmailHTML(order: OrderEmailData): string {
  // Escape all user-controlled strings to prevent XSS
  const safeOrderId = escapeHtml(order.orderId);
  const safeCustomerName = escapeHtml(order.customerName);
  const safeCustomerPhone = escapeHtml(order.customerPhone);
  const safeCustomerAddress = escapeHtml(order.customerAddress);
  const safePaymentMethod = escapeHtml(order.paymentMethod);
  
  const itemsHTML = order.items
    .map(
      (item) =>
        `<tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(item.name)}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${item.price.toLocaleString()} DA</td>
        </tr>`
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
    .order-info { background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px; }
    .order-info h3 { margin: 0 0 10px 0; color: #667eea; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #667eea; color: white; padding: 10px; text-align: left; }
    .total { font-size: 18px; font-weight: bold; color: #667eea; }
    .footer { text-align: center; padding: 15px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">🛒 Nouvelle Commande!</h1>
      <p style="margin: 5px 0 0 0;">Commande #${safeOrderId}</p>
    </div>
    <div class="content">
      <div class="order-info">
        <h3>👤 Informations Client</h3>
        <p><strong>Nom:</strong> ${safeCustomerName}</p>
        <p><strong>Téléphone:</strong> ${safeCustomerPhone}</p>
        <p><strong>Adresse:</strong> ${safeCustomerAddress}</p>
        <p><strong>Paiement:</strong> ${safePaymentMethod}</p>
      </div>
      
      <div class="order-info">
        <h3>📦 Articles (${order.itemCount})</h3>
        <table>
          <thead>
            <tr>
              <th>Produit</th>
              <th style="text-align: center;">Qté</th>
              <th style="text-align: right;">Prix</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>
      </div>
      
      <div class="order-info" style="text-align: center;">
        <p class="total">💰 Total: ${order.totalAmount.toLocaleString()} DA</p>
      </div>
    </div>
    <div class="footer">
      <p>Cet email a été envoyé automatiquement par Mami Pub</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Format order data into plain text email
 */
export function formatOrderEmailText(order: OrderEmailData): string {
  const itemsList = order.items
    .map((item) => `  • ${item.name} x${item.quantity} - ${item.price.toLocaleString()} DA`)
    .join('\n');

  return `
🛒 NOUVELLE COMMANDE - #${order.orderId}
${'='.repeat(40)}

👤 INFORMATIONS CLIENT
----------------------
Nom: ${order.customerName}
Téléphone: ${order.customerPhone}
Adresse: ${order.customerAddress}
Paiement: ${order.paymentMethod}

📦 ARTICLES (${order.itemCount})
----------------------
${itemsList}

💰 TOTAL: ${order.totalAmount.toLocaleString()} DA
${'='.repeat(40)}

Cet email a été envoyé automatiquement par Mami Pub
  `.trim();
}

/**
 * Send order notification email via Supabase Edge Function
 * The Edge Function uses Resend API for email delivery
 */
export async function sendOrderEmail(
  recipientEmail: string,
  order: OrderEmailData
): Promise<{ success: boolean; error?: string }> {
  // Validate email before making network call
  const normalizedEmail = recipientEmail.trim();
  if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
    return { success: false, error: 'Adresse email invalide' };
  }
  
  try {
    // Call Supabase Edge Function that handles email sending via Resend
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-order-email`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          recipientEmail: normalizedEmail,
          order,
          html: formatOrderEmailHTML(order),
          text: formatOrderEmailText(order),
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { 
        success: false, 
        error: errorData.error || `HTTP ${response.status}` 
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur inconnue' 
    };
  }
}

/**
 * Test email connection
 */
export async function testEmailConnection(
  recipientEmail: string
): Promise<{ success: boolean; error?: string }> {
  // Validate email before making network call
  const normalizedEmail = recipientEmail.trim();
  if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
    return { success: false, error: 'Adresse email invalide' };
  }
  
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-order-email`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          recipientEmail: normalizedEmail,
          test: true,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { 
        success: false, 
        error: errorData.error || `HTTP ${response.status}` 
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Email test error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erreur de connexion' 
    };
  }
}
