import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/overlays/tooltip";

interface SidebarProps {
  isOpen: boolean;
}

const navItems = [
  { icon: Home, label: "Accueil", path: "/", color: "from-blue-500 to-cyan-500" },
  { icon: ShoppingBag, label: "Store", path: "/store", color: "from-primary to-blue-500" },
];

const Sidebar = ({ isOpen }: SidebarProps) => {
  const location = useLocation();

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 sm:top-20 h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] bg-gradient-to-b from-background to-background/95 backdrop-blur-xl border-r border-white/5 transition-all duration-300 ease-in-out overflow-hidden z-40",
        isOpen ? "w-52" : "w-[60px]"
      )}
    >
      {/* Navigation */}
      <nav className={cn("p-3 space-y-2", !isOpen && "px-2")}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          const linkContent = (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center rounded-xl transition-all duration-300 group relative overflow-hidden",
                isOpen ? "gap-3 px-3 py-2.5" : "justify-center p-3",
                isActive
                  ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                  : "hover:bg-white/5 text-muted-foreground hover:text-foreground"
              )}
            >
              {/* Active indicator glow */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-50" />
              )}
              
              <div className={cn(
                "relative z-10 flex items-center justify-center",
                !isActive && "group-hover:scale-110 transition-transform duration-200"
              )}>
                <Icon className={cn(
                  "shrink-0",
                  isOpen ? "h-4 w-4" : "h-5 w-5"
                )} />
              </div>
              
              {isOpen && (
                <span className="relative z-10 text-sm font-medium whitespace-nowrap">{item.label}</span>
              )}
              
              {/* Hover effect for inactive items */}
              {!isActive && (
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity duration-300",
                  item.color
                )} />
              )}
            </Link>
          );

          // Show tooltip only when sidebar is collapsed
          if (!isOpen) {
            return (
              <Tooltip key={item.path} delayDuration={0}>
                <TooltipTrigger asChild>
                  {linkContent}
                </TooltipTrigger>
                <TooltipContent side="right" className="font-medium bg-card/95 backdrop-blur-xl border-white/10">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          }

          return linkContent;
        })}
      </nav>

      {/* Bottom section - only when expanded */}
      {isOpen && (
        <div className="absolute bottom-4 left-3 right-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-blue-500/10 border border-white/5">
            <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-1">Besoin d'aide?</p>
            <p className="text-[10px] text-muted-foreground leading-relaxed">Contactez-nous pour toute question</p>
            <a 
              href="https://wa.me/213557914544" 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-2 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 text-white text-[10px] font-semibold hover:from-emerald-600 hover:to-green-700 transition-all"
            >
              WhatsApp
            </a>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
