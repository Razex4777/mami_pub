import { useState, useEffect } from "react";
import { ShoppingCart, Menu, Shield } from "lucide-react";
import { Button } from "@/components/ui/interactive/button";
import { Input } from "@/components/ui/forms/input";
import { Link, useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/overlays/dialog";
import { Label } from "@/components/ui/forms/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/feedback/use-toast";
import { useCart } from "@/contexts/CartContext";
import contactPhoneIcon from "/icons/contact/contact-phone-icon.svg";
import contactMailIcon from "/icons/contact/contact-mail-icon.svg";
import contactLocationIcon from "/icons/contact/contact-location-icon.svg";

interface TopbarProps {
  onMenuClick: () => void;
}

const Topbar = ({ onMenuClick }: TopbarProps) => {
  const [clickCount, setClickCount] = useState(0);
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { state } = useCart();
  const cartCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogoClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    if (newCount >= 5) {
      setShowAdminDialog(true);
      setClickCount(0);
      toast({
        title: "🎉 Admin Access Unlocked!",
        description: "Enter admin credentials to access dashboard",
      });
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setClickCount(0), 3000);
    return () => clearTimeout(timer);
  }, [clickCount]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(username, password);
      if (success) {
        toast({
          title: "Welcome back!",
          description: "Successfully logged in to admin dashboard",
        });
        setShowAdminDialog(false);
        navigate('/admin');
      } else {
        toast({
          title: "Login failed",
          description: "Invalid credentials. Use admin/admin",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Login failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header className="h-16 sm:h-20 border-b border-white/5 bg-gradient-to-r from-background via-card/80 to-background fixed top-0 left-0 right-0 z-50 backdrop-blur-xl shadow-sm">
      <div className="h-full px-4 sm:px-8 flex items-center justify-between max-w-[1920px] mx-auto">
        {/* Left: Menu + Logo */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="h-10 w-10 hover:bg-white/5 hidden md:flex rounded-xl"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <Link to="/" onClick={handleLogoClick} className="flex items-center gap-3 cursor-pointer group" title="Click 5 times for admin access">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-br from-primary via-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-all duration-300 group-hover:scale-105">
              <span className="text-sm sm:text-base font-black text-white">MP</span>
            </div>
            <div className="hidden sm:flex flex-col justify-center">
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent leading-none mb-1">MAMI PUB</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold text-primary uppercase tracking-widest">Store</span>
                <span className="h-1 w-1 rounded-full bg-primary/50"></span>
                <span className="text-[10px] text-muted-foreground">Premium Quality</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Center: Contact Info - Refined Design */}
        <div className="hidden xl:flex items-center gap-8">
          {/* Phone */}
          <a href="tel:0557914544" className="flex items-center gap-3 group hover:opacity-100 opacity-90 transition-all">
            <div className="h-10 w-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/30 transition-all shadow-inner">
              <img src={contactPhoneIcon} alt="Phone" className="h-4 w-4 opacity-80 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-0.5">Appelez-nous</span>
              <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">0557 91 45 44</span>
              <span className="text-[9px] text-muted-foreground/80 hidden 2xl:block">Conseiller dédié, réponses immédiates</span>
            </div>
          </a>

          <div className="h-8 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />

          {/* Email */}
          <a href="mailto:anes.mami.n@gmail.com" className="flex items-center gap-3 group hover:opacity-100 opacity-90 transition-all">
            <div className="h-10 w-10 rounded-xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/10 group-hover:border-blue-500/30 transition-all shadow-inner">
              <img src={contactMailIcon} alt="Email" className="h-4 w-4 opacity-80 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-0.5">Écrivez-nous</span>
              <span className="text-sm font-bold text-foreground group-hover:text-blue-400 transition-colors">anes.mami.n@gmail.com</span>
              <span className="text-[9px] text-muted-foreground/80 hidden 2xl:block">Devis, fichiers techniques, suivi</span>
            </div>
          </a>

          <div className="h-8 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />

          {/* Address */}
          <div className="flex items-center gap-3 group hover:opacity-100 opacity-90 transition-all cursor-default">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/5 border border-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/10 group-hover:border-cyan-500/30 transition-all shadow-inner">
              <img src={contactLocationIcon} alt="Location" className="h-4 w-4 opacity-80 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider mb-0.5">Visitez-nous</span>
              <span className="text-sm font-bold text-foreground group-hover:text-cyan-400 transition-colors">Ets Mahamid Mami, El Eulma</span>
              <span className="text-[9px] text-muted-foreground/80 hidden 2xl:block">Showroom & atelier sur rendez-vous</span>
            </div>
          </div>
        </div>

        {/* Right: Cart & Mobile Actions */}
        <div className="flex items-center gap-3">
          {/* Mobile Contact - Simplified */}
          <div className="xl:hidden flex items-center gap-1.5 mr-1">
            <a href="tel:0557914544" className="h-9 w-9 rounded-full bg-primary/5 flex items-center justify-center hover:bg-primary/20 transition-colors border border-primary/10">
              <img src={contactPhoneIcon} alt="Phone" className="h-4 w-4 opacity-80" />
            </a>
            <a href="mailto:anes.mami.n@gmail.com" className="h-9 w-9 rounded-full bg-blue-500/5 flex items-center justify-center hover:bg-blue-500/20 transition-colors border border-blue-500/10">
              <img src={contactMailIcon} alt="Email" className="h-4 w-4 opacity-80" />
            </a>
            <a 
              href="https://maps.google.com/?q=Ets+Mahamid+Mami+El+Eulma" 
              target="_blank" 
              rel="noopener noreferrer"
              className="h-9 w-9 rounded-full bg-cyan-500/5 flex items-center justify-center hover:bg-cyan-500/20 transition-colors border border-cyan-500/10 hidden sm:flex"
            >
              <img src={contactLocationIcon} alt="Location" className="h-4 w-4 opacity-80" />
            </a>
          </div>
          
          <Link to="/cart" className="hidden md:block">
            <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-white/5 relative group rounded-xl border border-transparent hover:border-white/5">
              <ShoppingCart className="h-5 w-5 transition-transform group-hover:scale-110 text-foreground/80 group-hover:text-primary" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-gradient-to-r from-primary to-cyan-500 text-[10px] flex items-center justify-center font-bold text-white shadow-lg ring-2 ring-background">
                  {cartCount}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>

      <Dialog open={showAdminDialog} onOpenChange={setShowAdminDialog}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md mx-auto rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <DialogHeader>
            <div className="mx-auto mb-3 sm:mb-4 h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <DialogTitle className="text-center text-lg sm:text-2xl">🔐 Admin Access</DialogTitle>
            <DialogDescription className="text-center text-xs sm:text-sm">
              Enter your admin credentials
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdminLogin} className="space-y-3 sm:space-y-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="admin-username" className="text-xs sm:text-sm">Username</Label>
              <Input
                id="admin-username"
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="h-9 sm:h-10 text-sm"
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="admin-password" className="text-xs sm:text-sm">Password</Label>
              <Input
                id="admin-password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-9 sm:h-10 text-sm"
              />
            </div>
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg p-2 sm:p-3 text-xs sm:text-sm">
              <p className="font-semibold text-purple-700 dark:text-purple-300 mb-1">🔑 Demo</p>
              <p className="text-gray-600 dark:text-gray-400 text-[10px] sm:text-xs">
                <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">admin</code> / 
                <code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">admin</code>
              </p>
            </div>
            <Button
              type="submit"
              className="w-full h-9 sm:h-10 text-sm bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-600 hover:from-purple-600 hover:via-blue-600 hover:to-indigo-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Topbar;
