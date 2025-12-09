// Supabase Database Types

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

// Products
export interface Product {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  cost: number;
  stock: number;
  min_stock: number;
  status: 'active' | 'inactive' | 'discontinued';
  sku: string;
  images: string[];
  supplier: string | null;
  tags: string[];
  rating: number;
  reviews_count: number;
  featured: boolean;
  discount: number;
  delivery_time: string | null;
  specs: string | null;
  created_at: string;
  updated_at: string;
}

export type ProductInsert = Omit<Product, 'id' | 'created_at' | 'updated_at'>;
export type ProductUpdate = Partial<ProductInsert>;

// Database schema type for Supabase client
export interface Database {
  public: {
    Tables: {
      store_banners: {
        Row: StoreBanner;
        Insert: StoreBannerInsert;
        Update: StoreBannerUpdate;
      };
      products: {
        Row: Product;
        Insert: ProductInsert;
        Update: ProductUpdate;
      };
    };
  };
}
