import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/interactive/button';
import RefinedProductCard from './RefinedProductCard';
import QuickViewModal from './QuickViewModal';
import type { Product } from '@/pages/store/types';

interface RefinedProductGridProps {
  products: Product[];
  isLoading?: boolean;
  error?: string | null;
  onResetFilters?: () => void;
}

const RefinedProductGrid: React.FC<RefinedProductGridProps> = ({
  products,
  isLoading = false,
  error = null,
  onResetFilters
}) => {
  const [loadingAnimation, setLoadingAnimation] = useState<any>(null);
  const [emptyAnimation, setEmptyAnimation] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Load animations
  useEffect(() => {
    if (!prefersReducedMotion) {
      Promise.all([
        fetch('/animations/loading-dots.json').then(res => res.json()),
        fetch('/animations/empty-state.json').then(res => res.json())
      ])
        .then(([loading, empty]) => {
          setLoadingAnimation(loading);
          setEmptyAnimation(empty);
        })
        .catch(err => console.error('Failed to load animations:', err));
    }
  }, [prefersReducedMotion]);

  const handleQuickView = (product: Product) => {
    setSelectedProduct(product);
    setIsQuickViewOpen(true);
  };

  const handleCloseQuickView = () => {
    setIsQuickViewOpen(false);
    setTimeout(() => setSelectedProduct(null), 300);
  };

  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.1,
        delayChildren: prefersReducedMotion ? 0 : 0.2
      }
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center"
        >
          {loadingAnimation && !prefersReducedMotion ? (
            <div className="w-32 h-32 mb-6">
              <Lottie animationData={loadingAnimation} loop />
            </div>
          ) : (
            <div className="w-16 h-16 mb-6 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          )}
          <h3 className="text-xl font-semibold mb-2">Chargement des produits...</h3>
          <p className="text-muted-foreground">Veuillez patienter un instant</p>
        </motion.div>

        {/* Loading Skeleton Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-card rounded-2xl overflow-hidden border border-border/50 aspect-[4/5]">
              <div className="aspect-square bg-gradient-to-r from-muted/30 via-muted/50 to-muted/30 animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-3 bg-muted/30 rounded animate-pulse" />
                <div className="h-4 bg-muted/30 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-muted/30 rounded animate-pulse w-1/2" />
                <div className="flex justify-between items-center mt-4">
                  <div className="h-6 bg-muted/30 rounded animate-pulse w-20" />
                  <div className="h-6 bg-muted/30 rounded-full animate-pulse w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="py-20 text-center"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 text-red-500 mb-6">
          <Search className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Erreur de chargement</h3>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={onResetFilters}>
          Réessayer
        </Button>
      </motion.div>
    );
  }

  // Empty State
  if (products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="py-20 text-center"
      >
        {emptyAnimation && !prefersReducedMotion ? (
          <div className="w-64 h-64 mx-auto mb-6">
            <Lottie animationData={emptyAnimation} loop />
          </div>
        ) : (
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-muted/30 mb-6">
            <Search className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        <h3 className="text-2xl font-bold mb-2">Aucun produit trouvé</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Essayez de modifier vos critères de recherche ou vos filtres pour trouver ce que vous cherchez
        </p>
        {onResetFilters && (
          <Button onClick={onResetFilters} size="lg">
            Réinitialiser les filtres
          </Button>
        )}
      </motion.div>
    );
  }

  // Product Grid
  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        <AnimatePresence mode="popLayout">
          {products.map((product, index) => (
            <RefinedProductCard
              key={product.id}
              product={product}
              index={index}
              onQuickView={handleQuickView}
              prefersReducedMotion={prefersReducedMotion}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={selectedProduct}
        isOpen={isQuickViewOpen}
        onClose={handleCloseQuickView}
      />
    </>
  );
};

export default RefinedProductGrid;
