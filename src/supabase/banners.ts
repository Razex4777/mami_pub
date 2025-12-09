// Store Banners API
import { supabase } from './core';
import type { StoreBanner, StoreBannerInsert, StoreBannerUpdate } from './types';

// Fetch all active banners (public)
export async function getActiveBanners(): Promise<StoreBanner[]> {
  const { data, error } = await supabase
    .from('store_banners')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

// Fetch all banners (admin)
export async function getAllBanners(): Promise<StoreBanner[]> {
  const { data, error } = await supabase
    .from('store_banners')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

// Get single banner by ID
export async function getBannerById(id: string): Promise<StoreBanner | null> {
  const { data, error } = await supabase
    .from('store_banners')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

// Create new banner
export async function createBanner(banner: StoreBannerInsert): Promise<StoreBanner> {
  const { data, error } = await supabase
    .from('store_banners')
    .insert(banner)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update banner
export async function updateBanner(id: string, updates: StoreBannerUpdate): Promise<StoreBanner> {
  const { data, error } = await supabase
    .from('store_banners')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Delete banner
export async function deleteBanner(id: string): Promise<void> {
  const { error } = await supabase
    .from('store_banners')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Reorder banners
export async function reorderBanners(orderedIds: string[]): Promise<void> {
  const updates = orderedIds.map((id, index) => 
    supabase
      .from('store_banners')
      .update({ display_order: index })
      .eq('id', id)
  );

  await Promise.all(updates);
}
