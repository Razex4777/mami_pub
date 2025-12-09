import React, { useState, useEffect } from 'react';
import { X, Star, Truck, Shield, Heart, Share2, ShoppingCart, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/interactive/button';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

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

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, isOpen, onClose }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const { addItem } = useCart();

  // Mock additional images
  const productImages = product ? [product.image, product.image, product.image] : [];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setSelectedImage(0);
      setQuantity(1);
    }
  }, [isOpen, product]);

  const handleAddToCart = () => {
    if (!product) return;
    
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
      });
    }
    
    toast.success(`${quantity} article${quantity > 1 ? 's' : ''} ajouté${quantity > 1 ? 's' : ''} au panier`);
    onClose();
  };

  const handleShare = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.name,
          text: product.specs,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to copying to clipboard
        navigator.clipboard.writeText(window.location.href);
        toast.success('Lien copié dans le presse-papiers');
      }
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success('Lien copié dans le presse-papiers');
    }
  };

  if (!isOpen || !product) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 modal-overlay"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-background rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Image Section */}
            <div className="relative">
              {/* Main Image */}
              <div className="aspect-square rounded-t-2xl lg:rounded-l-2xl lg:rounded-tr-none overflow-hidden bg-muted/20">
                <img
                  src={productImages[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.discount && (
                    <div className="bg-red-500 text-white text-sm px-3 py-1 rounded-full font-bold">
                      -{product.discount}%
                    </div>
                  )}
                  {product.featured && (
                    <div className="bg-primary text-white text-sm px-3 py-1 rounded-full font-bold flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      <span>Populaire</span>
                    </div>
                  )}
                </div>

                {/* Image Navigation */}
                {productImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                    {productImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          index === selectedImage ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Thumbnail Images */}
              {productImages.length > 1 && (
                <div className="flex gap-2 p-4">
                  {productImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                        index === selectedImage ? 'border-primary' : 'border-border'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className="p-6 lg:p-8">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                    {product.category}
                  </span>
                  <h1 className="text-2xl font-bold mt-1 mb-2">{product.name}</h1>
                  <p className="text-muted-foreground">{product.specs}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Rating and Reviews */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${
                        i < Math.floor(product.rating || 0) 
                          ? 'text-yellow-500 fill-current' 
                          : 'text-muted-foreground'
                      }`} 
                    />
                  ))}
                  <span className="ml-1 font-medium">{product.rating}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  ({product.reviews} avis)
                </span>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-center gap-3">
                  {product.discount && (
                    <span className="text-lg text-muted-foreground line-through">
                      {(product.price / (1 - product.discount / 100)).toFixed(0)} DA
                    </span>
                  )}
                  <span className="text-3xl font-black price-display">
                    {product.price.toFixed(0)} DA
                  </span>
                </div>
                {product.discount && (
                  <p className="text-sm text-green-500 mt-1">
                    Économisez {((product.price / (1 - product.discount / 100)) - product.price).toFixed(0)} DA
                  </p>
                )}
              </div>

              {/* Features */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-full">
                    <Truck className="h-4 w-4 text-green-500" />
                  </div>
                  <span className="text-sm">Livraison {product.deliveryTime}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-full">
                    <Shield className="h-4 w-4 text-blue-500" />
                  </div>
                  <span className="text-sm">Garantie 2 ans</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    product.inStock ? 'bg-green-500/20' : 'bg-red-500/20'
                  }`}>
                    <div className={`h-4 w-4 rounded-full ${
                      product.inStock ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                  </div>
                  <span className={`text-sm ${product.inStock ? 'text-green-500' : 'text-red-500'}`}>
                    {product.inStock ? 'En stock' : 'Rupture de stock'}
                  </span>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-medium">Quantité:</span>
                <div className="flex items-center border border-border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-10 w-10 p-0"
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-10 w-10 p-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 mb-6">
                <Button 
                  onClick={handleAddToCart}
                  className="w-full h-12 btn-magnetic gradient-primary"
                  size="lg"
                  disabled={!product.inStock}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Ajouter au panier - {(product.price * quantity).toFixed(0)} DA
                </Button>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className="flex-1"
                  >
                    <Heart className={`h-4 w-4 mr-2 ${isWishlisted ? 'fill-current text-red-500' : ''}`} />
                    {isWishlisted ? 'Favoris' : 'Ajouter aux favoris'}
                  </Button>
                  <Button variant="outline" onClick={handleShare} className="flex-1">
                    <Share2 className="h-4 w-4 mr-2" />
                    Partager
                  </Button>
                </div>
              </div>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <span 
                        key={tag}
                        className="px-3 py-1 text-xs rounded-full bg-muted/50 text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuickViewModal;