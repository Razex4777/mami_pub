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
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
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
  const { getSetting } = useSiteSettings();
  const { t, language } = useLanguage();
  const cartCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  // French text data (default)
  const frNavbar = {
    contact: {
      phone: { label: "Appelez-nous", description: "Conseiller dédié, réponses immédiates" },
      email: { label: "Écrivez-nous", description: "Devis, fichiers techniques, suivi" },
      location: { label: "Visitez-nous", description: "Showroom & atelier sur rendez-vous" }
    },
    admin: {
      unlocked: "🎉 Accès Admin Débloqué!",
      unlockedDesc: "Entrez les identifiants admin pour accéder au tableau de bord",
      title: "🔐 Accès Admin",
      subtitle: "Entrez vos identifiants admin",
      username: "Nom d'utilisateur",
      usernamePlaceholder: "Entrez le nom d'utilisateur",
      password: "Mot de passe",
      passwordPlaceholder: "Entrez le mot de passe",
      demo: "🔑 Demo",
      signingIn: "Connexion en cours...",
      signIn: "Se connecter",
      welcome: "Bienvenue !",
      welcomeDesc: "Connexion réussie au tableau de bord admin",
      loginFailed: "Échec de connexion",
      loginFailedDesc: "Identifiants invalides. Utilisez admin/admin",
      error: "Erreur",
      errorDesc: "Échec de connexion. Veuillez réessayer."
    },
    logoTooltip: "Cliquez 5 fois pour l'accès admin"
  };
  
  // Dynamic settings
  const logoUrl = getSetting('logo_url');
  const siteName = getSetting('site_name') || 'MAMI PUB';
  const siteTagline = getSetting('site_tagline') || 'Qualité Premium';
  const contactPhone = getSetting('contact_phone') || '0557 91 45 44';
  const contactEmail = getSetting('contact_email') || 'anes.mami.n@gmail.com';
  const contactAddress = getSetting('contact_address') || 'Ets Mahamid Mami, El Eulma';
  // Fixed Google Maps URL - not editable from settings
  const contactAddressUrl = 'https://maps.google.com/?q=Ets+Mahamid+Mami+El+Eulma';

  const handleLogoClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    if (newCount >= 5) {
      setShowAdminDialog(true);
      setClickCount(0);
      toast({
        title: language === 'fr' ? frNavbar.admin.unlocked : t('adminModal.unlocked', 'components'),
        description: language === 'fr' ? frNavbar.admin.unlockedDesc : t('adminModal.unlockedDesc', 'components'),
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
          title: language === 'fr' ? frNavbar.admin.welcome : t('adminModal.welcome', 'components'),
          description: language === 'fr' ? frNavbar.admin.welcomeDesc : t('adminModal.welcomeDesc', 'components'),
        });
        setShowAdminDialog(false);
        navigate('/admin');
      } else {
        toast({
          title: language === 'fr' ? frNavbar.admin.loginFailed : t('adminModal.loginFailed', 'components'),
          description: language === 'fr' ? frNavbar.admin.loginFailedDesc : t('adminModal.loginFailedDesc', 'components'),
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: language === 'fr' ? frNavbar.admin.error : t('adminModal.error', 'components'),
        description: language === 'fr' ? frNavbar.admin.errorDesc : t('adminModal.errorDesc', 'components'),
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
          
          <Link to="/" onClick={handleLogoClick} className="flex items-center gap-3 cursor-pointer group" title="Cliquez 5 fois pour l'accès admin">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-br from-primary via-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-all duration-300 group-hover:scale-105 overflow-hidden">
              {logoUrl ? (
                <img src={logoUrl} alt={siteName} className="h-full w-full object-cover" />
              ) : (
                <span className="text-sm sm:text-base font-black text-white">MP</span>
              )}
            </div>
            <div className="hidden sm:flex flex-col justify-center">
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent leading-none mb-1">{siteName}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold text-primary uppercase tracking-widest">Magasin</span>
                <span className="h-1 w-1 rounded-full bg-primary/50"></span>
                <span className="text-[10px] text-muted-foreground">{siteTagline}</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Center: Contact Info - Refined Design */}
        <div className="hidden xl:flex items-center gap-8">
          {/* Phone */}
          <a href={`tel:${contactPhone.replace(/\s/g, '')}`} className="flex items-center gap-3 group hover:opacity-100 opacity-90 transition-all">
            <div className="h-10 w-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/30 transition-all shadow-inner">
              <img src={contactPhoneIcon} alt="Phone" className="h-4 w-4 opacity-80 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-0.5">{language === 'fr' ? frNavbar.contact.phone.label : t('contact.phone.label', 'navbar')}</span>
              <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{contactPhone}</span>
              <span className="text-[9px] text-muted-foreground/80 hidden 2xl:block">{language === 'fr' ? frNavbar.contact.phone.description : t('contact.phone.description', 'navbar')}</span>
            </div>
          </a>

          <div className="h-8 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />

          {/* Email */}
          <a href={`mailto:${contactEmail}`} className="flex items-center gap-3 group hover:opacity-100 opacity-90 transition-all">
            <div className="h-10 w-10 rounded-xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/10 group-hover:border-blue-500/30 transition-all shadow-inner">
              <img src={contactMailIcon} alt="Email" className="h-4 w-4 opacity-80 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider mb-0.5">{language === 'fr' ? frNavbar.contact.email.label : t('contact.email.label', 'navbar')}</span>
              <span className="text-sm font-bold text-foreground group-hover:text-blue-400 transition-colors">{contactEmail}</span>
              <span className="text-[9px] text-muted-foreground/80 hidden 2xl:block">{language === 'fr' ? frNavbar.contact.email.description : t('contact.email.description', 'navbar')}</span>
            </div>
          </a>

          <div className="h-8 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />

          {/* Address */}
          <a href={contactAddressUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group hover:opacity-100 opacity-90 transition-all">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/5 border border-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/10 group-hover:border-cyan-500/30 transition-all shadow-inner">
              <img src={contactLocationIcon} alt="Location" className="h-4 w-4 opacity-80 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider mb-0.5">{language === 'fr' ? frNavbar.contact.location.label : t('contact.location.label', 'navbar')}</span>
              <span className="text-sm font-bold text-foreground group-hover:text-cyan-400 transition-colors">{contactAddress}</span>
              <span className="text-[9px] text-muted-foreground/80 hidden 2xl:block">{language === 'fr' ? frNavbar.contact.location.description : t('contact.location.description', 'navbar')}</span>
            </div>
          </a>
        </div>

        {/* Right: Language, Cart & Mobile Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher */}
          <LanguageSwitcher className="text-foreground/80" />
          
          {/* Mobile Contact - Simplified */}
          <div className="xl:hidden flex items-center gap-1.5">
            <a href={`tel:${contactPhone.replace(/\s/g, '')}`} className="h-9 w-9 rounded-full bg-primary/5 flex items-center justify-center hover:bg-primary/20 transition-colors border border-primary/10">
              <img src={contactPhoneIcon} alt="Phone" className="h-4 w-4 opacity-80" />
            </a>
            <a href={`mailto:${contactEmail}`} className="h-9 w-9 rounded-full bg-blue-500/5 flex items-center justify-center hover:bg-blue-500/20 transition-colors border border-blue-500/10">
              <img src={contactMailIcon} alt="Email" className="h-4 w-4 opacity-80" />
            </a>
            <a 
              href={contactAddressUrl} 
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
        <DialogContent 
          className="w-[calc(100%-2rem)] max-w-md mx-auto rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <div className="mx-auto mb-3 sm:mb-4 h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <DialogTitle className="text-center text-lg sm:text-xl lg:text-2xl font-bold">{language === 'fr' ? frNavbar.admin.title : t('adminModal.title', 'components')}</DialogTitle>
            <DialogDescription className="text-center text-sm sm:text-base lg:text-lg">
              {language === 'fr' ? frNavbar.admin.subtitle : t('adminModal.subtitle', 'components')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdminLogin} className="space-y-4 sm:space-y-5">
            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="admin-username" className="text-sm sm:text-base font-medium">{language === 'fr' ? frNavbar.admin.username : t('adminModal.username', 'components')}</Label>
              <Input
                id="admin-username"
                type="text"
                placeholder={language === 'fr' ? frNavbar.admin.usernamePlaceholder : t('adminModal.usernamePlaceholder', 'components')}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="h-10 sm:h-11 lg:h-12 text-sm sm:text-base"
              />
            </div>
            <div className="space-y-2 sm:space-y-3">
              <Label htmlFor="admin-password" className="text-sm sm:text-base font-medium">{language === 'fr' ? frNavbar.admin.password : t('adminModal.password', 'components')}</Label>
              <Input
                id="admin-password"
                type="password"
                placeholder={language === 'fr' ? frNavbar.admin.passwordPlaceholder : t('adminModal.passwordPlaceholder', 'components')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-10 sm:h-11 lg:h-12 text-sm sm:text-base"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-10 sm:h-11 lg:h-12 text-sm sm:text-base bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-600 hover:from-purple-600 hover:via-blue-600 hover:to-indigo-700 font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {language === 'fr' ? frNavbar.admin.signingIn : t('adminModal.signingIn', 'components')}
                </div>
              ) : (
                language === 'fr' ? frNavbar.admin.signIn : t('adminModal.signIn', 'components')
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Topbar;
