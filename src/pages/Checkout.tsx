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
  ShoppingBag,
  AlertCircle,
  Ticket,
  X,
  Loader2,
  PhoneCall,
  Mail,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/interactive/button";
import { Input } from "@/components/ui/forms/input";
import { Label } from "@/components/ui/forms/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/forms/select";
import { wilayas } from "@/data/algeria_data";
import kaziTourRates from "@/data/kazi-tour/rates.json";
import { 
  validateCoupon, 
  useCoupon, 
  Coupon,
  createOrder,
  updateOrder,
  generateOrderNumber,
  OrderInsert,
  SupabaseOrderItem,
  getAllSettings
} from "@/supabase";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { sendOrderNotification } from "@/lib/telegram";
import { sendOrderEmail, isValidEmail } from "@/lib/email";
import { useLanguage } from "@/contexts/LanguageContext";

// French text (default language)
const fr = {
  success: {
    title: "Commande Confirmée !",
    thankYou: "Merci",
    orderRegistered: "Votre commande a été enregistrée.",
    contactSoon: "Nous vous contacterons bientôt au",
    forConfirmation: "pour confirmation."
  },
  email: {
    title: "Recevoir les mises à jour par email",
    optional: "(optionnel)",
    placeholder: "votre@email.com",
    saved: "Email enregistré :",
    invalidEmail: "Veuillez entrer une adresse email valide"
  },
  tip: {
    title: "Conseil Important",
    message: "Notre équipe vous appellera bientôt pour confirmer votre commande. Veuillez garder votre téléphone allumé et accessible !"
  },
  buttons: {
    continueShopping: "Continuer mes achats",
    backToHome: "Retour à l'accueil",
    back: "Retour"
  },
  summary: {
    label: "Récapitulatif de commande",
    yourOrder: "Votre Commande",
    subtotal: "Sous-total",
    delivery: "Livraison (Kazi Tour Express)",
    deliveryShort: "Livraison",
    promoCode: "Code promo",
    total: "Total à payer",
    paymentNote: "Paiement à la livraison. Vous ne payez qu'après avoir reçu votre commande."
  },
  form: {
    title: "Informations de contact de livraison",
    personalInfo: "Informations personnelles",
    contact: "Contact",
    lastName: "Nom",
    lastNamePlaceholder: "Votre nom",
    firstName: "Prénom",
    firstNamePlaceholder: "Votre prénom",
    phone: "Numéro de téléphone",
    phonePlaceholder: "05 XX XX XX XX",
    deliveryAddress: "Adresse de livraison",
    wilaya: "Wilaya",
    wilayaPlaceholder: "Sélectionnez votre wilaya",
    commune: "Commune",
    communePlaceholder: "Sélectionnez votre commune",
    address: "Adresse complète",
    addressPlaceholder: "Rue, bâtiment, appartement...",
    deliveryType: "Type de livraison",
    deskDelivery: "Livraison au bureau",
    homeDelivery: "Livraison à domicile"
  },
  deliveryService: {
    title: "Service de livraison",
    deliveryTime: "Livraison",
    notAvailable: "Non disponible"
  },
  coupon: {
    title: "Code Promo",
    placeholder: "Entrez le code",
    apply: "Appliquer",
    applied: "Appliqué",
    remove: "Retirer",
    invalid: "Code invalide ou expiré",
    success: "Code appliqué avec succès !"
  },
  validation: {
    requiredFields: "Veuillez remplir tous les champs obligatoires",
    invalidPhone: "Veuillez entrer un numéro de téléphone valide",
    selectWilaya: "Veuillez sélectionner une wilaya",
    selectCommune: "Veuillez sélectionner une commune"
  },
  processing: {
    title: "Traitement de votre commande...",
    pleaseWait: "Veuillez patienter"
  },
  placeOrder: "Confirmer la commande",
  copyright: "© 2025 MAMI PUB. Tous droits réservés.",
  toast: {
    orderSuccess: "Commande validée avec succès !",
    orderError: "Erreur lors de la création de la commande",
    couponApplied: "Code promo appliqué avec succès !",
    couponInvalid: "Code invalide ou expiré",
    emailSaved: "Email enregistré",
    emailSavedDesc: "Vous recevrez les mises à jour de livraison par email."
  }
};

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [step, setStep] = useState(1); // 1: Form, 2: Processing, 3: Success
  
  // Translation helper
  const getText = (key: string): string => {
    if (language === 'fr') {
      const keys = key.split('.');
      let value: unknown = fr;
      for (const k of keys) {
        if (value && typeof value === 'object') {
          value = (value as Record<string, unknown>)[k];
        } else {
          return key;
        }
      }
      return typeof value === 'string' ? value : key;
    }
    return t(key, 'checkout');
  };
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    wilaya: "",
    commune: "",
    deliveryType: "desk" // Default to desk as per Kazi Tour rates
  });
  const [successAnimation, setSuccessAnimation] = useState<any>(null);
  
  // Email for delivery updates (optional, entered on success screen)
  const [customerEmail, setCustomerEmail] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailSaved, setEmailSaved] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  
  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  // Get data from navigation state
  const { product, cartItems, total: cartTotal } = location.state || {};
  
  // Determine if single product or cart checkout
  const isCartCheckout = !!cartItems;
  const items = isCartCheckout ? cartItems : (product ? [product] : []);
  
  // Calculate delivery price based on Kazi Tour rates
  const getDeliveryPrice = () => {
    if (!formData.wilaya) return 0;
    const selectedWilaya = wilayas.find(w => w.name === formData.wilaya);
    if (!selectedWilaya) return 0;
    
    const rate = (kaziTourRates.rates as Record<string, number>)[selectedWilaya.code];
    return rate || 0;
  };

  const deliveryPrice = getDeliveryPrice();
  const isDeliverable = deliveryPrice > 0 || !formData.wilaya; // Valid if price exists or no wilaya selected yet
  
  // Calculate total based on mode
  const calculatedSubtotal = items.reduce((sum: number, item: any) => sum + (item.price * (item.quantity ?? 1)), 0);
  const finalTotal = calculatedSubtotal + deliveryPrice - couponDiscount;

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
    
    // Check deliverability immediately
    const selectedWilaya = wilayas.find(w => w.name === value);
    if (selectedWilaya) {
      const rate = (kaziTourRates.rates as Record<string, number>)[selectedWilaya.code];
      if (!rate) {
        toast.error("La livraison n'est pas disponible pour cette wilaya avec Kazi Tour");
      }
    }
  };

  // Handle coupon application
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Veuillez entrer un code promo");
      return;
    }

    setCouponLoading(true);
    setCouponError("");

    try {
      const result = await validateCoupon(couponCode, calculatedSubtotal);
      
      if (result.valid && result.coupon && result.discount) {
        setAppliedCoupon(result.coupon);
        setCouponDiscount(result.discount);
        toast.success(`Code promo appliqué ! -${result.discount.toFixed(0)} DA`);
      } else {
        setCouponError(result.error || "Code promo invalide");
      }
    } catch (error) {
      setCouponError("Erreur lors de la validation du code");
    } finally {
      setCouponLoading(false);
    }
  };

  // Remove applied coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode("");
    setCouponError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.wilaya || !formData.address) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (deliveryPrice === 0) {
      toast.error("La livraison n'est pas disponible pour la wilaya sélectionnée");
      return;
    }

    setStep(2); // Processing

    try {
      // Prepare order items
      const orderItems: SupabaseOrderItem[] = items.map((item: any, index: number) => ({
        id: `item-${index}`,
        product_id: item.id || `product-${index}`,
        product_name: item.name,
        product_image: item.image || '',
        quantity: item.quantity ?? 1,
        price: item.price,
        total: item.price * (item.quantity ?? 1),
      }));

      // Create order in Supabase
      const orderNumber = generateOrderNumber();
      const orderData: OrderInsert = {
        order_number: orderNumber,
        customer: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
        },
        items: orderItems,
        status: 'pending', // Default to pending until confirmed
        payment_status: 'pending',
        subtotal: calculatedSubtotal,
        shipping: deliveryPrice,
        discount: couponDiscount,
        coupon_code: appliedCoupon?.code || null,
        total: finalTotal,
        shipping_address: {
          wilaya: formData.wilaya,
          commune: formData.commune,
          address: formData.address,
        },
        notes: null,
      };

      const createdOrder = await createOrder(orderData);
      setCreatedOrderId(createdOrder.id);

      // Increment coupon usage if applied
      if (appliedCoupon) {
        try {
          await useCoupon(appliedCoupon.id);
        } catch (e) {
          console.error('Failed to increment coupon usage:', e);
        }
      }

      // Send Telegram notification (non-blocking)
      try {
        const settings = await getAllSettings();
        const telegramEnabled = settings.find(s => s.key === 'telegram_enabled')?.value === 'true';
        const botToken = settings.find(s => s.key === 'telegram_bot_token')?.value;
        const chatId = settings.find(s => s.key === 'telegram_chat_id')?.value;
        
        // Prepare notification data
        const notificationData = {
          orderId: orderNumber,
          customerName: `${formData.firstName} ${formData.lastName}`,
          customerPhone: formData.phone,
          customerAddress: `${formData.address}, ${formData.commune}, ${formData.wilaya}`,
          totalAmount: finalTotal,
          itemCount: items.length,
          items: items.map(item => ({
            name: item.name,
            quantity: item.quantity ?? 1,
            price: item.price,
          })),
          paymentMethod: 'Paiement à la livraison',
        };
        
        // Send Telegram notification
        if (telegramEnabled && botToken && chatId) {
          sendOrderNotification(
            { botToken, chatId },
            notificationData
          ).catch(err => console.error('Telegram notification failed:', err));
        }
        
        // Send Email notification
        const emailEnabled = settings.find(s => s.key === 'email_enabled')?.value === 'true';
        const emailRecipient = settings.find(s => s.key === 'email_recipient')?.value;
        
        if (emailEnabled && emailRecipient) {
          sendOrderEmail(emailRecipient, notificationData)
            .catch(err => console.error('Email notification failed:', err));
        }
      } catch (e) {
        console.error('Failed to send notifications:', e);
      }

      setStep(3); // Success
      toast.success(getText('toast.orderSuccess'));
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error(getText('toast.orderError'));
      setStep(1); // Go back to form
    }
  };

  // Save customer email for delivery updates
  const handleSaveEmail = async () => {
    if (!customerEmail.trim() || !isValidEmail(customerEmail) || !createdOrderId) {
      toast.error(getText('email.invalidEmail'));
      return;
    }

    setEmailSaving(true);
    try {
      // Update order with customer email in the customer JSONB field
      await updateOrder(createdOrderId, {
        customer: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          email: customerEmail.trim(),
        }
      });
      setEmailSaved(true);
      toast.success(getText('email.saved'));
    } catch (error) {
      console.error('Error saving email:', error);
      toast.error(getText('email.invalidEmail'));
    } finally {
      setEmailSaving(false);
    }
  };

  // Success Screen
  if (step === 3) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-3 sm:p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-card border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden"
        >
          {/* Animation */}
          <div className="w-32 h-32 sm:w-48 sm:h-48 mx-auto mb-4 sm:mb-6">
            {successAnimation && <Lottie animationData={successAnimation} loop={false} />}
          </div>
          
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-2xl sm:text-3xl font-black mb-3 sm:mb-4 bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent"
          >
            {getText('success.title')}
          </motion.h1>
          
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6"
          >
            {getText('success.thankYou')} {formData.firstName} ! {getText('success.orderRegistered')}
            {getText('success.contactSoon')} <span className="text-foreground font-medium">{formData.phone}</span> {getText('success.forConfirmation')}
          </motion.p>

          {/* Optional Email for Delivery Updates */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.62 }}
            className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 text-left"
          >
            <div className="flex items-center gap-2 mb-2">
              <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
              <p className="text-xs sm:text-sm font-semibold text-blue-300">
                {getText('email.title')}
              </p>
              <span className="text-[10px] sm:text-xs text-blue-400/60">{getText('email.optional')}</span>
            </div>
            {emailSaved ? (
              <div className="flex items-center gap-2 text-green-400">
                <Check className="h-4 w-4" />
                <span className="text-xs sm:text-sm">{getText('email.saved')} {customerEmail}</span>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder={getText('email.placeholder')}
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="h-9 sm:h-10 text-sm bg-background/50 border-blue-500/30 focus:border-blue-500"
                  disabled={emailSaving}
                />
                <Button
                  onClick={handleSaveEmail}
                  disabled={emailSaving || !customerEmail.trim()}
                  size="sm"
                  className="h-9 sm:h-10 px-3 sm:px-4 bg-blue-600 hover:bg-blue-700"
                >
                  {emailSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
          </motion.div>

          {/* Important Tip */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.65 }}
            className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 flex items-start gap-2 sm:gap-3 text-left"
          >
            <PhoneCall className="h-5 w-5 sm:h-6 sm:w-6 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs sm:text-sm font-semibold text-amber-300 mb-1">{getText('tip.title')}</p>
              <p className="text-[10px] sm:text-xs text-amber-200/80 leading-relaxed">
                {getText('tip.message')}
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="space-y-2 sm:space-y-3"
          >
            <Button 
              onClick={() => navigate("/store")}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-10 sm:h-12 rounded-xl text-sm sm:text-base"
            >
              {getText('buttons.continueShopping')}
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate("/")}
              className="w-full border-white/10 hover:bg-white/5 h-10 sm:h-12 rounded-xl text-sm sm:text-base"
            >
              {getText('buttons.backToHome')}
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
          {getText('buttons.back')}
        </button>

        <div className="flex-1">
          <div className="mb-1 sm:mb-2 text-[10px] sm:text-xs lg:text-sm font-medium text-primary uppercase tracking-wider">{getText('summary.label')}</div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 lg:mb-8">{getText('summary.yourOrder')}</h1>

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
              <span className="text-muted-foreground">{getText('summary.subtotal')}</span>
              <span className="font-medium">{calculatedSubtotal.toFixed(0)} DA</span>
            </div>
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5 sm:gap-2">
                <Truck className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">{getText('summary.delivery')}</span>
                <span className="sm:hidden">{getText('summary.deliveryShort')}</span>
              </span>
              <span className="font-medium">{deliveryPrice > 0 ? `${deliveryPrice} DA` : '-'}</span>
            </div>
            {/* Coupon Discount */}
            {appliedCoupon && couponDiscount > 0 && (
              <div className="flex justify-between text-xs sm:text-sm text-green-400">
                <span className="flex items-center gap-1.5 sm:gap-2">
                  <Ticket className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">{getText('summary.promoCode')} ({appliedCoupon.code})</span>
                  <span className="sm:hidden">{appliedCoupon.code}</span>
                </span>
                <span className="font-medium">-{couponDiscount.toFixed(0)} DA</span>
              </div>
            )}
            <div className="flex justify-between text-base sm:text-lg lg:text-xl font-black pt-3 sm:pt-4 border-t border-white/10">
              <span>{getText('summary.total')}</span>
              <span className="text-primary">{finalTotal.toFixed(0)} DA</span>
            </div>
          </div>
          
          <div className="mt-4 sm:mt-6 lg:mt-8 bg-blue-500/10 border border-blue-500/20 rounded-lg sm:rounded-xl p-3 sm:p-4 flex gap-2 sm:gap-3 items-start">
             <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400 flex-shrink-0 mt-0.5" />
             <p className="text-[10px] sm:text-xs text-blue-200/80 leading-relaxed">
               {getText('summary.paymentNote')}
             </p>
          </div>
        </div>
        
        <div className="hidden lg:block mt-auto pt-8 text-xs text-muted-foreground text-left">
          {getText('copyright')}
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-7/12 p-4 sm:p-6 lg:p-10 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
            <User className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            {getText('form.title')}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 lg:space-y-8">
            {/* Personal Info */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 sm:mb-4">{getText('form.personalInfo')}</h3>              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="lastName" className="text-xs sm:text-sm">{getText('form.lastName')}</Label>
                  <Input 
                    id="lastName" 
                    name="lastName" 
                    placeholder={getText('form.lastNamePlaceholder')} 
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="bg-white/5 border-white/10 focus:border-primary/50 h-10 sm:h-11 lg:h-12 text-sm"
                  />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="firstName" className="text-xs sm:text-sm">{getText('form.firstName')}</Label>
                  <Input 
                    id="firstName" 
                    name="firstName" 
                    placeholder={getText('form.firstNamePlaceholder')}
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="bg-white/5 border-white/10 focus:border-primary/50 h-10 sm:h-11 lg:h-12 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="phone" className="text-xs sm:text-sm">{getText('form.phone')}</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                  <Input 
                    id="phone" 
                    name="phone" 
                    placeholder={getText('form.phonePlaceholder')} 
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="pl-9 sm:pl-10 bg-white/5 border-white/10 focus:border-primary/50 h-10 sm:h-11 lg:h-12 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Address Info */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 sm:mb-4 mt-4 sm:mt-6 lg:mt-8">{getText('form.deliveryAddress')}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5 sm:space-y-2">
                  <Label className="text-xs sm:text-sm">{getText('form.wilaya')}</Label>
                  <Select onValueChange={handleWilayaChange}>
                    <SelectTrigger className="bg-white/5 border-white/10 h-10 sm:h-11 lg:h-12 text-sm">
                      <SelectValue placeholder={getText('form.wilayaPlaceholder')} />
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
                  <Label htmlFor="commune" className="text-xs sm:text-sm">{getText('form.commune')}</Label>
                  <Input 
                    id="commune" 
                    name="commune" 
                    placeholder={getText('form.communePlaceholder')}
                    value={formData.commune}
                    onChange={handleInputChange}
                    className="bg-white/5 border-white/10 focus:border-primary/50 h-10 sm:h-11 lg:h-12 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="address" className="text-xs sm:text-sm">{getText('form.address')}</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                  <Input 
                    id="address" 
                    name="address" 
                    placeholder={getText('form.addressPlaceholder')}
                    value={formData.address}
                    onChange={handleInputChange}
                    className="pl-9 sm:pl-10 bg-white/5 border-white/10 focus:border-primary/50 h-10 sm:h-11 lg:h-12 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Service */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 sm:mb-4 mt-4 sm:mt-6 lg:mt-8">{getText('deliveryService.title')}</h3>
              <div className="grid grid-cols-1 gap-2 sm:gap-3 lg:gap-4">
                <div 
                  className={cn(
                    "relative flex items-center p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all hover:bg-white/5 border-primary bg-primary/5 cursor-default"
                  )}
                >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-white p-2 flex items-center justify-center mr-3 sm:mr-4 shrink-0 overflow-hidden">
                    <img 
                      src="https://tgvaayxjxprlivqphewe.supabase.co/storage/v1/object/public/projects_stuffs/kazi-tour.svg" 
                      alt="Kazi Tour" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs sm:text-sm lg:text-base truncate">Kazi Tour Express</div>
                    <div className="text-[10px] sm:text-xs lg:text-sm text-muted-foreground">{getText('deliveryService.deliveryTime')} {kaziTourRates.delivery_time}</div>
                    {!isDeliverable && formData.wilaya && (
                       <div className="text-red-500 text-xs mt-1 font-medium flex items-center gap-1">
                         <AlertCircle className="h-3 w-3" />
                         {getText('deliveryService.notAvailable')}
                       </div>
                    )}
                  </div>
                  <div className="font-bold text-sm sm:text-base text-primary ml-2 whitespace-nowrap">
                    {deliveryPrice > 0 ? `${deliveryPrice} DA` : (formData.wilaya ? 'N/A' : '--')}
                  </div>
                  <div className="absolute top-2 right-2 sm:top-4 sm:right-4 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-primary rounded-full ring-2 ring-offset-1 sm:ring-offset-2 ring-offset-background ring-primary" />
                </div>
              </div>
            </div>

            {/* Coupon Code */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 sm:mb-4 mt-4 sm:mt-6 lg:mt-8">{getText('coupon.title')}</h3>
              
              {appliedCoupon ? (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg sm:rounded-xl p-3 sm:p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Ticket className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                    </div>
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-green-400">{appliedCoupon.code}</div>
                      <div className="text-[10px] sm:text-xs text-green-300/70">
                        {appliedCoupon.discount_type === 'percentage' 
                          ? `-${appliedCoupon.discount_value}%` 
                          : `-${appliedCoupon.discount_value} DA`}
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleRemoveCoupon}
                    className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-red-500/20 text-red-400"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2 sm:gap-3">
                    <div className="relative flex-1">
                      <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                      <Input
                        placeholder={getText('coupon.placeholder')}
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value.toUpperCase());
                          setCouponError("");
                        }}
                        className="pl-9 sm:pl-10 bg-white/5 border-white/10 focus:border-primary/50 h-10 sm:h-11 lg:h-12 text-sm uppercase font-mono"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="h-10 sm:h-11 lg:h-12 px-4 sm:px-6 bg-white/10 hover:bg-white/20 border border-white/10 text-sm"
                    >
                      {couponLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        getText('coupon.apply')
                      )}
                    </Button>
                  </div>
                  {couponError && (
                    <p className="text-red-400 text-[10px] sm:text-xs flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {couponError}
                    </p>
                  )}
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              disabled={step === 2}
              className="w-full h-11 sm:h-12 lg:h-14 text-sm sm:text-base lg:text-lg font-bold bg-primary hover:bg-primary/90 mt-4 sm:mt-6 lg:mt-8 rounded-lg sm:rounded-xl shadow-lg shadow-primary/25"
            >
              {step === 2 ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="text-sm sm:text-base">{getText('processing.pleaseWait')}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>{getText('placeOrder')} ({finalTotal.toFixed(0)} DA)</span>
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
