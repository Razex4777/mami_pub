import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/interactive/button";
import { Input } from "@/components/ui/forms/input";
import { Badge } from "@/components/ui/data-display/badge";
import { Separator } from "@/components/ui/layout/separator";
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  Tag,
  Shield,
  Truck
} from "lucide-react";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
}

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      name: "Premium DTF Transfer - Vibrant Graphics",
      price: 24.99,
      quantity: 2,
      image: "/placeholder.svg",
      category: "DTF Transfers"
    },
    {
      id: 2,
      name: "Commercial Heat Press - 16x20",
      price: 1299.99,
      quantity: 1,
      image: "/placeholder.svg",
      category: "Equipment"
    }
  ]);

  const [promoCode, setPromoCode] = useState("");
  const navigate = useNavigate();

  const updateQuantity = (id: number, change: number) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 500 ? 0 : 15.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-8">
        <div className="text-center max-w-md animate-fade-in">
          <div className="h-20 w-20 sm:h-32 sm:w-32 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <ShoppingCart className="h-10 w-10 sm:h-16 sm:w-16 text-muted-foreground" />
          </div>
          <h2 className="text-xl sm:text-3xl font-bold mb-3 sm:mb-4">Votre panier est vide</h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">
            Il semble que vous n'ayez encore rien ajouté à votre panier.
          </p>
          <Link to="/store">
            <Button size="default" className="gradient-primary text-sm sm:text-base">
              Parcourir les Produits
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6 md:mb-8 animate-fade-in">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2">Panier d'Achat</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {cartItems.length} {cartItems.length === 1 ? 'article' : 'articles'} dans votre panier
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            {cartItems.map((item, index) => (
              <div
                key={item.id}
                className="panel-elevated rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 border border-border hover-lift animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex gap-3 sm:gap-4 md:gap-6">
                  {/* Product Image */}
                  <Link 
                    to={`/product/${item.id}`}
                    className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-lg overflow-hidden bg-muted hover-glow group"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2 sm:gap-4 mb-2 sm:mb-3">
                      <div className="flex-1 min-w-0">
                        <Badge variant="secondary" className="mb-1 sm:mb-2 text-[10px] sm:text-xs">
                          {item.category}
                        </Badge>
                        <Link 
                          to={`/product/${item.id}`}
                          className="block hover:text-primary transition-colors"
                        >
                          <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-1 line-clamp-2">
                            {item.name}
                          </h3>
                        </Link>
                        <p className="text-lg sm:text-xl md:text-2xl font-bold text-primary">
                          {item.price.toFixed(0)} DA
                        </p>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        className="hover:bg-destructive/10 hover:text-destructive shrink-0 h-8 w-8 sm:h-10 sm:w-10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <div className="flex items-center gap-1 sm:gap-2 panel rounded-lg p-1 border border-border">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateQuantity(item.id, -1)}
                          className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-muted"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-xs sm:text-sm font-semibold w-6 sm:w-8 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateQuantity(item.id, 1)}
                          className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-muted"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <span className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                        Total: {(item.price * item.quantity).toFixed(0)} DA
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Continue Shopping */}
            <Link to="/store">
              <Button variant="outline" className="w-full border-border hover:bg-muted text-xs sm:text-sm">
                Continuer mes Achats
              </Button>
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="panel-elevated rounded-lg sm:rounded-xl p-4 sm:p-6 border border-border lg:sticky lg:top-24 space-y-4 sm:space-y-6 animate-fade-in">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Résumé de Commande</h2>

              <Separator />

              {/* Promo Code */}
              <div>
                <label className="text-xs sm:text-sm font-medium mb-2 block">
                  Code Promo
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Entrer le code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="bg-background border-border text-sm h-9 sm:h-10"
                  />
                  <Button variant="outline" className="border-border hover:bg-muted h-9 sm:h-10 w-9 sm:w-10 p-0">
                    <Tag className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Price Breakdown */}
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span className="font-medium">{subtotal.toFixed(0)} DA</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">Livraison</span>
                  <span className="font-medium">
                    {shipping === 0 ? (
                      <Badge variant="secondary" className="text-[10px] sm:text-xs">GRATUIT</Badge>
                    ) : (
                      `${shipping.toFixed(0)} DA`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">TVA (8%)</span>
                  <span className="font-medium">{tax.toFixed(0)} DA</span>
                </div>
              </div>

              <Separator />

              {/* Total */}
              <div className="flex justify-between items-baseline">
                <span className="text-sm sm:text-lg font-medium">Total</span>
                <span className="text-xl sm:text-2xl md:text-3xl font-bold text-primary">
                  {total.toFixed(0)} DA
                </span>
              </div>

              {/* Checkout Button */}
              <Button 
                size="default" 
                onClick={() => navigate('/checkout', { state: { cartItems, total } })}
                className="w-full h-11 sm:h-14 text-sm sm:text-lg gradient-primary hover:opacity-90 transition-opacity"
              >
                Passer la Commande
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>

              {/* Trust Badges */}
              <div className="space-y-2 sm:space-y-3 pt-2 sm:pt-4">
                <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs md:text-sm">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                  <span className="text-muted-foreground">Paiement sécurisé SSL</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs md:text-sm">
                  <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                  <span className="text-muted-foreground">Livraison gratuite dès 5000 DA</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
