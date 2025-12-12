import { Link, useLocation } from "react-router-dom";
import { Home, Search, ShoppingCart, Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

const MobileTabBar = () => {
  const location = useLocation();
  const { state } = useCart();
  const { t, language } = useLanguage();
  const cartCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const isStorePage = location.pathname === "/store";

  // French text data (default)
  const frTabs = { home: "Accueil", store: "Magasin", search: "Rechercher", cart: "Panier" };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] md:hidden" style={{ position: 'fixed' }}>
      {/* Glassmorphic background */}
      <div className="absolute inset-0 bg-card/98 backdrop-blur-xl border-t border-border/50 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]" />
      
      {/* Safe area padding for iOS */}
      <div className="relative flex items-center justify-around h-16 pb-safe">
        
        {/* 1. Home Tab */}
        <Link
          to="/"
          className={cn(
            "flex flex-col items-center justify-center flex-1 h-full py-2 transition-all duration-200",
            location.pathname === "/"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <div className="relative">
            <Home
              className={cn(
                "h-5 w-5 transition-transform duration-200",
                location.pathname === "/" && "scale-110"
              )}
            />
          </div>
          <span
            className={cn(
              "text-[10px] mt-1 font-medium transition-all duration-200",
              location.pathname === "/" ? "text-primary" : "text-muted-foreground"
            )}
          >
            {t('tabs.home', 'mobiletabbar')}          </span>
          {location.pathname === "/" && (
            <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
          )}
        </Link>

        {/* 2. Middle Tab (Dynamic: Search vs Magasin) */}
        <div className="flex-1 flex justify-center">
          <AnimatePresence mode="wait">
            {isStorePage ? (
              <motion.div
                key="search-active"
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: -90, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Link
                  to="/store"
                  state={{ focusSearch: true }}
                  onClick={(e) => {
                    if (location.pathname === "/store") {
                      e.preventDefault();
                      document.getElementById("store-search-input")?.focus();
                    }
                  }}
                  className="relative -top-5 group block"
                >
                  <div className="flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-300 border-4 border-background bg-primary text-primary-foreground shadow-primary/25 scale-110">
                    <Search className="h-6 w-6" />
                  </div>
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-medium text-primary whitespace-nowrap">
                    {language === 'fr' ? frTabs.search : t('tabs.search', 'mobiletabbar')}
                  </span>
                </Link>
              </motion.div>
            ) : (
              <motion.div
                key="store-inactive"
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: -90, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full flex justify-center"
              >
                <Link
                  to="/store"
                  className="flex flex-col items-center justify-center w-full h-full py-2 transition-all duration-200 text-muted-foreground hover:text-foreground"
                >
                  <div className="relative">
                    <Printer className="h-5 w-5 transition-transform duration-200" />
                  </div>
                  <span className="text-[10px] mt-1 font-medium transition-all duration-200 text-muted-foreground">
                    {language === 'fr' ? frTabs.store : t('tabs.store', 'mobiletabbar')}
                  </span>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 3. Cart Tab */}
        <Link
          to="/cart"
          className={cn(
            "flex flex-col items-center justify-center flex-1 h-full py-2 transition-all duration-200",
            location.pathname === "/cart"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <div className="relative">
            <ShoppingCart
              className={cn(
                "h-5 w-5 transition-transform duration-200",
                location.pathname === "/cart" && "scale-110"
              )}
            />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </div>
          <span
            className={cn(
              "text-[10px] mt-1 font-medium transition-all duration-200",
              location.pathname === "/cart" ? "text-primary" : "text-muted-foreground"
            )}
          >
            {language === 'fr' ? frTabs.cart : t('tabs.cart', 'mobiletabbar')}
          </span>
          {location.pathname === "/cart" && (
            <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
          )}
        </Link>

      </div>
    </nav>
  );
};

export default MobileTabBar;
