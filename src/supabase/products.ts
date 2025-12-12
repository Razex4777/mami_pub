// Products API
import { supabase } from './core';
import type { Product, ProductInsert, ProductUpdate } from './types';

// Fetch all active products (public store)
export async function getActiveProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'active')
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

  if (error && error.code === 'PGRST116') return null; // Not found
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
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as Product[]) ?? [];
}

// Get most viewed products
export async function getMostViewedProducts(limit = 6): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'active')
    .order('viewer_count', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data as Product[]) ?? [];
}

// Increment viewer count for a product (atomic operation)
export async function incrementViewerCount(id: string): Promise<void> {
  // Use atomic increment via RPC to prevent race conditions
  const { error } = await supabase.rpc('increment_viewer_count', { product_id: id } as never);
  
  if (error) {
    // Fallback to manual increment if RPC doesn't exist
    // WARNING: This fallback is NOT atomic and may lose increments under concurrent access
    if (error.code === 'PGRST202' || error.message.includes('function')) {
      console.warn('RPC increment_viewer_count not found, using non-atomic fallback (race condition possible)');
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('viewer_count')
        .eq('id', id)
        .single();
      
      if (fetchError) {
        throw new Error(`Failed to fetch product for viewer count increment: ${fetchError.message}`);
      }
      
      if (!product) {
        throw new Error(`Product not found for viewer count increment: ${id}`);
      }
      
      const currentCount = (product as { viewer_count: number }).viewer_count || 0;
      const { error: updateError } = await supabase
        .from('products')
        .update({ viewer_count: currentCount + 1 } as never)
        .eq('id', id);
      
      if (updateError) {
        throw new Error(`Failed to update viewer count: ${updateError.message}`);
      }
    } else {
      // Non-RPC errors should be thrown so callers can react
      throw new Error(`Failed to increment viewer count via RPC: ${error.message}`);
    }
  }
}

// Search products
export async function searchProducts(query: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('status', 'active')
    .or(`name.ilike.%${query}%,description.ilike.%${query}%,sku.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as Product[]) ?? [];
}

// Get product statistics (for admin dashboard) using database aggregation
export async function getProductStats(): Promise<{
  total: number;
  active: number;
  totalValue: number;
}> {
  // Run parallel queries for better performance
  const [totalResult, activeResult, valueResult] = await Promise.all([
    // Total count
    supabase.from('products').select('*', { count: 'exact', head: true }),
    // Active count
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    // Total value - need to fetch price for calculation
    supabase.from('products').select('price'),
  ]);

  if (totalResult.error) throw totalResult.error;
  if (activeResult.error) throw activeResult.error;
  if (valueResult.error) throw valueResult.error;

  // Calculate total value from minimal data
  const totalValue = (valueResult.data ?? []).reduce(
    (sum: number, p: { price: number }) => sum + p.price, 
    0
  );

  return {
    total: totalResult.count ?? 0,
    active: activeResult.count ?? 0,
    totalValue,
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
