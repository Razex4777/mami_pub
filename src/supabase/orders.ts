import { supabase } from './core';

// ============================================
// Order Types for Supabase
// ============================================

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface SupabaseOrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  quantity: number;
  price: number;
  total: number;
}

export interface ShippingAddress {
  wilaya: string;
  commune: string;
  address: string;
}

export interface OrderCustomer {
  first_name: string;
  last_name: string;
  phone: string;
  email?: string;
}

export interface SupabaseOrder {
  id: string;
  order_number: string;
  customer: OrderCustomer;
  items: SupabaseOrderItem[];
  status: OrderStatus;
  payment_status: PaymentStatus;
  subtotal: number;
  shipping: number;
  discount: number;
  coupon_code: string | null;
  total: number;
  shipping_address: ShippingAddress;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type OrderInsert = Omit<SupabaseOrder, 'id' | 'created_at' | 'updated_at'>;
export type OrderUpdate = Partial<Omit<SupabaseOrder, 'id' | 'created_at' | 'updated_at'>>;

// ============================================
// Order CRUD Operations
// ============================================

/**
 * Generate a unique order number
 */
export const generateOrderNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${year}${month}${day}-${random}`;
};

/**
 * Get all orders
 */
export const getAllOrders = async (): Promise<SupabaseOrder[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }

  return (data || []) as unknown as SupabaseOrder[];
};

/**
 * Get order by ID
 */
export const getOrderById = async (id: string): Promise<SupabaseOrder | null> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('Error fetching order:', error);
    throw error;
  }

  return data as unknown as SupabaseOrder;
};

/**
 * Get orders by status
 */
export const getOrdersByStatus = async (status: OrderStatus): Promise<SupabaseOrder[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders by status:', error);
    throw error;
  }

  return (data || []) as unknown as SupabaseOrder[];
};

/**
 * Create a new order
 */
export const createOrder = async (order: OrderInsert): Promise<SupabaseOrder> => {
  const { data, error } = await supabase
    .from('orders')
    .insert(order as never)
    .select()
    .single();

  if (error) {
    console.error('Error creating order:', error);
    throw error;
  }

  return data as unknown as SupabaseOrder;
};

/**
 * Update an order
 */
export const updateOrder = async (id: string, updates: OrderUpdate): Promise<SupabaseOrder> => {
  const { data, error } = await supabase
    .from('orders')
    .update(updates as never)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating order:', error);
    throw error;
  }

  return data as unknown as SupabaseOrder;
};

/**
 * Update order status
 */
export const updateOrderStatus = async (id: string, status: OrderStatus): Promise<SupabaseOrder> => {
  return updateOrder(id, { status });
};

/**
 * Update payment status
 */
export const updatePaymentStatus = async (id: string, paymentStatus: PaymentStatus): Promise<SupabaseOrder> => {
  return updateOrder(id, { payment_status: paymentStatus });
};

/**
 * Delete an order
 */
export const deleteOrder = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
};

/**
 * Get order statistics
 */
export const getOrderStats = async (): Promise<{
  total: number;
  pending: number;
  confirmed: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  totalRevenue: number;
}> => {
  const { data, error } = await supabase
    .from('orders')
    .select('status, total');

  if (error) {
    console.error('Error fetching order stats:', error);
    throw error;
  }

  const orders = (data || []) as { status: OrderStatus; total: number }[];
  
  return {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    totalRevenue: orders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0),
  };
};
