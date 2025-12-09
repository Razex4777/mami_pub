import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import { 
  Star, 
  Truck, 
  Zap,
  Sparkles,
  Badge as BadgeIcon,
  ShoppingBag,
  ShoppingCart,
  Eye
} from 'lucide-react';
import { ShoppingCartAddIcon, HeartFavoriteIcon, EyeQuickViewIcon } from '@/components/icons/CustomIcons';
import { Button } from '@/components/ui/interactive/button';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Product {
  id: string; // UUID from Supabase
  name: string;
  category: string;
  price: number;
  image: string;
  specs: string;
  rating?: number;
  reviews?: number;
  inStock?: boolean;
  featured?: boolean;
  tags?: string[];
  deliveryTime?: string;
  discount?: number;
}

interface RefinedProductCardProps {
  product: Product;
  index: number;
  onQuickView: (product: Product) => void;
  prefersReducedMotion?: boolean;
}

const RefinedProductCard = forwardRef<HTMLDivElement, RefinedProductCardProps>(({
  product,
  index,
  onQuickView,
  prefersReducedMotion = false
}, ref) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [successAnimation, setSuccessAnimation] = useState<any>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { addItem } = useCart();
  const navigate = useNavigate();

  // Load success animation
  useEffect(() => {
    if (!prefersReducedMotion) {
      fetch('/animations/cart-success.json')
        .then(res => res.json())
        .then(data => setSuccessAnimation(data))
        .catch(err => console.error('Failed to load success animation:', err));
    }
  }, [prefersReducedMotion]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!product.inStock) {
      toast.error('Produit en rupture de stock');
      return;
    }

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
    });

    // Show success animation
    if (!prefersReducedMotion && successAnimation) {
      setShowSuccessAnimation(true);
      setTimeout(() => setShowSuccessAnimation(false), 2000);
    }

    toast.success('Ajouté au panier', {
      description: product.name,
    });
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Retiré des favoris' : 'Ajouté aux favoris');
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.inStock) return;
    
    navigate('/checkout', { state: { product } });
  };

  // Card animation variants
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: prefersReducedMotion ? 0 : 0.6,
        delay: prefersReducedMotion ? 0 : index * 0.1,
        ease: [0.4, 0, 0.2, 1] as [number, number, number, number]
      }
    }
  };

  const imageVariants = {
    hover: {
      scale: prefersReducedMotion ? 1 : 1.1,
      transition: { duration: 0.4, ease: "easeOut" as const }
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" as const }
    }
  };

  return (
    <motion.div
      ref={cardRef}
      variants={cardVariants}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      className={cn(
        "group relative bg-card/40 backdrop-blur-md rounded-xl overflow-hidden border border-white/10",
        "hover:border-primary/50 transition-all duration-300",
        "flex flex-col h-full cursor-pointer"
      )}
      onClick={() => navigate(`/product/${product.id}`)}
      onMouseEnter={() => !prefersReducedMotion && setIsHovered(true)}
      onMouseLeave={() => !prefersReducedMotion && setIsHovered(false)}
    >
      {/* Success Animation Overlay */}
      <AnimatePresence>
        {showSuccessAnimation && successAnimation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <div className="w-32 h-32">
              <Lottie animationData={successAnimation} loop={false} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted/20">
        <motion.div
          variants={imageVariants}
          animate={isHovered ? "hover" : ""}
          className="w-full h-full"
        >
          <img
            src={product.image}
            alt={product.name}
            className={cn(
              "w-full h-full object-cover transition-all duration-700",
              imageLoaded ? "opacity-100 blur-0" : "opacity-0 blur-lg"
            )}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />
        </motion.div>

        {/* Loading Skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-muted/30 via-muted/50 to-muted/30 animate-pulse" />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {product.discount && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1"
            >
              <Zap className="h-3 w-3" />
              <span>-{product.discount}%</span>
            </motion.div>
          )}
          {product.featured && (
            <motion.div
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="bg-gradient-to-r from-primary to-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1"
            >
              <Sparkles className="h-3 w-3" />
              <span>Populaire</span>
            </motion.div>
          )}
          {!product.inStock && (
            <div className="bg-gray-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              Rupture
            </div>
          )}
        </div>

        {/* Wishlist Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleWishlist}
          className={cn(
            "absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-sm transition-colors",
            isWishlisted 
              ? "bg-red-500 text-white" 
              : "bg-white/80 text-gray-700 hover:bg-white"
          )}
        >
          <HeartFavoriteIcon size={16} className={cn(isWishlisted && "brightness-0 invert")} />
        </motion.button>

        {/* Quick Actions Overlay - REMOVED */}
        
        {/* Hover Sparkle Effect */}
        {isHovered && !prefersReducedMotion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          >
            <Sparkles className="h-8 w-8 text-primary/50" />
          </motion.div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
             {/* Category */}
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
              {product.category}
            </span>
            {/* Title */}
            <h3 className="text-sm font-bold line-clamp-2 group-hover:text-primary transition-colors leading-tight text-white">
              {product.name}
            </h3>
          </div>
          {/* Rating */}
          <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg">
            <Star className="h-3 w-3 text-yellow-500 fill-current" />
            <span className="text-xs font-bold text-white">{product.rating}</span>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
           <span className="text-xl font-black text-white">
              {product.price.toFixed(0)} DA
           </span>
           {product.discount && (
              <span className="text-xs text-muted-foreground line-through">
                {(product.price / (1 - product.discount / 100)).toFixed(0)} DA
              </span>
            )}
        </div>

        {/* Action Buttons */}
        <div className="mt-auto pt-2 grid grid-cols-4 gap-2">
           {/* Buy Now - Primary */}
           <Button 
             onClick={handleBuyNow}
             disabled={!product.inStock}
             className="col-span-2 bg-primary hover:bg-primary/90 text-white h-9 text-xs font-bold"
           >
             <ShoppingBag className="mr-1.5 h-3.5 w-3.5" />
             Acheter
           </Button>

           {/* Add to Cart - Secondary */}
           <Button 
             onClick={handleAddToCart}
             disabled={!product.inStock}
             className="col-span-1 bg-white/10 hover:bg-white/20 text-white border border-white/10 h-9 p-0"
             title="Ajouter au panier"
           >
             <ShoppingCart className="h-4 w-4" />
           </Button>

           {/* View Details - Secondary */}
           <Button 
             onClick={(e) => {
               e.stopPropagation();
               navigate(`/product/${product.id}`);
             }}
             className="col-span-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 h-9 p-0"
             title="Voir détails"
           >
             <Eye className="h-4 w-4" />
           </Button>
        </div>
      </div>
    </motion.div>
  );
});

RefinedProductCard.displayName = 'RefinedProductCard';

export default RefinedProductCard;
