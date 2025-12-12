import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/overlays/tooltip";
import { useLanguage } from "@/contexts/LanguageContext";

// WhatsApp Icon SVG
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar = ({ isOpen }: SidebarProps) => {
  const location = useLocation();
  const { t, language } = useLanguage();

  // French text data (default)
  const frNav = { home: "Accueil", store: "Magasin" };
  const frHelp = { title: "BESOIN D'AIDE?", description: "Contactez-nous pour toute question", button: "WhatsApp", tooltip: "Contactez-nous sur WhatsApp" };

  const navItems = [
    { icon: Home, label: language === 'fr' ? frNav.home : t('nav.home', 'sidebar'), path: "/", color: "from-blue-500 to-cyan-500" },
    { icon: ShoppingBag, label: language === 'fr' ? frNav.store : t('nav.store', 'sidebar'), path: "/store", color: "from-primary to-blue-500" },
  ];

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

      {/* Bottom section - WhatsApp contact */}
      <div className={cn(
        "absolute bottom-4 transition-all duration-300",
        isOpen ? "left-3 right-3" : "left-2 right-2"
      )}>
        {isOpen ? (
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-blue-500/10 border border-white/5">
            <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-1">{language === 'fr' ? frHelp.title : t('help.title', 'sidebar')}</p>
            <p className="text-[10px] text-muted-foreground leading-relaxed">{language === 'fr' ? frHelp.description : t('help.description', 'sidebar')}</p>
            <a 
              href="https://wa.me/213557914544" 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-2 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 text-white text-[10px] font-semibold hover:from-emerald-600 hover:to-green-700 transition-all"
            >
              {language === 'fr' ? frHelp.button : t('help.button', 'sidebar')}
            </a>
          </div>
        ) : (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <a 
                href="https://wa.me/213557914544" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Nous contacter sur WhatsApp"
                className="flex items-center justify-center p-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg hover:shadow-emerald-500/25"
              >
                <WhatsAppIcon className="h-5 w-5" />
              </a>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium bg-card/95 backdrop-blur-xl border-white/10">
              Contactez-nous sur WhatsApp
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
