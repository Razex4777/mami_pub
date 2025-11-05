import { Search, ShoppingCart, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/interactive/button";
import { Input } from "@/components/ui/forms/input";
import { Link } from "react-router-dom";

interface TopbarProps {
  onMenuClick: () => void;
}

const Topbar = ({ onMenuClick }: TopbarProps) => {
  return (
    <header className="h-16 border-b border-border bg-card sticky top-0 z-50 backdrop-blur-sm bg-card/95">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="hover:bg-muted"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">DTF</span>
            </div>
            <span className="text-lg font-semibold tracking-tight">Premium Print Co.</span>
          </Link>
        </div>

        <div className="flex-1 max-w-2xl mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <Input
              placeholder="Rechercher des produits, matériaux, spécifications..."
              className="pl-10 bg-muted border-border focus:border-primary"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/cart">
            <Button variant="ghost" size="icon" className="hover:bg-muted relative group">
              <ShoppingCart className="h-5 w-5 transition-transform group-hover:scale-110" />
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full gradient-primary text-xs flex items-center justify-center font-semibold animate-pulse">
                3
              </span>
            </Button>
          </Link>
          
          <Button variant="ghost" size="icon" className="hover:bg-muted group">
            <User className="h-5 w-5 transition-transform group-hover:scale-110" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
