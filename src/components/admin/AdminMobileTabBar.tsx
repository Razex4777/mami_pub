import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  FolderOpen, 
  ShoppingCart, 
  MoreHorizontal,
  Image,
  Home,
  X,
  ChevronUp,
  Ticket,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

// French translations (default)
const fr = {
  dashboard: "Tableau",
  products: "Produits",
  categories: "Catégories",
  orders: "Commandes",
  banners: "Bannières",
  coupons: "Codes Promo",
  settings: "Paramètres",
  viewSite: "Voir le site",
  more: "Plus"
};

// Main tab items config (4 + More)
const mainTabItemsConfig = [
  { icon: LayoutDashboard, labelKey: "dashboard", path: "/admin" },
  { icon: Package, labelKey: "products", path: "/admin/products" },
  { icon: FolderOpen, labelKey: "categories", path: "/admin/categories" },
  { icon: ShoppingCart, labelKey: "orders", path: "/admin/orders" },
];

// More menu items config
const moreMenuItemsConfig = [
  { icon: Image, labelKey: "banners", path: "/admin/banners" },
  { icon: Ticket, labelKey: "coupons", path: "/admin/coupons" },
  { icon: Settings, labelKey: "settings", path: "/admin/settings" },
  { icon: Home, labelKey: "viewSite", path: "/" },
];

const AdminMobileTabBar = () => {
  const { t, language } = useLanguage();
  
  // Translation helper
  const getText = (key: string): string => {
    if (language === 'fr') {
      return fr[key as keyof typeof fr] || key;
    }
    return t(`mobile.${key}`, 'admin_sidebar') || key;
  };
  const location = useLocation();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Check if current path is in more menu
  const isMoreActive = moreMenuItemsConfig.some(item => 
    location.pathname === item.path || 
    (item.path !== "/" && location.pathname.startsWith(item.path))
  );

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
    };

    if (isMoreOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMoreOpen]);

  // Close menu on route change
  useEffect(() => {
    setIsMoreOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Backdrop overlay when menu is open */}
      <AnimatePresence>
        {isMoreOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[99] md:hidden"
            onClick={() => setIsMoreOpen(false)}
          />
        )}
      </AnimatePresence>

      <nav ref={menuRef} className="fixed bottom-0 left-0 right-0 z-[100] md:hidden" style={{ position: 'fixed' }}>
        {/* More Menu Popup */}
        <AnimatePresence>
          {isMoreOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute bottom-full right-2 mb-2 w-48 bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="p-1">
                {moreMenuItemsConfig.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path ||
                    (item.path !== "/" && location.pathname.startsWith(item.path));

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{getText(item.labelKey)}</span>
                      {isActive && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Glassmorphic background */}
        <div className="absolute inset-0 bg-card/98 backdrop-blur-xl border-t border-border/50 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]" />
        
        {/* Safe area padding for iOS */}
        <div className="relative flex items-center justify-around h-14 pb-safe">
          {/* Main Tab Items */}
          {mainTabItemsConfig.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
              (item.path !== "/admin" && location.pathname.startsWith(item.path));

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full py-2 transition-all duration-200",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className="relative">
                  <Icon
                    className={cn(
                      "h-5 w-5 transition-transform duration-200",
                      isActive && "scale-110"
                    )}
                  />
                </div>
                <span
                  className={cn(
                    "text-[10px] mt-1 font-medium transition-all duration-200",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {getText(item.labelKey)}
                </span>
                
                {/* Active indicator dot */}
                {isActive && (
                  <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}

          {/* More Button */}
          <button
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full py-2 transition-all duration-200",
              isMoreOpen || isMoreActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: isMoreOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {isMoreOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <MoreHorizontal className="h-5 w-5" />
                )}
              </motion.div>
              {/* Notification dot if something in More is active */}
              {isMoreActive && !isMoreOpen && (
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary" />
              )}
            </div>
            <span
              className={cn(
                "text-[10px] mt-1 font-medium transition-all duration-200",
                isMoreOpen || isMoreActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              {getText('more')}
            </span>
            
            {/* Active indicator dot */}
            {(isMoreOpen || isMoreActive) && (
              <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
            )}
          </button>
        </div>
      </nav>
    </>
  );
};

export default AdminMobileTabBar;
