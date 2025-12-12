import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/interactive/button";
import { Badge } from "@/components/ui/data-display/badge";
import { Separator } from "@/components/ui/layout/separator";
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  Shield,
  Truck,
  Package
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

const Cart = () => {
  const { state, updateQuantity, removeItem } = useCart();
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  // French text (default)
  const fr = {
    empty: {
      title: "Votre panier est vide",
      description: "Découvrez nos dernières collections et commencez à remplir votre panier.",
      exploreBtn: "Explorer la boutique"
    },
    header: {
      title: "Panier",
      itemsSelected: "articles sélectionnés",
      continueShopping: "Continuer mes achats"
    },
    item: {
      total: "Total",
      remove: "Supprimer"
    },
    summary: {
      title: "Récapitulatif",
      subtotal: "Sous-total",
      totalToPay: "Total à payer",
      taxIncluded: "Taxes incluses",
      orderBtn: "Commander",
      paymentOnDelivery: "Paiement à la livraison"
    },
    mobile: {
      totalToPay: "Total à payer",
      orderBtn: "Commander"
    }
  };

  const getText = (section: string, key: string): string => {
    if (language === 'fr') {
      const sectionData = fr[section as keyof typeof fr];
      if (typeof sectionData === 'object') {
        const value = sectionData[key as keyof typeof sectionData];
        return typeof value === 'string' ? value : key;
      }
      return key;
    }
    return t(`${section}.${key}`, 'cart');
  };

  const cartItems = state.items;
  const subtotal = state.total;
  const total = subtotal; // Shipping calculated at checkout based on willaya

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md space-y-6"
        >
          <div className="relative mx-auto w-32 h-32 mb-6">
            <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping opacity-20" />
            <div className="relative h-full w-full rounded-full bg-gradient-to-br from-primary/20 to-transparent flex items-center justify-center border border-primary/10 backdrop-blur-sm">
              <ShoppingCart className="h-12 w-12 text-primary" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              {getText('empty', 'title')}
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-xs mx-auto">
              {getText('empty', 'description')}
            </p>
          </div>

          <Link to="/store">
            <Button size="lg" className="gradient-primary rounded-full px-8 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
              {getText('empty', 'exploreBtn')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 pb-32 lg:pb-12">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-end justify-between mb-8 sm:mb-12 border-b border-border/50 pb-6"
        >
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{getText('header', 'title')}</h1>
            <p className="text-muted-foreground mt-2 flex items-center gap-2">
              <span className="inline-flex items-center justify-center bg-primary/10 text-primary h-6 min-w-[1.5rem] px-2 rounded-full text-xs font-medium">
                {state.itemCount}
              </span>
              {getText('header', 'itemsSelected')}
            </p>
          </div>
          <Link to="/store" className="hidden sm:block">
            <Button variant="ghost" className="text-muted-foreground hover:text-primary">
              {getText('header', 'continueShopping')}
            </Button>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-6">
            <AnimatePresence mode="popLayout">
              {cartItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group relative bg-card rounded-2xl border border-border/50 p-4 sm:p-5 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                >
                  <div className="flex gap-4 sm:gap-6">
                    {/* Product Image */}
                    <Link 
                      to={`/product/${item.id}`}
                      className="relative shrink-0 w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-muted"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </Link>

                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-between min-w-0 py-1">
                      <div className="space-y-1">
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-1">
                            <Badge variant="secondary" className="bg-secondary/50 hover:bg-secondary transition-colors text-[10px] sm:text-xs font-normal">
                              {item.category}
                            </Badge>
                            <Link 
                              to={`/product/${item.id}`}
                              className="block"
                            >
                              <h3 className="font-semibold text-base sm:text-lg text-foreground hover:text-primary transition-colors line-clamp-2">
                                {item.name}
                              </h3>
                            </Link>
                          </div>
                          <p className="font-bold text-lg text-primary shrink-0">
                            {item.price.toFixed(0)} <span className="text-xs text-muted-foreground font-normal">DA</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-end justify-between gap-4 mt-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3 bg-muted/30 rounded-full p-1 border border-border/50">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-8 w-8 rounded-full hover:bg-background shadow-sm hover:text-destructive transition-all"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium text-sm">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-8 w-8 rounded-full hover:bg-background shadow-sm hover:text-primary transition-all"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="flex items-center gap-4">
                          <p className="text-sm font-medium text-muted-foreground hidden sm:block">
                            {getText('item', 'total')}: <span className="text-foreground">{(item.price * item.quantity).toFixed(0)} DA</span>
                          </p>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.id)}
                            className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-card rounded-2xl border border-border/50 p-6 shadow-sm space-y-6"
              >
                <h2 className="text-xl font-bold">{getText('summary', 'title')}</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{getText('summary', 'subtotal')}</span>
                    <span className="font-medium">{subtotal.toFixed(0)} DA</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between items-end">
                  <span className="text-base font-medium">{getText('summary', 'totalToPay')}</span>
                  <div className="text-right">
                    <span className="block text-2xl font-bold text-primary">{total.toFixed(0)} DA</span>
                    <span className="text-xs text-muted-foreground">{getText('summary', 'taxIncluded')}</span>
                  </div>
                </div>

                <Button 
                  size="lg"
                  onClick={() => navigate('/checkout', { state: { cartItems, total } })}
                  className="w-full gradient-primary font-semibold text-lg h-12 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.02]"
                >
                  {getText('summary', 'orderBtn')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>

                {/* Payment Info */}
                <div className="flex items-center justify-center gap-2 p-3 bg-muted/30 rounded-xl">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">{getText('summary', 'paymentOnDelivery')}</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Checkout Bar */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t border-border lg:hidden z-40 pb-safe"
      >
        <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">{getText('mobile', 'totalToPay')}</span>
            <span className="text-lg font-bold text-primary">{total.toFixed(0)} DA</span>
          </div>
          <Button 
            onClick={() => navigate('/checkout', { state: { cartItems, total } })}
            className="gradient-primary px-8 rounded-xl shadow-lg shadow-primary/20"
          >
            {getText('mobile', 'orderBtn')}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Cart;
