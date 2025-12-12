// Site Settings API
import { supabase } from './core';

export interface SiteSetting {
  id: string;
  key: string;
  value: string | null;
  type: 'text' | 'image' | 'url' | 'boolean';
  category: 'general' | 'contact' | 'social' | 'seo';
  label: string;
  updated_at: string;
}

export type SiteSettingUpdate = Pick<SiteSetting, 'value'>;

// Settings keys for type safety
export type SettingKey = 
  // General
  | 'logo_url'
  | 'favicon_url'
  | 'site_name'
  | 'site_title'
  | 'site_tagline'
  // Contact
  | 'contact_phone'
  | 'contact_email'
  | 'contact_address'
  | 'business_hours'
  // Telegram Notifications
  | 'telegram_bot_token'
  | 'telegram_chat_id'
  | 'telegram_enabled'
  // Email Notifications
  | 'email_enabled'
  | 'email_recipient'
  // Social
  | 'social_facebook'
  | 'social_instagram'
  | 'social_tiktok'
  | 'social_whatsapp'
  // SEO
  | 'site_description'
  | 'keywords'
  | 'og_image';

// Fetch all settings
export async function getAllSettings(): Promise<SiteSetting[]> {
  const { data, error } = await supabase
    .from('site_settings' as any)
    .select('*')
    .order('category', { ascending: true });

  if (error) throw error;
  return (data ?? []) as SiteSetting[];
}

// Fetch settings by category
export async function getSettingsByCategory(category: SiteSetting['category']): Promise<SiteSetting[]> {
  const { data, error } = await supabase
    .from('site_settings' as any)
    .select('*')
    .eq('category', category);

  if (error) throw error;
  return (data ?? []) as SiteSetting[];
}

// Get single setting by key
export async function getSetting(key: SettingKey): Promise<string | null> {
  const { data, error } = await supabase
    .from('site_settings' as any)
    .select('value')
    .eq('key', key)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return (data as any)?.value ?? null;
}

// Get multiple settings by keys (optimized batch fetch)
export async function getSettings(keys: SettingKey[]): Promise<Record<SettingKey, string | null>> {
  const { data, error } = await supabase
    .from('site_settings' as any)
    .select('key, value')
    .in('key', keys);

  if (error) throw error;

  const result: Record<string, string | null> = {};
  const settings = (data ?? []) as Array<{ key: string; value: string | null }>;
  keys.forEach(key => {
    const setting = settings.find(s => s.key === key);
    result[key] = setting?.value ?? null;
  });
  return result as Record<SettingKey, string | null>;
}

// Update single setting
export async function updateSetting(key: SettingKey, value: string | null): Promise<SiteSetting> {
  // Use RPC or raw query approach to avoid type issues
  const { data, error } = await (supabase as any)
    .from('site_settings')
    .update({ value })
    .eq('key', key)
    .select()
    .single();

  if (error) throw error;
  return data as SiteSetting;
}

// Update multiple settings at once
export async function updateSettings(updates: Partial<Record<SettingKey, string | null>>): Promise<void> {
  const promises = Object.entries(updates).map(([key, value]) =>
    (supabase as any)
      .from('site_settings')
      .update({ value })
      .eq('key', key)
  );

  const results = await Promise.all(promises);
  const keys = Object.keys(updates);
  const errors = results
    .map((r: any, idx) => ({ key: keys[idx], error: r.error }))
    .filter(r => r.error);
  if (errors.length > 0) {
    const failedKeys = errors.map(e => e.key).join(', ');
    throw new Error(
      `Failed to update ${errors.length} setting(s): ${failedKeys}. ` +
      `First error: ${errors[0].error.message}`
    );
  }
}

// Upload site asset (logo, favicon, og_image)
export async function uploadSiteAsset(
  file: File,
  assetType: 'logo' | 'favicon' | 'og_image'
): Promise<string> {
  // Validate file type
  const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml'];
  if (!validTypes.includes(file.type)) {
    throw new Error(`Invalid file type. Expected image, got ${file.type}`);
  }
  
  // Validate file size (e.g., 5MB limit)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error(`File too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
  }

  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png';
  const fileName = `${assetType}_${Date.now()}.${fileExt}`;
  const filePath = `${assetType}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('site-assets')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('site-assets')
    .getPublicUrl(filePath);

  return data.publicUrl;
}
// Delete site asset
export async function deleteSiteAsset(url: string): Promise<void> {
  // Extract path from URL
  const urlObj = new URL(url);
  const pathMatch = urlObj.pathname.match(/\/site-assets\/(.+)$/);
  if (!pathMatch) {
    throw new Error(
      `Invalid site-assets URL: "${url}". URL must contain /site-assets/ path.`
    );
  }

  const filePath = pathMatch[1];
  const { error } = await supabase.storage
    .from('site-assets')
    .remove([filePath]);

  if (error) throw error;
}

// Helper to get all settings as a flat object
export async function getSettingsMap(): Promise<Record<SettingKey, string | null>> {
  const settings = await getAllSettings();
  const map: Record<string, string | null> = {};
  settings.forEach(s => {
    map[s.key] = s.value;
  });
  return map as Record<SettingKey, string | null>;
}
