import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  ShoppingBag, 
  ShoppingCart,
  Truck,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  Minus,
  Plus,
  Loader2,
  Play,
  Volume2,
  VolumeX,
  Sparkles,
  Tag,
  Maximize2,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/interactive/button";
import { Badge } from "@/components/ui/data-display/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/navigation/tabs";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import RefinedProductCard from "@/components/product/RefinedProductCard";
import MediaLightbox from "@/components/ui/overlays/MediaLightbox";
import { cn } from "@/lib/utils";
import { getProductById, getActiveProducts, incrementViewerCount, Product as SupabaseProduct, ProductSpec } from "@/supabase";
import { useLanguage } from "@/contexts/LanguageContext";

// Helper to check if URL is a video
const isVideoUrl = (url: string): boolean => {
  const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.m4v'];
  const lowerUrl = url.toLowerCase();
  return videoExtensions.some(ext => lowerUrl.includes(ext));
};

// Sort media: videos first, then images
const sortMedia = (media: string[]): string[] => {
  const videos = media.filter(isVideoUrl);
  const images = media.filter(url => !isVideoUrl(url));
  return [...videos, ...images];
};

// Store product type for related products display
interface RelatedProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  images?: string[];
  tags?: string[];
  condition?: 'new' | 'used';
}

// Helper to filter only images (no videos)
const filterImages = (urls: string[]): string[] => {
  const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.m4v'];
  return urls.filter(url => !videoExtensions.some(ext => url.toLowerCase().includes(ext)));
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { t, language } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Data fetching state
  const [product, setProduct] = useState<SupabaseProduct | null>(null);
  const [sortedMedia, setSortedMedia] = useState<string[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // French text (default)
  const fr = {
    loading: "Chargement du produit...",
    notFound: "Produit non trouvé",
    backToStore: "Retour au magasin",
    missingId: "ID produit manquant",
    loadError: "Erreur lors du chargement du produit",
    loadErrorDesc: "Impossible de charger les détails du produit.",
    breadcrumb: { home: "Accueil", store: "Store" },
    condition: { new: "Neuf", used: "Occasion" },
    views: "vues",
    price: { paymentOnDelivery: "Paiement à la livraison", shippingCalc: "Frais de port calculés au checkout" },
    actions: { addToCart: "Ajouter au panier", buyNow: "Acheter maintenant", add: "Ajouter" },
    trust: { delivery: "Livraison 48h", guarantee: "Garantie 100%", returns: "Retours Simples" },
    tabs: { description: "Description", specs: "Spécifications" },
    noDescription: "Aucune description disponible.",
    noSpecs: "Aucune spécification disponible.",
    tags: "Tags",
    related: { title: "Vous aimerez aussi", viewAll: "Voir tout" },
    mobile: { total: "Total" },
    toast: { addedToCart: "Ajouté au panier" }
  };

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
    return t(key, 'productview');
  };

  // Fetch product and related products
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError('ID produit manquant');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch the main product
        const productData = await getProductById(id);
        
        if (!productData) {
          setError('Produit non trouvé');
          setIsLoading(false);
          return;
        }

        setProduct(productData);
        
        // Increment viewer count
        incrementViewerCount(id).catch(console.error);
        
        // Sort media: videos first, then images
        const media = sortMedia(productData.images || []);
        setSortedMedia(media);

        // Fetch related products with smart scoring
        const allProducts = await getActiveProducts();
        const currentTags = productData.tags || [];
        const currentCategory = productData.category;
        const currentCondition = productData.condition;
        
        // Score and sort products by relevance
        const scoredProducts = allProducts
          .filter(p => p.id !== id)
          .map(p => {
            let score = 0;
            
            // Same category = +10 points
            if (p.category === currentCategory) score += 10;
            
            // Same condition (new/used) = +5 points
            if (p.condition === currentCondition) score += 5;
            
            // Matching tags = +3 points per tag
            const productTags = p.tags || [];
            const matchingTags = currentTags.filter(tag => 
              productTags.some(pt => pt.toLowerCase() === tag.toLowerCase())
            );
            score += matchingTags.length * 3;
            
            // Add some randomness to mix things up
            score += Math.random() * 2;
            
            const images = filterImages(p.images || []);
            return {
              id: p.id,
              name: p.name,
              category: p.category,
              price: p.price,
              image: images[0] || '/images/placeholder.png',
              images: images,
              tags: p.tags,
              condition: p.condition,
              score,
            };
          })
          .sort((a, b) => b.score - a.score)
          .slice(0, 4)
          .map(({ score, ...rest }) => rest); // Remove score from final object
        
        setRelatedProducts(scoredProducts);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Erreur lors du chargement du produit');
        toast.error('Erreur de chargement', {
          description: 'Impossible de charger les détails du produit.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  // Auto-play video with sound when it's the active media
  useEffect(() => {
    if (videoRef.current && sortedMedia[activeMediaIndex] && isVideoUrl(sortedMedia[activeMediaIndex])) {
      videoRef.current.muted = isMuted;
      videoRef.current.play().catch(() => {
        // Autoplay blocked, mute and try again
        if (videoRef.current) {
          videoRef.current.muted = true;
          setIsMuted(true);
          videoRef.current.play();
        }
      });
    }
  }, [activeMediaIndex, sortedMedia]);

  const currentMedia = sortedMedia[activeMediaIndex];
  const isCurrentVideo = currentMedia && isVideoUrl(currentMedia);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">{getText('loading')}</p>
        </div>
      </div>
    );
  }

  // Error or not found state
  if (error || !product) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center py-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{error || getText('notFound')}</h2>
          <Button onClick={() => navigate("/store")}>{getText('backToStore')}</Button>
        </div>
      </div>
    );
  }

  const mainImage = sortedMedia[0] || '/images/placeholder.png';

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '/images/placeholder.png',
      category: product.category,
      quantity: quantity
    });
    toast.success(getText('toast.addedToCart'), {
      description: `${quantity}x ${product.name}`
    });
  };

  const handleBuyNow = () => {
    // Navigate to checkout with product data
    navigate("/checkout", { 
      state: { 
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.images?.[0] || '/images/placeholder.png',
          category: product.category,
          quantity: quantity
        }
      } 
    });
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Calculate original price (cost + margin for display)
  const originalPrice = product.price * 1.2;

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-0">
      {/* Mobile Header / Nav */}
      <div className="sticky top-16 sm:top-20 z-40 bg-background/80 backdrop-blur-lg border-b border-white/5 px-4 h-14 flex items-center justify-between lg:hidden">
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
          <span className="hover:text-primary cursor-pointer" onClick={() => navigate("/")}>{getText('breadcrumb.home')}</span>
          <ChevronRight className="h-4 w-4" />
          <span className="hover:text-primary cursor-pointer" onClick={() => navigate("/store")}>{getText('breadcrumb.store')}</span>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Left Column: Media Gallery */}
          <div className="space-y-4">
            <div className="relative rounded-3xl overflow-hidden bg-card border border-white/10 group">
              {isCurrentVideo ? (
                <video
                  ref={videoRef}
                  src={currentMedia}
                  className="w-full h-auto max-h-[70vh] object-contain mx-auto"
                  loop
                  playsInline
                  autoPlay
                  muted={isMuted}
                />
              ) : (
                <img 
                  src={currentMedia || mainImage} 
                  alt={product.name} 
                  className="w-full h-auto max-h-[70vh] object-contain mx-auto transition-transform duration-700 group-hover:scale-105"
                />
              )}
              
              {/* Condition Badge */}
              {product.condition && (
                <Badge className={cn(
                  "absolute top-4 left-4 px-3 py-1 text-sm font-bold shadow-lg",
                  product.condition === 'new' 
                    ? "bg-green-500 hover:bg-green-600 text-white" 
                    : "bg-orange-500 hover:bg-orange-600 text-white"
                )}>
                  {product.condition === 'new' ? getText('condition.new') : getText('condition.used')}
                </Badge>
              )}
              
              {/* Video Controls */}
              {isCurrentVideo && (
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="absolute bottom-4 left-4 rounded-full bg-background/50 backdrop-blur-md border-white/10 hover:bg-background"
                  onClick={toggleMute}
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>
              )}
              
              {/* Expand/Lightbox Button */}
              <Button 
                variant="outline" 
                size="icon" 
                className="absolute bottom-4 right-4 rounded-full bg-background/50 backdrop-blur-md border-white/10 hover:bg-background"
                onClick={() => setIsLightboxOpen(true)}
              >
                <Maximize2 className="h-5 w-5" />
              </Button>
              
              <Button 
                variant="outline" 
                size="icon" 
                className="absolute top-4 right-4 rounded-full bg-background/50 backdrop-blur-md border-white/10 hidden lg:flex hover:bg-background"
                onClick={() => setIsWishlisted(!isWishlisted)}
              >
                <Heart className={cn("h-5 w-5", isWishlisted && "fill-red-500 text-red-500")} />
              </Button>
            </div>
            
            {/* Thumbnails - Real Media */}
            {sortedMedia.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {sortedMedia.slice(0, 4).map((media, idx) => (
                  <div 
                    key={idx} 
                    className={cn(
                      "aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all relative",
                      activeMediaIndex === idx ? "border-primary ring-2 ring-primary/20" : "border-transparent opacity-60 hover:opacity-100"
                    )}
                    onClick={() => setActiveMediaIndex(idx)}
                  >
                    {isVideoUrl(media) ? (
                      <>
                        <video src={media} className="w-full h-full object-cover" muted />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Play className="h-6 w-6 text-white" />
                        </div>
                      </>
                    ) : (
                      <img src={media} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Info */}
          <div className="lg:sticky lg:top-24 space-y-8">
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5">
                  {product.category}
                </Badge>
                {/* Viewer Count */}
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-white/5 px-3 py-1.5 rounded-full">
                  <Eye className="h-4 w-4" />
                  <span>{product.viewer_count || 0} {getText('views')}</span>
                </div>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight">
                {product.name}
              </h1>
            </div>

            {/* Price */}
            <div className="p-6 rounded-2xl bg-card/50 border border-white/5 backdrop-blur-sm">
              <div className="flex items-baseline gap-3 mb-4">
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
                    <span className="font-medium text-foreground">{getText('price.paymentOnDelivery')}</span>
                    <br />{getText('price.shippingCalc')}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <Button size="lg" className="h-14 text-lg rounded-xl bg-primary hover:bg-primary/90" onClick={handleAddToCart}>
                    <ShoppingBag className="mr-2 h-5 w-5" />
                    {getText('actions.addToCart')}
                  </Button>
                  <Button size="lg" variant="outline" className="h-14 text-lg rounded-xl border-primary/20 hover:bg-primary/5 text-primary hover:text-primary" onClick={handleBuyNow}>
                    {getText('actions.buyNow')}
                  </Button>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center text-center gap-2 p-4 rounded-xl bg-card/30 border border-white/5">
                <Truck className="h-6 w-6 text-blue-400" />
                <span className="text-xs font-bold">{getText('trust.delivery')}</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2 p-4 rounded-xl bg-card/30 border border-white/5">
                <ShieldCheck className="h-6 w-6 text-green-400" />
                <span className="text-xs font-bold">{getText('trust.guarantee')}</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2 p-4 rounded-xl bg-card/30 border border-white/5">
                <RotateCcw className="h-6 w-6 text-purple-400" />
                <span className="text-xs font-bold">{getText('trust.returns')}</span>
              </div>
            </div>

            {/* Details Tabs */}
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="w-full grid grid-cols-2 bg-card/50 p-1 rounded-xl">
                <TabsTrigger value="description" className="rounded-lg">{getText('tabs.description')}</TabsTrigger>
                <TabsTrigger value="specs" className="rounded-lg">{getText('tabs.specs')}</TabsTrigger>
              </TabsList>
              <div className="mt-6 min-h-[200px]">
                <TabsContent value="description" className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <p className="text-lg leading-relaxed text-muted-foreground">
                    {product.description || getText('noDescription')}
                  </p>
                  
                  {/* Tags */}
                  {product.tags && product.tags.length > 0 && (
                    <div className="space-y-3 mt-6">
                      <h4 className="font-bold text-foreground flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        {getText('tags')}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {product.tags.map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="specs" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {product.specs && product.specs.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {product.specs.map((spec, idx) => (
                        <div key={idx} className="flex flex-col p-3 rounded-lg bg-white/5 border border-white/5">
                          <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{spec.name}</span>
                          <span className="font-medium">{spec.description}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">{getText('noSpecs')}</p>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>

        {/* You May Also Like */}
        {relatedProducts.length > 0 && (
          <div className="mt-24 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">{getText('related.title')}</h3>
              <Button variant="ghost" className="text-primary hover:text-primary/80" onClick={() => navigate("/store")}>
                {getText('related.viewAll')} <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p, idx) => (
                <RefinedProductCard 
                  key={p.id} 
                  product={{
                    id: p.id,
                    name: p.name,
                    category: p.category,
                    price: p.price,
                    image: p.image,
                    images: p.images,
                    tags: p.tags,
                    condition: p.condition,
                  }} 
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
      <div className="fixed bottom-16 left-0 right-0 bg-background/90 backdrop-blur-xl border-t border-white/10 p-3 sm:p-4 lg:hidden z-40 safe-area-bottom">
        <div className="flex gap-3">
          <div className="flex flex-col justify-center flex-1">
             <span className="text-[10px] sm:text-xs text-muted-foreground uppercase">{getText('mobile.total')}</span>
             <span className="font-bold text-base sm:text-lg text-primary">{(product.price * quantity).toFixed(0)} DA</span>
          </div>
          <Button size="default" className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-lg shadow-primary/25 text-sm sm:text-base" onClick={handleAddToCart}>
            {getText('actions.add')}
          </Button>
        </div>
      </div>

      {/* Media Lightbox */}
      <MediaLightbox
        media={sortedMedia}
        initialIndex={activeMediaIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
      />
    </div>
  );
};

export default ProductDetail;
