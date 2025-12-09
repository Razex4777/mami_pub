import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingCart, Bell, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const tabItems = [
  { icon: LayoutDashboard, label: "Tableau", path: "/admin" },
  { icon: Package, label: "Produits", path: "/admin/products" },
  { icon: ShoppingCart, label: "Commandes", path: "/admin/orders" },
  { icon: Bell, label: "Notifs", path: "/admin/notifications" },
  { icon: Home, label: "Site", path: "/" },
];

const AdminMobileTabBar = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] md:hidden" style={{ position: 'fixed' }}>
      {/* Glassmorphic background */}
      <div className="absolute inset-0 bg-card/98 backdrop-blur-xl border-t border-border/50 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]" />
      
      {/* Safe area padding for iOS */}
      <div className="relative flex items-center justify-around h-14 pb-safe">
        {tabItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
            (item.path !== "/admin" && item.path !== "/" && location.pathname.startsWith(item.path));

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

export default AdminMobileTabBar;
