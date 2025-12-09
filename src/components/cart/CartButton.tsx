import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Package } from 'lucide-react';
import { Button } from '@/components/ui/interactive/button';
import { useCart } from '@/contexts/CartContext';

const CartButton: React.FC = () => {
  const { state, openCart } = useCart();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (state.itemCount > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 600);
      return () => clearTimeout(timer);
    }
  }, [state.itemCount]);

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <Button
        onClick={openCart}
        className={`h-16 w-16 rounded-full shadow-2xl transition-all duration-300 gradient-primary relative overflow-hidden ${
          isAnimating ? 'animate-bounce' : ''
        }`}
        size="lg"
      >
        {/* Background Animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-blue-500 to-cyan-500 opacity-80 animate-gradient" />
        
        {/* Content */}
        <div className="relative z-10 flex items-center justify-center">
          {state.itemCount > 0 ? (
            <>
              <ShoppingCart className="h-6 w-6 text-white" />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-pulse">
                {state.itemCount > 99 ? '99+' : state.itemCount}
              </span>
            </>
          ) : (
            <Package className="h-6 w-6 text-white" />
          )}
        </div>

        {/* Ripple Effect */}
        <div className="absolute inset-0 rounded-full bg-white/20 scale-0 animate-ping" />
      </Button>

      {/* Floating Price Summary */}
      {state.itemCount > 0 && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-card/90 backdrop-blur-sm rounded-lg px-3 py-1 border border-border/50 text-sm font-medium whitespace-nowrap animate-fade-in">
          <div className="flex items-center gap-2">
            <span>{state.itemCount} article{state.itemCount > 1 ? 's' : ''}</span>
            <span className="text-primary font-bold">{state.total.toFixed(0)} DA</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartButton;