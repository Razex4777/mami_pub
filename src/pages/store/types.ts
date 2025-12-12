// Store types and interfaces

export interface ProductSpec {
  name: string;
  description: string;
}

export interface Product {
  id: string; // UUID from Supabase
  name: string;
  category: string;
  price: number;
  image: string;
  images?: string[]; // All images for hover swipe
  description?: string;
  specs?: ProductSpec[];
  tags?: string[];
  condition?: 'new' | 'used';
  viewerCount?: number;
  createdAt?: string; // ISO date string for sorting by newest
}

export interface FilterState {
  priceRange: [number, number];
  categories: string[];
  condition: 'all' | 'new' | 'used';
  showFavoritesOnly: boolean;
}

