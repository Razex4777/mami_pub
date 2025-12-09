import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Phone,
  User,
  Building,
  Truck,
  CreditCard,
  ShoppingBag
} from "lucide-react";
import { Button } from "@/components/ui/interactive/button";
import { Input } from "@/components/ui/forms/input";
import { Label } from "@/components/ui/forms/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/forms/select";
import { wilayas, deliveryOptions } from "@/data/algeria_data";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Form, 2: Processing, 3: Success
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    wilaya: "",
    commune: "",
    deliveryType: "home"
  });
  const [successAnimation, setSuccessAnimation] = useState<any>(null);

  // Get data from navigation state
  const { product, cartItems, total: cartTotal } = location.state || {};
  
  // Determine if single product or cart checkout
  const isCartCheckout = !!cartItems;
  const items = isCartCheckout ? cartItems : (product ? [product] : []);
  
  const deliveryPrice = deliveryOptions.find(d => d.id === formData.deliveryType)?.price || 0;
  
  // Calculate total based on mode
  const subtotal = isCartCheckout 
    ? cartTotal // Passed from cart page (includes tax usually, but let's assume passed total is subtotal+tax)
    : (product?.price || 0);

  // Actually, let's recalculate to be safe if we have items
  const calculatedSubtotal = items.reduce((sum: number, item: any) => sum + (item.price * (item.quantity || 1)), 0);
  const finalTotal = calculatedSubtotal + deliveryPrice;

  useEffect(() => {
    fetch('/animations/package.json') // Using package animation for order placed
      .then(res => res.json())
      .then(data => setSuccessAnimation(data))
      .catch(console.error);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleWilayaChange = (value: string) => {
    setFormData(prev => ({ ...prev, wilaya: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.wilaya || !formData.address) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setStep(2); // Processing

    // Simulate API call
    setTimeout(() => {
      setStep(3); // Success
      toast.success("Commande validée avec succès !");
    }, 2000);
  };

  // Success Screen
  if (step === 3) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-card border border-white/10 rounded-3xl p-8 text-center relative overflow-hidden"
        >
          {/* Confetti effect could be added here */}
          <div className="w-48 h-48 mx-auto mb-6">
            {successAnimation && <Lottie animationData={successAnimation} loop={false} />}
          </div>
          
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-3xl font-black mb-4 bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent"
          >
            Commande Confirmée !
          </motion.h1>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-muted-foreground mb-8"
          >
            Merci {formData.firstName} ! Votre commande a été enregistrée.
            Nous vous contacterons bientôt au <span className="text-foreground font-medium">{formData.phone}</span> pour confirmation.
          </motion.p>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="space-y-3"
          >
            <Button 
              onClick={() => navigate("/store")}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl"
            >
              Continuer mes achats
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate("/")}
              className="w-full border-white/10 hover:bg-white/5 h-12 rounded-xl"
            >
              Retour à l'accueil
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Left Panel - Product Summary (Darker/Visual) */}
      <div className="w-full lg:w-5/12 bg-muted/10 border-b lg:border-b-0 lg:border-r border-white/5 p-4 sm:p-6 lg:p-10 flex flex-col">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors mb-4 sm:mb-6 lg:mb-8 w-fit"
        >
          <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
          Retour
        </button>

        <div className="flex-1">
          <div className="mb-1 sm:mb-2 text-[10px] sm:text-xs lg:text-sm font-medium text-primary uppercase tracking-wider">Récapitulatif</div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 lg:mb-8">Votre Commande</h1>

          <div className="space-y-2 sm:space-y-3 lg:space-y-4 mb-4 sm:mb-6 max-h-[200px] sm:max-h-[300px] lg:max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {items.map((item: any, index: number) => (
              <div key={index} className="bg-card/50 backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex gap-3 sm:gap-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-lg sm:rounded-xl overflow-hidden bg-muted flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-center min-w-0">
                  <h3 className="font-bold text-xs sm:text-sm lg:text-base leading-tight mb-0.5 sm:mb-1 line-clamp-2">{item.name}</h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">{item.category}</p>
                  <div className="flex justify-between items-center">
                    <div className="font-bold text-sm sm:text-base text-primary">{item.price.toFixed(0)} DA</div>
                    {item.quantity > 1 && (
                      <div className="text-[10px] sm:text-xs font-medium bg-white/10 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                        x{item.quantity}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2 sm:space-y-3 lg:space-y-4 border-t border-white/10 pt-4 sm:pt-6">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground">Sous-total</span>
              <span className="font-medium">{calculatedSubtotal.toFixed(0)} DA</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5 sm:gap-2">
                <Truck className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Livraison ({deliveryOptions.find(d => d.id === formData.deliveryType)?.name.split('(')[0]})</span>
                <span className="sm:hidden">Livraison</span>
              </span>
              <span className="font-medium">{deliveryPrice} DA</span>
            </div>
            <div className="flex justify-between text-base sm:text-lg lg:text-xl font-black pt-3 sm:pt-4 border-t border-white/10">
              <span>Total à payer</span>
              <span className="text-primary">{finalTotal.toFixed(0)} DA</span>
            </div>
          </div>
          
          <div className="mt-4 sm:mt-6 lg:mt-8 bg-blue-500/10 border border-blue-500/20 rounded-lg sm:rounded-xl p-3 sm:p-4 flex gap-2 sm:gap-3 items-start">
             <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400 flex-shrink-0 mt-0.5" />
             <p className="text-[10px] sm:text-xs text-blue-200/80 leading-relaxed">
               Paiement à la livraison. Vous ne payez qu'après avoir reçu votre commande.
             </p>
          </div>
        </div>
        
        <div className="hidden lg:block mt-auto pt-8 text-xs text-muted-foreground text-left">
          © 2025 MAMI PUB. Tous droits réservés.
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-7/12 p-4 sm:p-6 lg:p-10 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
            <User className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            Informations de livraison
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 lg:space-y-8">
            {/* Personal Info */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 sm:mb-4">Contact</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="lastName" className="text-xs sm:text-sm">Nom</Label>
                  <Input 
                    id="lastName" 
                    name="lastName" 
                    placeholder="Votre nom" 
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="bg-white/5 border-white/10 focus:border-primary/50 h-10 sm:h-11 lg:h-12 text-sm"
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="firstName" className="text-xs sm:text-sm">Prénom</Label>
                  <Input 
                    id="firstName" 
                    name="firstName" 
                    placeholder="Votre prénom"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="bg-white/5 border-white/10 focus:border-primary/50 h-10 sm:h-11 lg:h-12 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="phone" className="text-xs sm:text-sm">Numéro de téléphone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                  <Input 
                    id="phone" 
                    name="phone" 
                    placeholder="05 XX XX XX XX" 
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="pl-9 sm:pl-10 bg-white/5 border-white/10 focus:border-primary/50 h-10 sm:h-11 lg:h-12 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Address Info */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 sm:mb-4 mt-4 sm:mt-6 lg:mt-8">Adresse</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-xs sm:text-sm">Wilaya</Label>
                  <Select onValueChange={handleWilayaChange}>
                    <SelectTrigger className="bg-white/5 border-white/10 h-10 sm:h-11 lg:h-12 text-sm">
                      <SelectValue placeholder="Sélectionner wilaya" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[250px] sm:max-h-[300px]">
                      {wilayas.map((w) => (
                        <SelectItem key={w.id} value={w.name} className="text-sm">
                          {w.code} - {w.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="commune" className="text-xs sm:text-sm">Commune</Label>
                  <Input 
                    id="commune" 
                    name="commune" 
                    placeholder="Votre commune"
                    value={formData.commune}
                    onChange={handleInputChange}
                    className="bg-white/5 border-white/10 focus:border-primary/50 h-10 sm:h-11 lg:h-12 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="address" className="text-xs sm:text-sm">Adresse complète</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                  <Input 
                    id="address" 
                    name="address" 
                    placeholder="Cité, Rue, N° de maison..."
                    value={formData.address}
                    onChange={handleInputChange}
                    className="pl-9 sm:pl-10 bg-white/5 border-white/10 focus:border-primary/50 h-10 sm:h-11 lg:h-12 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Type */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 sm:mb-4 mt-4 sm:mt-6 lg:mt-8">Mode de livraison</h3>
              <div className="grid grid-cols-1 gap-2 sm:gap-3 lg:gap-4">
                {deliveryOptions.map((option) => (
                  <div 
                    key={option.id}
                    onClick={() => setFormData(prev => ({ ...prev, deliveryType: option.id }))}
                    className={cn(
                      "relative flex items-center p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 cursor-pointer transition-all hover:bg-white/5",
                      formData.deliveryType === option.id 
                        ? "border-primary bg-primary/5" 
                        : "border-white/10 bg-card/30"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mr-3 sm:mr-4",
                      formData.deliveryType === option.id ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                    )}>
                      {option.icon === 'Truck' ? <Truck className="h-4 w-4 sm:h-5 sm:w-5" /> : <Building className="h-4 w-4 sm:h-5 sm:w-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs sm:text-sm lg:text-base truncate">{option.name}</div>
                      <div className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground">24h-48h</div>
                    </div>
                    <div className="font-bold text-sm sm:text-base text-primary ml-2">
                      {option.price} DA
                    </div>
                    {formData.deliveryType === option.id && (
                      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-primary rounded-full ring-2 ring-offset-1 sm:ring-offset-2 ring-offset-background ring-primary" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={step === 2}
              className="w-full h-11 sm:h-12 lg:h-14 text-sm sm:text-base lg:text-lg font-bold bg-primary hover:bg-primary/90 mt-4 sm:mt-6 lg:mt-8 rounded-lg sm:rounded-xl shadow-lg shadow-primary/25"
            >
              {step === 2 ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="text-sm sm:text-base">Traitement...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Confirmer ({finalTotal.toFixed(0)} DA)</span>
                </div>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
