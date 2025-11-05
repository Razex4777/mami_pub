import { Link, useLocation } from "react-router-dom";
import { Home, Package, Paintbrush, Printer, FileText, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
}

const navItems = [
  { icon: Home, label: "Accueil", path: "/" },
  { icon: Package, label: "Transferts DTF", path: "/transfers" },
  { icon: Paintbrush, label: "Concepteur", path: "/designer" },
  { icon: Printer, label: "Équipement", path: "/equipment" },
  { icon: FileText, label: "Ressources", path: "/resources" },
  { icon: BarChart3, label: "Commandes", path: "/orders" },
];

const Sidebar = ({ isOpen }: SidebarProps) => {
  const location = useLocation();

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-card border-r border-border transition-smooth overflow-hidden",
        isOpen ? "w-64" : "w-16"
      )}
    >
      <nav className="p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-smooth group",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-muted text-secondary"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {isOpen && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
