import { Link, useLocation } from "react-router-dom";
import { Home, Printer, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";

const tabItems = [
  { icon: Home, label: "Accueil", path: "/" },
  { icon: Printer, label: "Store", path: "/store" },
  { icon: ShoppingCart, label: "Panier", path: "/cart" },
];

const MobileTabBar = () => {
  const location = useLocation();
  const { state } = useCart();
  const cartCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] md:hidden" style={{ position: 'fixed' }}>
      {/* Glassmorphic background */}
      <div className="absolute inset-0 bg-card/98 backdrop-blur-xl border-t border-border/50 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]" />
      
      {/* Safe area padding for iOS */}
      <div className="relative flex items-center justify-around h-14 pb-safe">
        {tabItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          const isCart = item.path === "/cart";

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
                {/* Cart badge */}
                {isCart && cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] mt-1 font-medium transition-all duration-200",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
              
              {/* Active indicator dot */}
              {isActive && (
                <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileTabBar;
