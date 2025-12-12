import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  LogOut,
  Menu,
  X,
  Home,
  Sparkles,
  Image,
  FolderOpen,
  Ticket,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/interactive/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/overlays/tooltip';

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  isMobile: boolean;
}

interface NavItem {
  titleKey: string;
  titleFr: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const navItemsConfig: NavItem[] = [
  {
    titleKey: 'nav.dashboard',
    titleFr: 'Tableau de bord',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    titleKey: 'nav.products',
    titleFr: 'Produits',
    href: '/admin/products',
    icon: Package,
  },
  {
    titleKey: 'nav.categories',
    titleFr: 'Catégories',
    href: '/admin/categories',
    icon: FolderOpen,
  },
  {
    titleKey: 'nav.orders',
    titleFr: 'Commandes',
    href: '/admin/orders',
    icon: ShoppingCart,
  },
  {
    titleKey: 'nav.banners',
    titleFr: 'Bannières',
    href: '/admin/banners',
    icon: Image,
  },
  {
    titleKey: 'nav.coupons',
    titleFr: 'Codes Promo',
    href: '/admin/coupons',
    icon: Ticket,
  },
  {
    titleKey: 'nav.settings',
    titleFr: 'Paramètres',
    href: '/admin/settings',
    icon: Settings,
  },
];

// French translations (default)
const fr = {
  nav: {
    dashboard: 'Tableau de bord',
    products: 'Produits',
    categories: 'Catégories',
    orders: 'Commandes',
    banners: 'Bannières',
    coupons: 'Codes Promo',
    settings: 'Paramètres'
  },
  footer: {
    backToSite: 'Retour au site',
    logout: 'Déconnexion'
  }
};

const AdminSidebar: React.FC<AdminSidebarProps> = ({ collapsed, onToggle, isMobile }) => {
  const { user, logout } = useAuth();
  const { getSetting } = useSiteSettings();
  const { t, language } = useLanguage();
  const location = useLocation();
  
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
    return t(key, 'admin_sidebar');
  };
  
  const logoUrl = getSetting('logo_url');
  const siteName = getSetting('site_name') || 'MAMI PUB';
  
  // Track logo load errors
  const [hasLogoError, setHasLogoError] = useState(false);
  
  // Reset error state when logo URL changes
  useEffect(() => {
    setHasLogoError(false);
  }, [logoUrl]);

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-16 items-center px-4 border-b">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary via-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-primary/25 overflow-hidden">
              {logoUrl && !hasLogoError ? (
                <img 
                  src={logoUrl} 
                  alt={siteName} 
                  className="h-full w-full object-cover"
                  onError={() => setHasLogoError(true)}
                  onLoad={() => setHasLogoError(false)}
                />
              ) : (
                <span className="text-sm font-black text-white">MP</span>
              )}
            </div>
            <span className="font-bold text-lg">{siteName}</span>
            <span className="text-xs text-muted-foreground font-medium">Admin</span>
          </div>
        )}
        {collapsed && (
          <div className="flex items-center justify-center w-full">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary via-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-primary/25 overflow-hidden">
              {logoUrl && !hasLogoError ? (
                <img 
                  src={logoUrl} 
                  alt={siteName} 
                  className="h-full w-full object-cover"
                  onError={() => setHasLogoError(true)}
                  onLoad={() => setHasLogoError(false)}
                />
              ) : (
                <span className="text-sm font-black text-white">MP</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        <TooltipProvider>
          {navItemsConfig.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            const title = getText(item.titleKey);
            
            return (
              <Tooltip key={item.href} delayDuration={0}>
                <TooltipTrigger asChild>
                  <NavLink
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                      "hover:bg-accent hover:text-accent-foreground",
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-sm" 
                        : "text-muted-foreground",
                      collapsed && "justify-center px-2"
                    )}
                  >
                    <Icon className={cn("h-5 w-5", collapsed ? "" : "flex-shrink-0")} />
                    {!collapsed && (
                      <>
                        <span className="flex-1">{title}</span>
                        {item.badge && (
                          <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right" className="font-medium">
                    {title}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </nav>

      {/* Footer Actions */}
      <div className="border-t p-4">
        <div className="space-y-1">
          <NavLink
            to="/"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
              "hover:bg-accent hover:text-accent-foreground text-muted-foreground",
              collapsed && "justify-center px-2"
            )}
          >
            <Home className="h-4 w-4" />
            {!collapsed && <span>{getText('footer.backToSite')}</span>}
          </NavLink>
          
          <button
            onClick={logout}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
              "hover:bg-accent hover:text-accent-foreground text-muted-foreground",
              collapsed && "justify-center px-2"
            )}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>{getText('footer.logout')}</span>}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-50 h-screen border-r bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        isMobile ? "translate-x-0" : "translate-x-0"
      )}>
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      {isMobile && (
        <aside className={cn(
          "fixed left-0 top-0 z-50 h-screen w-64 border-r bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 transition-transform duration-300",
          collapsed ? "-translate-x-full" : "translate-x-0"
        )}>
          {sidebarContent}
        </aside>
      )}
    </>
  );
};

export default AdminSidebar;