// Products API
import { supabase } from './core';
import type { Product, ProductInsert, ProductUpdate } from './types';

// Fetch all active products (public store)
export async function getActiveProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'active')
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as Product[]) ?? [];
}

// Fetch all products (admin)
export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as Product[]) ?? [];
}

// Get single product by ID
export async function getProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Product | null;
}

// Get product by SKU
export async function getProductBySku(sku: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('sku', sku)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
  return data as Product | null;
}

// Create new product
export async function createProduct(product: ProductInsert): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert(product as never)
    .select()
    .single();

  if (error) throw error;
  return data as Product;
}

// Update product
export async function updateProduct(id: string, updates: ProductUpdate): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .update(updates as never)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Product;
}

// Delete product
export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Bulk update products status
export async function bulkUpdateProductsStatus(ids: string[], status: Product['status']): Promise<void> {
  const { error } = await supabase
    .from('products')
    .update({ status } as never)
    .in('id', ids);

  if (error) throw error;
}

// Bulk delete products
export async function bulkDeleteProducts(ids: string[]): Promise<void> {
  const { error } = await supabase
    .from('products')
    .delete()
    .in('id', ids);

  if (error) throw error;
}

// Get products by category
export async function getProductsByCategory(category: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .eq('status', 'active')
    .order('featured', { ascending: false });

  if (error) throw error;
  return (data as Product[]) ?? [];
}

// Get featured products
export async function getFeaturedProducts(limit = 6): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'active')
    .eq('featured', true)
    .limit(limit);

  if (error) throw error;
  return (data as Product[]) ?? [];
}

// Search products
export async function searchProducts(query: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'active')
    .or(`name.ilike.%${query}%,description.ilike.%${query}%,sku.ilike.%${query}%`)
    .order('featured', { ascending: false });

  if (error) throw error;
  return (data as Product[]) ?? [];
}

// Get product statistics (for admin dashboard)
export async function getProductStats(): Promise<{
  total: number;
  active: number;
  lowStock: number;
  outOfStock: number;
  totalValue: number;
}> {
  const { data, error } = await supabase
    .from('products')
    .select('*');

  if (error) throw error;

  const products = (data as Product[]) ?? [];
  
  return {
    total: products.length,
    active: products.filter(p => p.status === 'active').length,
    lowStock: products.filter(p => p.stock <= p.min_stock && p.stock > 0).length,
    outOfStock: products.filter(p => p.stock === 0).length,
    totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0),
  };
}

// Get unique categories
export async function getCategories(): Promise<string[]> {
  const { data, error } = await supabase
    .from('products')
    .select('category')
    .eq('status', 'active');

  if (error) throw error;
  
  const categories = [...new Set((data as { category: string }[] ?? []).map(p => p.category))];
  return categories;
}
