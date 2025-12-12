import { supabase } from './core';

// Coupon types
export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount_amount: number | null;
  max_uses: number | null;
  current_uses: number;
  expires_at: string | null;
  status: 'active' | 'inactive' | 'expired';
  created_at: string;
  updated_at: string;
}

export type CouponInsert = Omit<Coupon, 'id' | 'current_uses' | 'created_at' | 'updated_at'>;
export type CouponUpdate = Partial<CouponInsert>;

// Get all coupons (admin)
export async function getAllCoupons(): Promise<Coupon[]> {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return (data as Coupon[]) ?? [];
}

// Get coupon by ID
export async function getCouponById(id: string): Promise<Coupon | null> {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) return null;
  return data as Coupon;
}

// Validate and get coupon by code (public)
export async function validateCoupon(code: string, orderAmount: number): Promise<{
  valid: boolean;
  coupon?: Coupon;
  discount?: number;
  error?: string;
}> {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .single();
  
  if (error || !data) {
    return { valid: false, error: 'Code promo invalide' };
  }

  const coupon = data as Coupon;

  // Check status
  if (coupon.status !== 'active') {
    return { valid: false, error: 'Ce code promo n\'est plus actif' };
  }

  // Check expiration
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return { valid: false, error: 'Ce code promo a expiré' };
  }

  // Check max uses
  if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
    return { valid: false, error: 'Ce code promo a atteint sa limite d\'utilisation' };
  }

  // Check minimum order amount
  if (orderAmount < coupon.min_order_amount) {
    return { 
      valid: false, 
      error: `Commande minimum de ${coupon.min_order_amount} DA requise` 
    };
  }

  // Calculate discount
  let discount = 0;
  if (coupon.discount_type === 'percentage') {
    discount = (orderAmount * coupon.discount_value) / 100;
    // Apply max discount cap if set
    if (coupon.max_discount_amount && discount > coupon.max_discount_amount) {
      discount = coupon.max_discount_amount;
    }
  } else {
    discount = coupon.discount_value;
  }

  // Discount cannot exceed order amount
  if (discount > orderAmount) {
    discount = orderAmount;
  }

  return { valid: true, coupon, discount };
}

// Use coupon (increment current_uses atomically)
export async function useCoupon(id: string): Promise<void> {
  // Use atomic increment via RPC to prevent race conditions
  const { error } = await supabase.rpc('increment_coupon_uses', { coupon_id: id } as never);
  
  if (error) {
    // Fallback to atomic SQL update if RPC doesn't exist
    if (error.code === 'PGRST202' || error.message.includes('function')) {
      console.warn('RPC increment_coupon_uses not found, using raw SQL fallback');
      
      // Use raw SQL for atomic increment to avoid race conditions
      const { data, error: sqlError } = await supabase
        .from('coupons')
        .update({ current_uses: supabase.sql`current_uses + 1` } as never)
        .eq('id', id)
        .select('id');
      
      if (sqlError) {
        // If raw SQL doesn't work, fall back to non-atomic update with warning
        console.warn('Raw SQL update failed, using non-atomic fallback (race condition possible)');
        const { count, error: updateError } = await supabase
          .from('coupons')
          .update({ current_uses: supabase.sql`COALESCE(current_uses, 0) + 1` } as never)
          .eq('id', id);
        
        // If that also fails, do a simple read-then-write (last resort, not atomic)
        if (updateError) {
          const { data: coupon, error: fetchError } = await supabase
            .from('coupons')
            .select('current_uses')
            .eq('id', id)
            .single();

          if (fetchError || !coupon) {
            throw new Error(`Coupon not found or fetch failed: ${id}`);
          }

          const currentUses = (coupon as { current_uses: number }).current_uses || 0;
          const { error: finalUpdateError } = await supabase
            .from('coupons')
            .update({ current_uses: currentUses + 1 } as never)
            .eq('id', id);
          
          if (finalUpdateError) {
            throw new Error(`Failed to increment coupon uses: ${finalUpdateError.message}`);
          }
        }
      } else if (!data || data.length === 0) {
        throw new Error(`Coupon not found: ${id}`);
      }
    } else {
      throw new Error(`Failed to increment coupon uses via RPC: ${error.message}`);
    }
  }
}

// Create coupon (admin)
export async function createCoupon(coupon: CouponInsert): Promise<Coupon> {
  const { data, error } = await supabase
    .from('coupons')
    .insert({
      ...coupon,
      code: coupon.code.toUpperCase(),
    } as never)
    .select()
    .single();
  
  if (error) throw error;
  return data as Coupon;
}

// Update coupon (admin)
export async function updateCoupon(id: string, updates: CouponUpdate): Promise<Coupon> {
  const updateData = { ...updates };
  if (updates.code) {
    updateData.code = updates.code.toUpperCase();
  }

  const { data, error } = await supabase
    .from('coupons')
    .update(updateData as never)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Coupon;
}

// Delete coupon (admin)
export async function deleteCoupon(id: string): Promise<void> {
  const { error } = await supabase
    .from('coupons')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// Toggle coupon status (admin)
export async function toggleCouponStatus(id: string, status: 'active' | 'inactive'): Promise<void> {
  const { error } = await supabase
    .from('coupons')
    .update({ status } as never)
    .eq('id', id);
  
  if (error) throw error;
}
