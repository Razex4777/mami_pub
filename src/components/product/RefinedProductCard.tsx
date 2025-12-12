import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import { 
  Star, 
  Truck, 
  Sparkles,
  Badge as BadgeIcon,
  ShoppingBag,
  ShoppingCart,
  Eye,
  Heart
} from 'lucide-react';
import { Button } from '@/components/ui/interactive/button';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Product } from '@/pages/store/types';

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
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [successAnimation, setSuccessAnimation] = useState<any>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const hoverIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const navigate = useNavigate();
  
  const isWishlisted = isFavorite(product.id);

  // Get all images for swipe (use images array or fallback to single image)
  // Filter out empty/invalid URLs
  const allImages = (product.images && product.images.length > 0 
    ? product.images 
    : [product.image]
  ).filter(url => url && url.trim() !== '' && url !== 'undefined');
  
  // Fallback to placeholder if no valid images
  const displayImages = allImages.length > 0 ? allImages : ['/placeholder.svg'];

  // Image swipe on hover
  useEffect(() => {
    if (isHovered && displayImages.length > 1 && !prefersReducedMotion) {
      hoverIntervalRef.current = setInterval(() => {
        setCurrentImageIndex(prev => (prev + 1) % displayImages.length);
      }, 1200); // Switch every 1.2 seconds
    } else {
      if (hoverIntervalRef.current) {
        clearInterval(hoverIntervalRef.current);
        hoverIntervalRef.current = null;
      }
      // Only reset index when hover ends, don't reset imageLoaded
      if (!isHovered) {
        setCurrentImageIndex(0);
      }
    }

    return () => {
      if (hoverIntervalRef.current) {
        clearInterval(hoverIntervalRef.current);
      }
    };
  }, [isHovered, displayImages.length, prefersReducedMotion]);

  // Handle imageLoaded state when currentImageIndex changes - check if cached first
  useEffect(() => {
    const newSrc = displayImages[currentImageIndex];
    if (!newSrc) return;

    // Create a temporary Image to check if already cached
    const img = new Image();
    img.src = newSrc;
    
    if (img.complete && img.naturalWidth > 0) {
      // Image is already cached, mark as loaded immediately
      setImageLoaded(true);
    } else {
      // Image needs to load, show loading state
      setImageLoaded(false);
      img.onload = () => setImageLoaded(true);
      img.onerror = () => setImageLoaded(true); // Still mark as "loaded" to remove blur on error
    }
  }, [currentImageIndex, displayImages]);

  // Eagerly preload all images to minimize future loads
  useEffect(() => {
    if (displayImages.length <= 1) return;
    
    displayImages.forEach(src => {
      if (src) {
        const img = new Image();
        img.src = src;
      }
    });
  }, [displayImages]);

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

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(product.id);
    toast.success(isWishlisted ? 'Retiré des favoris' : 'Ajouté aux favoris');
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
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
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImageIndex}
              src={displayImages[currentImageIndex]}
              alt={product.name}
              initial={{ opacity: 0 }}
              animate={{ opacity: imageLoaded ? 1 : 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "w-full h-full object-cover",
                imageLoaded ? "blur-0" : "blur-lg"
              )}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(true)} // Handle broken images
              loading="lazy"
            />
          </AnimatePresence>
        </motion.div>

        {/* Image Indicators */}
        {displayImages.length > 1 && isHovered && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            {displayImages.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all",
                  idx === currentImageIndex ? "bg-white w-3" : "bg-white/50"
                )}
              />
            ))}
          </div>
        )}

        {/* Loading Skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-muted/30 via-muted/50 to-muted/30 animate-pulse" />
        )}

        {/* Wishlist Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleToggleWishlist}
          className={cn(
            "absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-sm transition-colors",
            isWishlisted 
              ? "bg-red-500 text-white" 
              : "bg-white/80 text-gray-700 hover:bg-white"
          )}
        >
          <Heart size={16} className={cn(isWishlisted && "fill-current")} />
        </motion.button>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col gap-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
             {/* Category */}
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              {product.category}
            </span>
            {/* Title */}
            <h3 className="text-base font-bold line-clamp-2 group-hover:text-primary transition-colors leading-tight text-white">
              {product.name}
            </h3>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
           <span className="text-xl font-black text-white">
              {product.price.toFixed(0)} DA
           </span>
        </div>

        {/* Action Buttons */}
        <div className="mt-auto pt-2 grid grid-cols-4 gap-3">
           {/* Buy Now - Primary */}
           <Button 
             onClick={handleBuyNow}
             className="col-span-2 bg-primary hover:bg-primary/90 text-white h-10 text-sm font-bold"
           >
             <ShoppingBag className="mr-2 h-4 w-4" />
             Acheter
           </Button>

           {/* Add to Cart - Secondary */}
           <Button 
             onClick={handleAddToCart}
             className="col-span-1 bg-white/10 hover:bg-white/20 text-white border border-white/10 h-10 p-0"
             title="Ajouter au panier"
           >
             <ShoppingCart className="h-5 w-5" />
           </Button>

           {/* View Details - Secondary */}
           <Button 
             onClick={(e) => {
               e.stopPropagation();
               navigate(`/product/${product.id}`);
             }}
             className="col-span-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 h-10 p-0"
             title="Voir détails"
           >
             <Eye className="h-5 w-5" />
           </Button>
        </div>
      </div>
    </motion.div>
  );
});

RefinedProductCard.displayName = 'RefinedProductCard';

export default RefinedProductCard;
