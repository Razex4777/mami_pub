// Telegram Bot Notification Utility
// Sends order notifications to admin via Telegram

const TELEGRAM_API_BASE = 'https://api.telegram.org/bot';

interface TelegramConfig {
  botToken: string;
  chatId: string;
}

interface OrderNotification {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  totalAmount: number;
  itemCount: number;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  paymentMethod?: string;
  notes?: string;
}

// Format currency for display
const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('fr-DZ') + ' DA';
};

// Format order notification message
const formatOrderMessage = (order: OrderNotification): string => {
  const lines = [
    `🛒 *NOUVELLE COMMANDE*`,
    ``,
    `📦 *Commande:* #${order.orderId}`,
    ``,
    `👤 *Client:* ${order.customerName}`,
    `📱 *Téléphone:* ${order.customerPhone}`,
  ];

  if (order.customerEmail) {
    lines.push(`📧 *Email:* ${order.customerEmail}`);
  }

  if (order.customerAddress) {
    lines.push(`📍 *Adresse:* ${order.customerAddress}`);
  }

  lines.push(``);
  lines.push(`💰 *Total:* ${formatCurrency(order.totalAmount)}`);
  lines.push(`📊 *Articles:* ${order.itemCount} produit(s)`);

  if (order.items && order.items.length > 0) {
    lines.push(``);
    lines.push(`📋 *Détails:*`);
    order.items.slice(0, 5).forEach((item, index) => {
      lines.push(`  ${index + 1}. ${item.name} x${item.quantity} - ${formatCurrency(item.price * item.quantity)}`);
    });
    if (order.items.length > 5) {
      lines.push(`  ... et ${order.items.length - 5} autre(s)`);
    }
  }

  if (order.paymentMethod) {
    lines.push(``);
    lines.push(`💳 *Paiement:* ${order.paymentMethod}`);
  }

  if (order.notes) {
    lines.push(``);
    lines.push(`📝 *Notes:* ${order.notes}`);
  }

  lines.push(``);
  lines.push(`⏰ *Reçue:* ${new Date().toLocaleString('fr-FR', { 
    dateStyle: 'short', 
    timeStyle: 'short' 
  })}`);

  return lines.join('\n');
};

// Send message via Telegram Bot API
export async function sendTelegramMessage(
  config: TelegramConfig,
  message: string,
  parseMode: 'Markdown' | 'HTML' = 'Markdown',
  timeoutMs: number = 10000 // 10 second timeout
): Promise<{ success: boolean; error?: string }> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const url = `${TELEGRAM_API_BASE}${config.botToken}/sendMessage`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: config.chatId,
        text: message,
        parse_mode: parseMode,
      }),
      signal: controller.signal,
    });

    // Parse JSON before clearing timeout to protect against slow parsing
    const data = await response.json();
    
    // Clear timeout only after both fetch and JSON parsing complete
    clearTimeout(timeoutId);

    if (!data.ok) {
      console.error('Telegram API error:', data);
      return { success: false, error: data.description || 'Unknown error' };
    }

    return { success: true };
  } catch (error) {
    // Always clear timeout in catch block
    clearTimeout(timeoutId);
    
    // Handle abort/timeout specifically
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('Telegram request timed out');
      return { success: false, error: 'Délai d\'attente dépassé (timeout)' };
    }
    
    console.error('Failed to send Telegram message:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Network error' 
    };
  }
}

// Send order notification
export async function sendOrderNotification(
  config: TelegramConfig,
  order: OrderNotification
): Promise<{ success: boolean; error?: string }> {
  const message = formatOrderMessage(order);
  return sendTelegramMessage(config, message, 'Markdown');
}

// Test the bot connection
export async function testTelegramConnection(
  config: TelegramConfig
): Promise<{ success: boolean; error?: string }> {
  const testMessage = `✅ *Test de connexion réussi!*\n\nVotre bot MAMI PUB est correctement configuré.\n\n⏰ ${new Date().toLocaleString('fr-FR')}`;
  return sendTelegramMessage(config, testMessage, 'Markdown');
}

// Validate bot token format
export function isValidBotToken(token: string): boolean {
  // Bot tokens are in format: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz
  return /^\d+:[A-Za-z0-9_-]+$/.test(token);
}

// Validate chat ID format
export function isValidChatId(chatId: string): boolean {
  // Chat IDs are numeric (can be negative for groups)
  return /^-?\d+$/.test(chatId);
}

export type { TelegramConfig, OrderNotification };
