import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Bell,
  LogOut,
  Menu,
  X,
  Home,
  Sparkles,
  Image,
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
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const navItems: NavItem[] = [
  {
    title: 'Tableau de bord',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Produits',
    href: '/admin/products',
    icon: Package,
  },
  {
    title: 'Commandes',
    href: '/admin/orders',
    icon: ShoppingCart,
  },
  {
    title: 'Bannières',
    href: '/admin/banners',
    icon: Image,
  },
  {
    title: 'Notifications',
    href: '/admin/notifications',
    icon: Bell,
  },
];

const AdminSidebar: React.FC<AdminSidebarProps> = ({ collapsed, onToggle, isMobile }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-16 items-center px-4 border-b">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg">MAMI PUB</span>
            <span className="text-xs text-muted-foreground font-medium">Admin</span>
          </div>
        )}
        {collapsed && (
          <div className="flex items-center justify-center w-full">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        <TooltipProvider>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
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
                        <span className="flex-1">{item.title}</span>
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
                    {item.title}
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
            {!collapsed && <span>Retour au site</span>}
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
            {!collapsed && <span>Déconnexion</span>}
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