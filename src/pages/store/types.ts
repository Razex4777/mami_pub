// Store types and interfaces

export interface Product {
  id: string; // UUID from Supabase
  name: string;
  category: string;
  price: number;
  image: string;
  specs: string;
  rating?: number;
  reviews?: number;
  inStock?: boolean;
  featured?: boolean;
  tags?: string[];
  deliveryTime?: string;
  discount?: number;
}

export interface FilterState {
  priceRange: [number, number];
  categories: string[];
  inStock: boolean;
  featured: boolean;
  isNew: boolean;
  onSale: boolean;
}

