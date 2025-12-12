import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/interactive/button';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

const FloatingCart: React.FC = () => {
  const { state, removeItem, updateQuantity, closeCart, clearCart } = useCart();
  const navigate = useNavigate();

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeItem(id);
      toast.success('Produit supprimé du panier');
    } else {
      updateQuantity(id, newQuantity);
    }
  };

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  if (!state.isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 modal-overlay"
        onClick={closeCart}
      />

      {/* Cart Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l border-border shadow-2xl z-50 flex flex-col modal-content">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-full">
              <ShoppingBag className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Panier</h2>
              <p className="text-sm text-muted-foreground">
                {state.itemCount} article{state.itemCount > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={closeCart}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
          {state.items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Votre panier est vide</h3>
              <p className="text-muted-foreground mb-4">
                Ajoutez des produits pour commencer vos achats
              </p>
              <Button onClick={closeCart} className="btn-magnetic">
                Continuer les achats
              </Button>
            </div>
          ) : (
            <>
              {state.items.map((item) => (
                <div 
                  key={item.id} 
                  className="flex gap-4 p-4 rounded-xl bg-card/50 border border-border/50 hover:bg-card/70 transition-colors"
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-2 mb-1">
                      {item.name}
                    </h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      {item.category}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-primary">
                        {item.price.toFixed(0)} DA
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="h-6 w-6 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="h-6 w-6 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-500/20"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}

              {/* Clear Cart Button */}
              {state.items.length > 0 && (
                <Button
                  variant="outline"
                  onClick={clearCart}
                  className="w-full text-red-500 border-red-500/20 hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Vider le panier
                </Button>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {state.items.length > 0 && (
          <div className="border-t border-border p-6 space-y-4">
            {/* Subtotal */}
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Total</span>
              <span className="text-primary">{state.total.toFixed(0)} DA</span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={handleCheckout}
                className="w-full h-12 btn-magnetic gradient-primary"
                size="lg"
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                Passer la commande
              </Button>
              
              <Button 
                variant="outline" 
                onClick={closeCart}
                className="w-full h-12"
              >
                Continuer les achats
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default FloatingCart;