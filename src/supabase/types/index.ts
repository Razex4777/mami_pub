// ============================================
// Supabase Database Types
// ============================================

export interface StoreBanner {
  id: string;
  title: string;
  image_url: string;
  alt_text: string;
  link_url: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export type StoreBannerInsert = Omit<StoreBanner, 'id' | 'created_at' | 'updated_at'>;
export type StoreBannerUpdate = Partial<StoreBannerInsert>;

// Categories
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type CategoryInsert = Omit<Category, 'id' | 'created_at' | 'updated_at'>;
export type CategoryUpdate = Partial<CategoryInsert>;

// Product Specification Block
export interface ProductSpec {
  name: string;
  description: string;
}

// Product Condition Type
export type ProductCondition = 'new' | 'used';

// Products (Supabase schema - snake_case)
export interface Product {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  cost: number;
  status: 'active' | 'inactive' | 'discontinued';
  sku: string | null;
  images: string[];  // Can include both images and videos
  tags: string[];
  specs: ProductSpec[] | null;
  condition: ProductCondition;
  viewer_count: number;
  created_at: string;
  updated_at: string;
}

export type ProductInsert = Omit<Product, 'id' | 'created_at' | 'updated_at'>;
export type ProductUpdate = Partial<ProductInsert>;

// Admin Activities
export interface AdminActivity {
  id: string;
  type: 'product' | 'order' | 'coupon' | 'banner' | 'settings' | 'system';
  action: string;
  entity_id: string | null;
  entity_name: string | null;
  details: any | null;
  performed_by: string | null;
  performed_by_name: string | null;
  created_at: string;
}

export type AdminActivityInsert = Omit<AdminActivity, 'id' | 'created_at'>;

// Database schema type for Supabase client
export interface Database {
  public: {
    Tables: {
      store_banners: {
        Row: StoreBanner;
        Insert: StoreBannerInsert;
        Update: StoreBannerUpdate;
      };
      categories: {
        Row: Category;
        Insert: CategoryInsert;
        Update: CategoryUpdate;
      };
      products: {
        Row: Product;
        Insert: ProductInsert;
        Update: ProductUpdate;
      };
      admin_activities: {
        Row: AdminActivity;
        Insert: AdminActivityInsert;
        Update: never;
      };
    };
  };
}

// ============================================
// Admin Dashboard Types (local UI types)
// ============================================

// Admin Product type (camelCase for UI)
export interface AdminProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  cost: number;
  status: 'active' | 'inactive' | 'discontinued';
  sku: string;
  images: string[];  // Can include both images and videos
  createdAt: string;
  updatedAt: string;
  tags: string[];
  specs: ProductSpec[];
  condition: ProductCondition;
  viewer_count: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  avatar?: string;
  lastLogin?: string;
  isActive: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  items: OrderItem[];
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  createdAt: string;
  updatedAt: string;
  shippingAddress: Address;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  trackingNumber?: string;
  notes?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Analytics {
  totalRevenue: number;
  totalProfit?: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueGrowth: number;
  ordersGrowth: number;
  customersGrowth: number;
  productsGrowth: number;
  revenueByMonth: RevenueByMonth[];
  ordersByStatus: OrdersByStatus[];
  topProducts: TopProduct[];
  categoryDistribution: CategoryDistribution[];
  productHealth: ProductHealth;
  recentActivities: Activity[];
}

export interface CategoryDistribution {
  name: string;
  count: number;
  percentage: number;
  revenue: number;
}

export interface ProductHealth {
  total: number;
  active: number;
  inactive: number;
  lowStock: number;
  outOfStock: number;
}

export interface RevenueByMonth {
  month: string;
  revenue: number;
  orders: number;
}

export interface OrdersByStatus {
  status: string;
  count: number;
  percentage: number;
}

export interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
}

export interface Activity {
  id: string;
  type: 'order' | 'product' | 'customer' | 'system';
  title: string;
  description: string;
  timestamp: string;
  userId?: string;
  userName?: string;
  metadata?: Record<string, any>;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'stat' | 'list' | 'table';
  title: string;
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number };
  config: Record<string, any>;
  isVisible: boolean;
}
