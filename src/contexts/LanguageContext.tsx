import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Import only non-French translations (French is the default/main language)
import enHome from '@/translations/en/home.json';
import arHome from '@/translations/ar/home.json';
import enNavbar from '@/translations/en/navbar.json';
import arNavbar from '@/translations/ar/navbar.json';
import enSidebar from '@/translations/en/sidebar.json';
import arSidebar from '@/translations/ar/sidebar.json';
import enMobiletabbar from '@/translations/en/mobiletabbar.json';
import arMobiletabbar from '@/translations/ar/mobiletabbar.json';
import enStore from '@/translations/en/store.json';
import arStore from '@/translations/ar/store.json';
import enCart from '@/translations/en/cart.json';
import arCart from '@/translations/ar/cart.json';
import enProductview from '@/translations/en/productview.json';
import arProductview from '@/translations/ar/productview.json';
import enAdminNavbar from '@/translations/en/admin_navbar.json';
import arAdminNavbar from '@/translations/ar/admin_navbar.json';
import enAdminSidebar from '@/translations/en/admin_sidebar.json';
import arAdminSidebar from '@/translations/ar/admin_sidebar.json';
import enOverview from '@/translations/en/overview.json';
import arOverview from '@/translations/ar/overview.json';
import enToast from '@/translations/en/toast.json';
import arToast from '@/translations/ar/toast.json';
import enCheckout from '@/translations/en/checkout.json';
import arCheckout from '@/translations/ar/checkout.json';
import enAdminProducts from '@/translations/en/admin_products.json';
import arAdminProducts from '@/translations/ar/admin_products.json';
import enAdminCategories from '@/translations/en/admin_categories.json';
import arAdminCategories from '@/translations/ar/admin_categories.json';
import enAdminOrders from '@/translations/en/admin_orders.json';
import arAdminOrders from '@/translations/ar/admin_orders.json';
import enAdminBanners from '@/translations/en/admin_banners.json';
import arAdminBanners from '@/translations/ar/admin_banners.json';
import enAdminCoupons from '@/translations/en/admin_coupons.json';
import arAdminCoupons from '@/translations/ar/admin_coupons.json';
import enAdminSettings from '@/translations/en/admin_settings.json';
import arAdminSettings from '@/translations/ar/admin_settings.json';
import enComponents from '@/translations/en/components.json';
import arComponents from '@/translations/ar/components.json';

export type Language = 'fr' | 'en' | 'ar';

export interface LanguageInfo {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

export const languages: LanguageInfo[] = [
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇩🇿' },
];

// Translations structure - only for non-French languages
const translations = {
  en: { 
    home: enHome, 
    navbar: enNavbar, 
    sidebar: enSidebar, 
    mobiletabbar: enMobiletabbar, 
    store: enStore, 
    cart: enCart, 
    productview: enProductview,
    admin_navbar: enAdminNavbar,
    admin_sidebar: enAdminSidebar,
    overview: enOverview,
    toast: enToast,
    checkout: enCheckout,
    admin_products: enAdminProducts,
    admin_categories: enAdminCategories,
    admin_orders: enAdminOrders,
    admin_banners: enAdminBanners,
    admin_coupons: enAdminCoupons,
    admin_settings: enAdminSettings,
    components: enComponents
  },
  ar: { 
    home: arHome, 
    navbar: arNavbar, 
    sidebar: arSidebar, 
    mobiletabbar: arMobiletabbar, 
    store: arStore, 
    cart: arCart, 
    productview: arProductview,
    admin_navbar: arAdminNavbar,
    admin_sidebar: arAdminSidebar,
    overview: arOverview,
    toast: arToast,
    checkout: arCheckout,
    admin_products: arAdminProducts,
    admin_categories: arAdminCategories,
    admin_orders: arAdminOrders,
    admin_banners: arAdminBanners,
    admin_coupons: arAdminCoupons,
    admin_settings: arAdminSettings,
    components: arComponents
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, namespace?: string) => string;
  languages: LanguageInfo[];
  currentLanguage: LanguageInfo;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'mami-pub-language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Get from localStorage or default to French
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && ['fr', 'en', 'ar'].includes(saved)) {
        return saved as Language;
      }
    }
    return 'fr';
  });

  // Save to localStorage when language changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
    
    // Set document lang attribute (keep LTR for all languages)
    document.documentElement.lang = language;
  }, [language]);

  // Apply saved language on mount (handles SSR/hydration)
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && ['fr', 'en', 'ar'].includes(saved) && saved !== language) {
      setLanguageState(saved as Language);
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  // Translation function - supports nested keys like "hero.title"
  // For French (default), returns the key itself - components show French text directly
  // For en/ar, looks up translation from JSON files
  const t = useCallback((key: string, namespace: string = 'home'): string => {
    // French is the default - return key, components will show French text directly
    if (language === 'fr') {
      return key;
    }
    
    try {
      const langTranslations = translations[language as 'en' | 'ar'];
      if (!langTranslations) return key;
      
      const namespaceTranslations = langTranslations[namespace as keyof typeof langTranslations];
      if (!namespaceTranslations) return key;

      const keys = key.split('.');
      let value: any = namespaceTranslations;
      
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          return key; // Key not found, return the key itself
        }
      }
      
      return typeof value === 'string' ? value : key;
    } catch {
      return key;
    }
  }, [language]);

  const currentLanguage = languages.find(l => l.code === language) || languages[0];

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      t, 
      languages,
      currentLanguage 
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
