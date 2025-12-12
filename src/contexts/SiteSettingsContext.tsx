import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getSettingsMap, updateSetting, uploadSiteAsset, deleteSiteAsset, type SettingKey } from '@/supabase';

const SETTINGS_CACHE_KEY = 'mami_pub_site_settings';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CachedSettings {
  data: Record<SettingKey, string | null>;
  timestamp: number;
}

interface SiteSettingsContextType {
  settings: Record<SettingKey, string | null>;
  isLoading: boolean;
  error: string | null;
  getSetting: (key: SettingKey) => string | null;
  updateSettingValue: (key: SettingKey, value: string | null) => Promise<void>;
  uploadAsset: (file: File, assetType: 'logo' | 'favicon' | 'og_image') => Promise<string>;
  deleteAsset: (url: string) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

// Default settings for fallback
const defaultSettings: Record<SettingKey, string | null> = {
  logo_url: null,
  favicon_url: null,
  site_name: 'MAMI PUB',
  site_title: 'MAMI PUB - Impression & Publicité | Imprimantes Professionnelles Béjaïa',
  site_tagline: 'Qualité Premium',
  contact_phone: '0557 91 45 44',
  contact_email: 'anes.mami.n@gmail.com',
  contact_address: 'Ets Mahamid Mami, El Eulma',
  business_hours: 'Lun-Sam: 9h-18h',
  // Telegram enabled flag (boolean stored as string)
  telegram_enabled: 'false',
  // SECURITY: telegram_bot_token and telegram_chat_id are fetched from DB
  // but NEVER cached in localStorage (filtered by SENSITIVE_KEYS)
  telegram_bot_token: null,
  telegram_chat_id: null,
  email_enabled: 'false',
  email_recipient: null,
  social_facebook: null,
  social_instagram: null,
  social_tiktok: null,
  social_whatsapp: '+213 557 91 45 44',
  site_description: 'MAMI PUB - Votre partenaire en impression et publicité à Béjaïa.',
  keywords: 'imprimante, impression, publicité, Béjaïa, Algérie',
  og_image: null,
};

// Sensitive keys that should NOT be cached in localStorage
const SENSITIVE_KEYS: SettingKey[] = ['telegram_bot_token', 'telegram_chat_id'];

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

// Load from localStorage cache
const loadFromCache = (): Record<SettingKey, string | null> | null => {
  try {
    const cached = localStorage.getItem(SETTINGS_CACHE_KEY);
    if (cached) {
      const parsed: CachedSettings = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_DURATION) {
        return parsed.data;
      }
    }
  } catch (error) {
    console.error('Error loading settings from cache:', error);
  }
  return null;
};

// Save to localStorage cache (excluding sensitive keys)
const saveToCache = (data: Record<SettingKey, string | null>) => {
  try {
    // Filter out sensitive credentials before caching
    const safeData = { ...data };
    SENSITIVE_KEYS.forEach(key => {
      safeData[key] = null;
    });
    
    const cached: CachedSettings = {
      data: safeData,
      timestamp: Date.now(),
    };
    localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(cached));
  } catch (error) {
    console.error('Error saving settings to cache:', error);
  }
};

export const SiteSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Record<SettingKey, string | null>>(() => {
    // Try to load from cache first for instant display
    return loadFromCache() || defaultSettings;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch settings from Supabase
  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getSettingsMap();
      
      // Merge with defaults (in case some settings are missing)
      const merged = { ...defaultSettings, ...data };
      setSettings(merged);
      saveToCache(merged);
    } catch (err) {
      console.error('Failed to fetch site settings:', err);
      setError('Failed to load settings');
      // Keep using cached/default settings
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Update document head when settings change
  useEffect(() => {
    // Update title
    if (settings.site_title) {
      document.title = settings.site_title;
    }

    // Update favicon
    if (settings.favicon_url) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = settings.favicon_url;
    }

    // Update meta description
    if (settings.site_description) {
      let meta = document.querySelector("meta[name='description']") as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'description';
        document.head.appendChild(meta);
      }
      meta.content = settings.site_description;
    }

    // Update OG image
    if (settings.og_image) {
      let ogImage = document.querySelector("meta[property='og:image']") as HTMLMetaElement;
      if (!ogImage) {
        ogImage = document.createElement('meta');
        ogImage.setAttribute('property', 'og:image');
        document.head.appendChild(ogImage);
      }
      ogImage.content = settings.og_image;
    }

    // Update keywords
    if (settings.keywords) {
      let keywords = document.querySelector("meta[name='keywords']") as HTMLMetaElement;
      if (!keywords) {
        keywords = document.createElement('meta');
        keywords.name = 'keywords';
        document.head.appendChild(keywords);
      }
      keywords.content = settings.keywords;
    }
  }, [settings]);

  const getSetting = useCallback((key: SettingKey): string | null => {
    return settings[key] ?? defaultSettings[key];
  }, [settings]);

  const updateSettingValue = useCallback(async (key: SettingKey, value: string | null) => {
    try {
      await updateSetting(key, value);
      setSettings(prev => {
        const updated = { ...prev, [key]: value };
        saveToCache(updated);
        return updated;
      });
    } catch (err) {
      console.error('Failed to update setting:', err);
      throw err;
    }
  }, []);

  const uploadAsset = useCallback(async (file: File, assetType: 'logo' | 'favicon' | 'og_image'): Promise<string> => {
    const url = await uploadSiteAsset(file, assetType);
    return url;
  }, []);

  const deleteAsset = useCallback(async (url: string) => {
    await deleteSiteAsset(url);
  }, []);

  const refreshSettings = useCallback(async () => {
    await fetchSettings();
  }, [fetchSettings]);

  return (
    <SiteSettingsContext.Provider
      value={{
        settings,
        isLoading,
        error,
        getSetting,
        updateSettingValue,
        uploadAsset,
        deleteAsset,
        refreshSettings,
      }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => {
  const context = useContext(SiteSettingsContext);
  if (context === undefined) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
};

export default SiteSettingsContext;
