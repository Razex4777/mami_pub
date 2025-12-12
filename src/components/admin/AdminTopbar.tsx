import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/interactive/button';
import { Input } from '@/components/ui/forms/input';
import {
  Search,
  Menu,
  LayoutDashboard,
  Package,
  FolderOpen,
  ShoppingCart,
  Image,
  Ticket,
  Settings,
  ArrowRight,
  User,
  Loader2,
  Bell,
  X,
  Eye,
  CheckCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/supabase';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNotifications } from '@/contexts/NotificationContext';
import NotificationSidebar from './NotificationSidebar';

// French translations (default)
const fr = {
  search: {
    placeholder: 'Rechercher...',
    sections: 'Sections',
    orders: 'Commandes',
    products: 'Produits',
    categories: 'Catégories',
    coupons: 'Codes Promo',
    noResults: 'Aucun résultat',
    typeToSearch: 'Tapez pour rechercher...'
  },
  sections: {
    dashboard: 'Tableau de bord',
    products: 'Produits',
    categories: 'Catégories',
    orders: 'Commandes',
    banners: 'Bannières',
    coupons: 'Codes Promo',
    settings: 'Paramètres',
    settingsGeneral: 'Paramètres - Général',
    settingsContact: 'Paramètres - Contact',
    settingsSocial: 'Paramètres - Réseaux sociaux',
    settingsSeo: 'Paramètres - SEO',
    settingsNotifications: 'Paramètres - Notifications'
  },
  status: {
    online: 'En ligne'
  }
};

// Admin sections config for quick navigation
const adminSectionsConfig = [
  { nameKey: 'sections.dashboard', nameFr: 'Tableau de bord', path: '/admin', icon: LayoutDashboard, keywords: ['dashboard', 'accueil', 'home', 'stats', 'statistiques'] },
  { nameKey: 'sections.products', nameFr: 'Produits', path: '/admin/products', icon: Package, keywords: ['products', 'articles', 'inventaire', 'stock'] },
  { nameKey: 'sections.categories', nameFr: 'Catégories', path: '/admin/categories', icon: FolderOpen, keywords: ['categories', 'collections', 'groupes'] },
  { nameKey: 'sections.orders', nameFr: 'Commandes', path: '/admin/orders', icon: ShoppingCart, keywords: ['orders', 'ventes', 'achats', 'clients'] },
  { nameKey: 'sections.banners', nameFr: 'Bannières', path: '/admin/banners', icon: Image, keywords: ['banners', 'slides', 'carousel', 'images', 'publicité'] },
  { nameKey: 'sections.coupons', nameFr: 'Codes Promo', path: '/admin/coupons', icon: Ticket, keywords: ['coupons', 'promo', 'réductions', 'discount', 'remise'] },
  { nameKey: 'sections.settings', nameFr: 'Paramètres', path: '/admin/settings', icon: Settings, keywords: ['settings', 'configuration', 'options', 'général', 'contact', 'seo'] },
  { nameKey: 'sections.settingsGeneral', nameFr: 'Paramètres - Général', path: '/admin/settings?tab=general', icon: Settings, keywords: ['logo', 'nom', 'site', 'général'] },
  { nameKey: 'sections.settingsContact', nameFr: 'Paramètres - Contact', path: '/admin/settings?tab=contact', icon: Settings, keywords: ['contact', 'email', 'téléphone', 'adresse'] },
  { nameKey: 'sections.settingsSocial', nameFr: 'Paramètres - Réseaux sociaux', path: '/admin/settings?tab=social', icon: Settings, keywords: ['social', 'facebook', 'instagram', 'tiktok'] },
  { nameKey: 'sections.settingsSeo', nameFr: 'Paramètres - SEO', path: '/admin/settings?tab=seo', icon: Settings, keywords: ['seo', 'meta', 'description', 'référencement'] },
  { nameKey: 'sections.settingsNotifications', nameFr: 'Paramètres - Notifications', path: '/admin/settings?tab=notifications', icon: Settings, keywords: ['notifications', 'telegram', 'alertes', 'bot'] },
];

interface SearchResult {
  type: 'section' | 'order' | 'product' | 'category' | 'coupon';
  name: string;
  path: string;
  icon: React.ElementType;
  subtitle?: string;
}

interface AdminTopbarProps {
  onMenuClick: () => void;
  isMobile: boolean;
}

const AdminTopbar: React.FC<AdminTopbarProps> = ({ onMenuClick, isMobile }) => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { unreadCount, markAllAsRead } = useNotifications();
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [dbResults, setDbResults] = useState<SearchResult[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();
  const searchRequestIdRef = useRef<number>(0);

  // Translation helper
  const getText = (key: string): string => {
    if (language === 'fr') {
      const keys = key.split('.');
      let value: unknown = fr;
      for (const k of keys) {
        if (value && typeof value === 'object') {
          value = (value as Record<string, unknown>)[k];
        } else {
          return key;
        }
      }
      return typeof value === 'string' ? value : key;
    }
    return t(key, 'admin_navbar');
  };

  // Filter sections based on search query
  const filteredSections: SearchResult[] = searchQuery.trim()
    ? adminSectionsConfig
        .filter(section => {
          const query = searchQuery.toLowerCase();
          const sectionName = language === 'fr' ? section.nameFr : getText(section.nameKey);
          return (
            sectionName.toLowerCase().includes(query) ||
            section.keywords.some(kw => kw.toLowerCase().includes(query))
          );
        })
        .map(s => ({
          type: 'section' as const,
          name: language === 'fr' ? s.nameFr : getText(s.nameKey),
          path: s.path,
          icon: s.icon,
        }))
    : [];

  // Combine section results with database results
  const allResults = [...filteredSections, ...dbResults];

  // Memoized grouped results for efficient rendering
  const groupedResults = useMemo(() => {
    const orders = dbResults.filter(r => r.type === 'order');
    const products = dbResults.filter(r => r.type === 'product');
    const categories = dbResults.filter(r => r.type === 'category');
    const coupons = dbResults.filter(r => r.type === 'coupon');
    
    // Calculate start indices for each group
    const ordersStartIndex = filteredSections.length;
    const productsStartIndex = ordersStartIndex + orders.length;
    const categoriesStartIndex = productsStartIndex + products.length;
    const couponsStartIndex = categoriesStartIndex + categories.length;
    
    return {
      orders,
      products,
      categories,
      coupons,
      ordersStartIndex,
      productsStartIndex,
      categoriesStartIndex,
      couponsStartIndex,
    };
  }, [dbResults, filteredSections.length]);

  // Search database for orders, products, categories
  const searchDatabase = useCallback(async (query: string, requestId: number) => {
    if (!query.trim() || query.length < 3) {
      setDbResults([]);
      return;
    }

    setIsLoading(true);
    const results: SearchResult[] = [];

    try {
      // Search orders - fetch all and filter client-side since customer is a JSON column
      const { data: orders } = await supabase
        .from('orders')
        .select('id, order_number, customer')
        .order('created_at', { ascending: false })
        .limit(50);

      // Check if this request is still the latest
      if (requestId !== searchRequestIdRef.current) return;

      if (orders) {
        const queryLower = query.toLowerCase();
        type OrderRow = { id: string; order_number: string; customer: { first_name?: string; last_name?: string; phone?: string } | null };
        const matchingOrders = (orders as OrderRow[]).filter(order => {
          const customer = order.customer;
          const customerName = customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.toLowerCase() : '';
          const customerPhone = customer?.phone || '';
          
          return (
            order.order_number.toLowerCase().includes(queryLower) ||
            customerName.includes(queryLower) ||
            customerPhone.includes(query) // Phone search without lowercase
          );
        }).slice(0, 5);

        matchingOrders.forEach(order => {
          const customer = order.customer;
          const customerName = customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() : 'Client';
          const customerPhone = customer?.phone || '';
          
          results.push({
            type: 'order',
            name: `Commande #${order.order_number}`,
            path: `/admin/orders?search=${order.order_number}`,
            icon: ShoppingCart,
            subtitle: `${customerName}${customerPhone ? ` - ${customerPhone}` : ''}`,
          });
        });
      }

      // Search products by name
      const { data: products } = await supabase
        .from('products')
        .select('id, name, price')
        .ilike('name', `%${query}%`)
        .limit(5);

      if (products) {
        (products as { id: string; name: string; price: number }[]).forEach(product => {
          results.push({
            type: 'product',
            name: product.name,
            path: `/admin/products?search=${encodeURIComponent(product.name)}`,
            icon: Package,
            subtitle: `${product.price.toLocaleString()} DA`,
          });
        });
      }

      // Search categories by name
      const { data: categories } = await supabase
        .from('categories')
        .select('id, name')
        .ilike('name', `%${query}%`)
        .limit(3);

      if (categories) {
        (categories as { id: string; name: string }[]).forEach(category => {
          results.push({
            type: 'category',
            name: category.name,
            path: `/admin/categories?search=${encodeURIComponent(category.name)}`,
            icon: FolderOpen,
            subtitle: 'Catégorie',
          });
        });
      }

      // Search coupons by code
      const { data: coupons } = await supabase
        .from('coupons')
        .select('id, code, discount_type, discount_value, is_active')
        .ilike('code', `%${query}%`)
        .limit(5);

      if (coupons) {
        (coupons as { id: string; code: string; discount_type: string; discount_value: number; is_active: boolean }[]).forEach(coupon => {
          const discountText = coupon.discount_type === 'percentage' 
            ? `${coupon.discount_value}%` 
            : `${coupon.discount_value.toLocaleString()} DA`;
          results.push({
            type: 'coupon',
            name: coupon.code,
            path: `/admin/coupons?search=${encodeURIComponent(coupon.code)}`,
            icon: Ticket,
            subtitle: `${discountText} - ${coupon.is_active ? 'Actif' : 'Inactif'}`,
          });
        });
      }

      // Only update results if this is still the latest request
      if (requestId === searchRequestIdRef.current) {
        setDbResults(results);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      // Only update loading state if this is still the latest request
      if (requestId === searchRequestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (searchQuery.trim().length >= 3) {
      // Increment request ID to invalidate previous requests
      searchRequestIdRef.current += 1;
      const currentRequestId = searchRequestIdRef.current;
      
      debounceRef.current = setTimeout(() => {
        searchDatabase(searchQuery, currentRequestId);
      }, 400); // Increased debounce delay
    } else {
      setDbResults([]);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery, searchDatabase]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [allResults.length]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || allResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % allResults.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + allResults.length) % allResults.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (allResults[selectedIndex]) {
          navigateToResult(allResults[selectedIndex].path);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const navigateToResult = (path: string) => {
    navigate(path);
    setSearchQuery('');
    setIsOpen(false);
    setDbResults([]);
    inputRef.current?.blur();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setIsOpen(e.target.value.trim().length > 0);
  };

  const handleFocus = () => {
    if (searchQuery.trim().length > 0) {
      setIsOpen(true);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'section': return 'Section';
      case 'order': return 'Commande';
      case 'product': return 'Produit';
      case 'category': return 'Catégorie';
      default: return type;
    }
  };

  return (
    <>
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 md:h-16 items-center justify-between px-3 sm:px-4 lg:px-6 gap-2 sm:gap-4">
        {/* Left section */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Menu button - Desktop only */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="h-8 w-8 p-0 hidden md:flex"
          >
            <Menu className="h-4 w-4" />
          </Button>

          {/* Admin title on mobile */}
          <span className="text-sm font-semibold md:hidden">Admin</span>
        </div>

        {/* Search with dropdown - Centered on mobile */}
        <div ref={searchRef} className="relative flex-1 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto sm:mx-0">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
          <Input
            ref={inputRef}
            type="search"
            placeholder={getText('search.placeholder')}
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 h-8 sm:h-9 text-sm bg-muted/50 border-0 focus:bg-background"
          />

          {/* Search Results Dropdown */}
          {isOpen && (allResults.length > 0 || isLoading) && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 w-[calc(100vw-2rem)] sm:w-full mt-1 bg-popover border rounded-lg shadow-lg overflow-hidden z-50 max-h-[60vh] sm:max-h-[400px] overflow-y-auto">
              <div className="p-1">
                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex items-center gap-2 px-2 py-2 text-xs sm:text-sm text-muted-foreground">
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    <span>{language === 'fr' ? 'Recherche en cours...' : 'Searching...'}</span>
                  </div>
                )}

                {/* Section results */}
                {filteredSections.length > 0 && (
                  <>
                    <p className="px-2 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium text-muted-foreground">
                      {getText('search.sections')} ({filteredSections.length})
                    </p>
                    {filteredSections.map((result, index) => {
                      const Icon = result.icon;
                      return (
                        <button
                          key={result.path}
                          onClick={() => navigateToResult(result.path)}
                          className={cn(
                            "w-full flex items-center gap-2 sm:gap-3 px-2 py-1.5 sm:py-2 text-xs sm:text-sm rounded-md transition-colors",
                            index === selectedIndex
                              ? "bg-accent text-accent-foreground"
                              : "hover:bg-accent/50"
                          )}
                        >
                          <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                          <span className="flex-1 text-left truncate">{result.name}</span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                        </button>
                      );
                    })}
                  </>
                )}

                {/* Database results - Orders */}
                {groupedResults.orders.length > 0 && (
                  <>
                    <p className="px-2 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium text-muted-foreground mt-1 sm:mt-2">
                      {getText('search.orders')} ({groupedResults.orders.length})
                    </p>
                    {groupedResults.orders.map((result, i) => {
                      const Icon = result.icon;
                      const globalIndex = groupedResults.ordersStartIndex + i;
                      return (
                        <button
                          key={result.path}
                          onClick={() => navigateToResult(result.path)}
                          className={cn(
                            "w-full flex items-center gap-2 sm:gap-3 px-2 py-1.5 sm:py-2 text-xs sm:text-sm rounded-md transition-colors",
                            globalIndex === selectedIndex
                              ? "bg-accent text-accent-foreground"
                              : "hover:bg-accent/50"
                          )}
                        >
                          <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                          <div className="flex-1 text-left min-w-0">
                            <p className="truncate">{result.name}</p>
                            {result.subtitle && (
                              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{result.subtitle}</p>
                            )}
                          </div>
                          <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                        </button>
                      );
                    })}
                  </>
                )}

                {/* Database results - Products */}
                {groupedResults.products.length > 0 && (
                  <>
                    <p className="px-2 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium text-muted-foreground mt-1 sm:mt-2">
                      {getText('search.products')} ({groupedResults.products.length})
                    </p>
                    {groupedResults.products.map((result, i) => {
                      const Icon = result.icon;
                      const globalIndex = groupedResults.productsStartIndex + i;
                      return (
                        <button
                          key={result.path}
                          onClick={() => navigateToResult(result.path)}
                          className={cn(
                            "w-full flex items-center gap-2 sm:gap-3 px-2 py-1.5 sm:py-2 text-xs sm:text-sm rounded-md transition-colors",
                            globalIndex === selectedIndex
                              ? "bg-accent text-accent-foreground"
                              : "hover:bg-accent/50"
                          )}
                        >
                          <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                          <div className="flex-1 text-left min-w-0">
                            <p className="truncate">{result.name}</p>
                            {result.subtitle && (
                              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{result.subtitle}</p>
                            )}
                          </div>
                          <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                        </button>
                      );
                    })}
                  </>
                )}

                {/* Database results - Categories */}
                {groupedResults.categories.length > 0 && (
                  <>
                    <p className="px-2 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium text-muted-foreground mt-1 sm:mt-2">
                      {getText('search.categories')} ({groupedResults.categories.length})
                    </p>
                    {groupedResults.categories.map((result, i) => {
                      const Icon = result.icon;
                      const globalIndex = groupedResults.categoriesStartIndex + i;
                      return (
                        <button
                          key={result.path}
                          onClick={() => navigateToResult(result.path)}
                          className={cn(
                            "w-full flex items-center gap-2 sm:gap-3 px-2 py-1.5 sm:py-2 text-xs sm:text-sm rounded-md transition-colors",
                            globalIndex === selectedIndex
                              ? "bg-accent text-accent-foreground"
                              : "hover:bg-accent/50"
                          )}
                        >
                          <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                          <div className="flex-1 text-left min-w-0">
                            <p className="truncate">{result.name}</p>
                          </div>
                          <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                        </button>
                      );
                    })}
                  </>
                )}

                {/* Database results - Coupons */}
                {groupedResults.coupons.length > 0 && (
                  <>
                    <p className="px-2 py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium text-muted-foreground mt-1 sm:mt-2">
                      {getText('search.coupons')} ({groupedResults.coupons.length})
                    </p>
                    {groupedResults.coupons.map((result, i) => {
                      const Icon = result.icon;
                      const globalIndex = groupedResults.couponsStartIndex + i;
                      return (
                        <button
                          key={result.path}
                          onClick={() => navigateToResult(result.path)}
                          className={cn(
                            "w-full flex items-center gap-2 sm:gap-3 px-2 py-1.5 sm:py-2 text-xs sm:text-sm rounded-md transition-colors",
                            globalIndex === selectedIndex
                              ? "bg-accent text-accent-foreground"
                              : "hover:bg-accent/50"
                          )}
                        >
                          <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                          <div className="flex-1 text-left min-w-0">
                            <p className="truncate">{result.name}</p>
                            {result.subtitle && (
                              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{result.subtitle}</p>
                            )}
                          </div>
                          <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                        </button>
                      );
                    })}
                  </>
                )}
              </div>
              <div className="border-t px-2 sm:px-3 py-1.5 sm:py-2 bg-muted/30">
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  <span className="hidden sm:inline">↑↓ pour naviguer • Entrée pour sélectionner • Échap pour fermer</span>
                  <span className="sm:hidden">Appuyez pour sélectionner</span>
                </p>
              </div>
            </div>
          )}

          {/* No results message */}
          {isOpen && searchQuery.trim() && allResults.length === 0 && !isLoading && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 w-[calc(100vw-2rem)] sm:w-full mt-1 bg-popover border rounded-lg shadow-lg overflow-hidden z-50">
              <div className="p-3 sm:p-4 text-center">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {getText('search.noResults')} "{searchQuery}"
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Notification Bell */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNotifications(!showNotifications)}
            className="h-8 w-8 p-0 relative hover:bg-muted/50 transition-colors"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] flex items-center justify-center font-bold text-white animate-pulse">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Button>

          {/* Activity indicator */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] sm:text-xs text-muted-foreground hidden sm:inline">{getText('status.online')}</span>
          </div>
        </div>
      </div>
    </header>

    {/* Notification Sidebar - Outside header for proper z-index */}
    <NotificationSidebar 
      isOpen={showNotifications} 
      onClose={() => setShowNotifications(false)}
      onMarkAllAsRead={markAllAsRead}
    />
    </>
  );
};

export default AdminTopbar;