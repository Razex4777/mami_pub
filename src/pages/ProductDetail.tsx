import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  Star, 
  ShoppingBag, 
  ShoppingCart,
  Truck,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  Minus,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/interactive/button";
import { Badge } from "@/components/ui/data-display/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/navigation/tabs";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { products } from "./store/data";
import RefinedProductCard from "@/components/product/RefinedProductCard";
import { cn } from "@/lib/utils";

// Extended data for the product view
const EXTENDED_PRODUCT_DATA: Record<number, any> = {
  1: {
    description: "Elevate your apparel business with our Premium DTF Transfers. Engineered for vibrancy and durability, these transfers allow you to print full-color designs on virtually any fabric without weeding.",
    features: [
      "Hot peel for instant gratification",
      "Stretchable and crack-resistant ink",
      "Compatible with Cotton, Polyester, Blends, Leather, and more",
      "Wash-tested 50+ cycles at 40°C",
      "Eco-friendly water-based inks"
    ],
    specs: {
      "Print Resolution": "1440 x 1440 DPI",
      "Transfer Time": "10-15 Seconds",
      "Transfer Temp": "150°C - 160°C",
      "Pressure": "Medium-High (4-5 Bar)",
      "Peel Type": "Instant Hot Peel"
    }
  },
  2: {
    description: "The Commercial Heat Press 16x20 is a workhorse for any print shop. Featuring a magnetic auto-open feature and digital controls, it ensures consistent pressure and temperature for perfect transfers every time.",
    features: [
      "Magnetic auto-open prevents over-application",
      "Slide-out lower platen for easy layout",
      "Digital temperature and time control",
      "Even heat distribution edge-to-edge",
      "Heavy-duty steel construction"
    ],
    specs: {
      "Platen Size": "16\" x 20\" (40x50cm)",
      "Voltage": "110V / 220V",
      "Power": "1800W",
      "Temp Range": "0°F - 570°F",
      "Warranty": "2 Years Parts & Labor"
    }
  },
  3: {
    description: "Our Premium Heat Transfer Vinyl is the gold standard for custom garment decoration. Easy to cut, weed, and apply, it offers a soft matte finish that feels like part of the fabric.",
    features: [
      "Ultra-easy weeding (hot or cold)",
      "Soft, matte finish",
      "Layerable for multi-color designs",
      "CPSIA Certified (Safe for kids clothing)",
      "Pressure-sensitive carrier"
    ],
    specs: {
      "Thickness": "90 Microns",
      "Application Temp": "150°C",
      "Application Time": "10-12 Seconds",
      "Peel": "Hot or Cold",
      "Washability": "60°C"
    }
  }
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const product = products.find(p => p.id === Number(id));
  const extendedData = product ? (EXTENDED_PRODUCT_DATA[product.id] || EXTENDED_PRODUCT_DATA[1]) : null;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Produit non trouvé</h2>
          <Button onClick={() => navigate("/store")}>Retour au magasin</Button>
        </div>
      </div>
    );
  }

  const relatedProducts = products
    .filter(p => p.id !== product.id)
    .sort((a, b) => {
      // Prioritize same category
      if (a.category === product.category && b.category !== product.category) return -1;
      if (a.category !== product.category && b.category === product.category) return 1;
      return 0;
    })
    .slice(0, 4);

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      quantity: quantity
    });
    toast.success("Ajouté au panier", {
      description: `${quantity}x ${product.name}`
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate("/checkout");
  };

  // Discount calculation
  const originalPrice = product.discount 
    ? product.price / (1 - product.discount / 100) 
    : product.price * 1.2;

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-0">
      {/* Mobile Header / Nav */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-white/5 px-4 h-14 flex items-center justify-between lg:hidden">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <span className="font-semibold text-sm truncate max-w-[200px]">{product.name}</span>
        <Button variant="ghost" size="icon" onClick={() => setIsWishlisted(!isWishlisted)}>
          <Heart className={cn("h-5 w-5", isWishlisted && "fill-red-500 text-red-500")} />
        </Button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
        {/* Breadcrumb (Desktop) */}
        <nav className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <span className="hover:text-primary cursor-pointer" onClick={() => navigate("/")}>Accueil</span>
          <ChevronRight className="h-4 w-4" />
          <span className="hover:text-primary cursor-pointer" onClick={() => navigate("/store")}>Store</span>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Left Column: Images */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-card border border-white/10 group">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {product.discount && (
                <Badge className="absolute top-4 left-4 bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-sm font-bold shadow-lg">
                  -{product.discount}%
                </Badge>
              )}
              <Button 
                variant="outline" 
                size="icon" 
                className="absolute top-4 right-4 rounded-full bg-background/50 backdrop-blur-md border-white/10 hidden lg:flex hover:bg-background"
                onClick={() => setIsWishlisted(!isWishlisted)}
              >
                <Heart className={cn("h-5 w-5", isWishlisted && "fill-red-500 text-red-500")} />
              </Button>
            </div>
            {/* Thumbnails (Mock) */}
            <div className="grid grid-cols-4 gap-3">
              {[product.image, product.image, product.image, product.image].map((img, idx) => (
                <div 
                  key={idx} 
                  className={cn(
                    "aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all",
                    activeImage === idx ? "border-primary ring-2 ring-primary/20" : "border-transparent opacity-60 hover:opacity-100"
                  )}
                  onClick={() => setActiveImage(idx)}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Product Info */}
          <div className="lg:sticky lg:top-24 space-y-8">
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5">
                  {product.category}
                </Badge>
                {product.inStock ? (
                  <Badge variant="outline" className="text-green-500 border-green-500/30 bg-green-500/5 flex items-center gap-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    En Stock
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-destructive border-destructive/30 bg-destructive/5">
                    Rupture
                  </Badge>
                )}
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={cn("h-5 w-5", s <= Math.round(product.rating || 5) ? "fill-yellow-400 text-yellow-400" : "text-muted")} />
                  ))}
                </div>
                <span className="text-sm font-medium underline decoration-muted-foreground/30 underline-offset-4">
                  {product.reviews || 0} Avis clients
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="p-6 rounded-2xl bg-card/50 border border-white/5 backdrop-blur-sm">
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-4xl sm:text-5xl font-black text-primary">
                  {product.price.toFixed(0)} <span className="text-xl sm:text-2xl font-bold text-muted-foreground">DA</span>
                </span>
                <span className="text-lg text-muted-foreground line-through decoration-red-500/50">
                  {originalPrice.toFixed(0)} DA
                </span>
              </div>

              {/* Quantity & Actions */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-background rounded-full border border-white/10 p-1">
                    <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 hover:bg-white/5" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                    <Button variant="ghost" size="icon" className="rounded-full h-10 w-10 hover:bg-white/5" onClick={() => setQuantity(quantity + 1)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Livraison Gratuite</span>
                    <br />pour les commandes &gt; 10000 DA
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <Button size="lg" className="h-14 text-lg rounded-xl bg-primary hover:bg-primary/90" onClick={handleAddToCart}>
                    <ShoppingBag className="mr-2 h-5 w-5" />
                    Ajouter au panier
                  </Button>
                  <Button size="lg" variant="outline" className="h-14 text-lg rounded-xl border-primary/20 hover:bg-primary/5 text-primary hover:text-primary" onClick={handleBuyNow}>
                    Acheter maintenant
                  </Button>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center text-center gap-2 p-4 rounded-xl bg-card/30 border border-white/5">
                <Truck className="h-6 w-6 text-blue-400" />
                <span className="text-xs font-bold">Livraison 48h</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2 p-4 rounded-xl bg-card/30 border border-white/5">
                <ShieldCheck className="h-6 w-6 text-green-400" />
                <span className="text-xs font-bold">Garantie 100%</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2 p-4 rounded-xl bg-card/30 border border-white/5">
                <RotateCcw className="h-6 w-6 text-purple-400" />
                <span className="text-xs font-bold">Retours Simples</span>
              </div>
            </div>

            {/* Details Tabs */}
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="w-full grid grid-cols-3 bg-card/50 p-1 rounded-xl">
                <TabsTrigger value="description" className="rounded-lg">Description</TabsTrigger>
                <TabsTrigger value="specs" className="rounded-lg">Spécifications</TabsTrigger>
                <TabsTrigger value="reviews" className="rounded-lg">Avis</TabsTrigger>
              </TabsList>
              <div className="mt-6 min-h-[200px]">
                <TabsContent value="description" className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <p className="text-lg leading-relaxed text-muted-foreground">
                    {extendedData?.description || product.specs}
                  </p>
                  <div className="space-y-3 mt-6">
                    <h4 className="font-bold text-foreground">Points forts</h4>
                    <ul className="grid gap-3">
                      {extendedData?.features?.map((feature: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-3 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                          {feature}
                        </li>
                      )) || (
                        <li className="flex items-center gap-3 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                          {product.specs}
                        </li>
                      )}
                    </ul>
                  </div>
                </TabsContent>
                <TabsContent value="specs" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(extendedData?.specs || {}).map(([key, value]: [string, any]) => (
                      <div key={key} className="flex flex-col p-3 rounded-lg bg-white/5 border border-white/5">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{key}</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="reviews" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="text-center py-12">
                    <Star className="h-12 w-12 text-muted mx-auto mb-4 opacity-20" />
                    <p className="text-muted-foreground">Aucun avis pour le moment.</p>
                    <Button variant="link" className="mt-2 text-primary">Soyez le premier à donner votre avis</Button>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>

        {/* You May Also Like */}
        {relatedProducts.length > 0 && (
          <div className="mt-24 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">Vous aimerez aussi</h3>
              <Button variant="ghost" className="text-primary hover:text-primary/80" onClick={() => navigate("/store")}>
                Voir tout <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p, idx) => (
                <RefinedProductCard 
                  key={p.id} 
                  product={p} 
                  index={idx} 
                  onQuickView={() => {}} 
                  prefersReducedMotion={false}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-xl border-t border-white/10 p-4 lg:hidden z-50 safe-area-bottom">
        <div className="flex gap-3">
          <div className="flex flex-col justify-center flex-1">
             <span className="text-xs text-muted-foreground uppercase">Total</span>
             <span className="font-bold text-lg text-primary">{(product.price * quantity).toFixed(0)} DA</span>
          </div>
          <Button size="lg" className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-lg shadow-primary/25" onClick={handleAddToCart}>
            Ajouter
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
