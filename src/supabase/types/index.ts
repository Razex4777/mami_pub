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

// Database schema type for Supabase client
export interface Database {
  public: {
    Tables: {
      store_banners: {
        Row: StoreBanner;
        Insert: StoreBannerInsert;
        Update: StoreBannerUpdate;
      };
    };
  };
}
