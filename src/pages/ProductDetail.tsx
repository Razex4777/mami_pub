import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/interactive/button";
import { Badge } from "@/components/ui/data-display/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/navigation/tabs";
import { 
  ShoppingCart, 
  Heart, 
  Share2, 
  Star, 
  Truck, 
  Shield, 
  Zap,
  ChevronLeft,
  Minus,
  Plus
} from "lucide-react";
import { toast } from "sonner";
import productImage1 from "@/assets/product-dtf-transfers.jpg";
import productImage2 from "@/assets/product-heat-press.jpg";
import productImage3 from "@/assets/product-vinyl.jpg";

const products = [
  {
    id: 1,
    name: "Premium DTF Transfer - Vibrant Graphics",
    category: "DTF Transfers",
    price: 24.99,
    image: productImage1,
    specs: "Full color, 300 DPI, washable",
    description: "Professional-grade DTF transfers featuring vivid colors and exceptional durability. Perfect for apparel decoration, merchandise creation, and custom design projects. Each transfer is precision-cut and ready to apply.",
    features: [
      "300 DPI resolution for crystal-clear graphics",
      "50+ wash durability with proper application",
      "Compatible with cotton, polyester, and blends",
      "Easy application with standard heat press",
      "Vibrant colors that won't fade or crack"
    ],
    specs_detail: {
      "Print Quality": "300 DPI",
      "Material": "Premium DTF film",
      "Temperature": "320°F (160°C)",
      "Press Time": "15 seconds",
      "Pressure": "Medium",
      "Peel": "Hot peel"
    }
  },
  {
    id: 2,
    name: "Commercial Heat Press - 16x20",
    category: "Equipment",
    price: 1299.99,
    image: productImage2,
    specs: "Digital display, auto-release",
    description: "Industrial-grade heat press machine designed for high-volume production. Features precision temperature control, digital timer, and automatic pressure release for consistent, professional results every time.",
    features: [
      "16x20 inch heating platen for large designs",
      "Digital temperature display (32-430°F)",
      "Adjustable pressure control system",
      "Automatic timer with audio alert",
      "Commercial-grade heating element"
    ],
    specs_detail: {
      "Platen Size": "16 x 20 inches",
      "Temperature Range": "32-430°F",
      "Timer": "0-999 seconds",
      "Pressure": "Adjustable",
      "Power": "1800W",
      "Voltage": "110V"
    }
  },
  {
    id: 3,
    name: "Premium Heat Transfer Vinyl",
    category: "Materials",
    price: 39.99,
    image: productImage3,
    specs: "50-yard roll, multiple colors",
    description: "High-quality heat transfer vinyl perfect for creating custom apparel, signage, and decorative items. Available in a wide range of colors with excellent stretchability and durability.",
    features: [
      "50-yard continuous roll for bulk projects",
      "Superior stretchability for activewear",
      "Easy to weed and apply",
      "Compatible with all major cutters",
      "Long-lasting adhesive backing"
    ],
    specs_detail: {
      "Roll Length": "50 yards",
      "Width": "12 inches",
      "Thickness": "3.2 mil",
      "Application": "305°F, 15 seconds",
      "Durability": "100+ washes",
      "Finish": "Matte"
    }
  }
];

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  const product = products.find(p => p.id === Number(id)) || products[0];

  const handleAddToCart = () => {
    toast.success("Added to cart!", {
      description: `${quantity}x ${product.name}`,
    });
  };

  const handleShare = () => {
    toast.success("Link copied to clipboard!");
  };

  return (
    <div className="min-h-screen">
      {/* Back Button */}
      <div className="sticky top-16 z-40 backdrop-blur-glass border-b border-border">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="hover:bg-muted/50"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Retour aux Produits
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Image Section */}
          <div className="space-y-4 animate-fade-in">
            <div className="aspect-square rounded-2xl overflow-hidden bg-card border border-border hover-glow group">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            
            {/* Thumbnails - could be expanded with multiple images */}
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg overflow-hidden bg-card border-2 border-primary cursor-pointer hover-lift"
                >
                  <img
                    src={product.image}
                    alt={`View ${i}`}
                    className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6 animate-slide-up">
            <div>
              <Badge variant="secondary" className="mb-3">
                {product.category}
              </Badge>
              <h1 className="text-4xl font-bold mb-4 leading-tight">
                {product.name}
              </h1>
              
              {/* Rating */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="h-5 w-5 fill-primary text-primary"
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  (124 avis)
                </span>
              </div>

              <p className="text-lg text-secondary leading-relaxed mb-6">
                {product.description}
              </p>
            </div>

            {/* Price */}
            <div className="py-6 border-y border-border">
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-bold gradient-primary bg-clip-text text-transparent">
                  {product.price.toFixed(2)}€
                </span>
                <span className="text-sm text-muted-foreground line-through">
                  {(product.price * 1.3).toFixed(2)}€
                </span>
                <Badge variant="destructive" className="ml-2">
                  -23%
                </Badge>
              </div>
            </div>

            {/* Quantity Selector */}
            <div>
              <label className="text-sm font-medium mb-3 block">
                Quantité
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 panel-elevated rounded-lg p-1 border border-border">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-10 w-10 hover:bg-muted"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-lg font-semibold w-12 text-center">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-10 w-10 hover:bg-muted"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">
                  2 847 en stock
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                size="lg"
                className="flex-1 h-14 text-lg gradient-primary hover:opacity-90 transition-opacity animate-glow"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Ajouter au Panier
              </Button>
              <Button
                size="lg"
                variant="outline"
                className={`h-14 px-6 border-border hover:bg-muted ${
                  isFavorite ? "text-red-500 border-red-500" : ""
                }`}
                onClick={() => setIsFavorite(!isFavorite)}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-6 border-border hover:bg-muted"
                onClick={handleShare}
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6">
              <div className="text-center p-4 rounded-lg panel-elevated border border-border">
                <Truck className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-xs font-medium">Livraison Rapide</p>
                <p className="text-xs text-muted-foreground">2-3 jours</p>
              </div>
              <div className="text-center p-4 rounded-lg panel-elevated border border-border">
                <Shield className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-xs font-medium">Garantie Qualité</p>
                <p className="text-xs text-muted-foreground">100% sécurisé</p>
              </div>
              <div className="text-center p-4 rounded-lg panel-elevated border border-border">
                <Zap className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-xs font-medium">Retours Faciles</p>
                <p className="text-xs text-muted-foreground">Politique 30 jours</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Information Tabs */}
        <Tabs defaultValue="features" className="animate-fade-in">
          <TabsList className="grid w-full max-w-2xl grid-cols-3 mb-8">
            <TabsTrigger value="features">Caractéristiques</TabsTrigger>
            <TabsTrigger value="specs">Spécifications</TabsTrigger>
            <TabsTrigger value="reviews">Avis</TabsTrigger>
          </TabsList>

          <TabsContent value="features" className="space-y-4">
            <div className="panel-elevated rounded-xl p-8 border border-border">
              <h3 className="text-2xl font-semibold mb-6">Caractéristiques Principales</h3>
              <ul className="space-y-4">
                {product.features?.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                    <span className="text-secondary leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="specs">
            <div className="panel-elevated rounded-xl p-8 border border-border">
              <h3 className="text-2xl font-semibold mb-6">Spécifications Techniques</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(product.specs_detail || {}).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between items-center pb-4 border-b border-border"
                  >
                    <span className="font-medium">{key}</span>
                    <span className="text-secondary">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews">
            <div className="panel-elevated rounded-xl p-8 border border-border">
              <h3 className="text-2xl font-semibold mb-6">Avis Clients</h3>
              <div className="space-y-6">
                {[1, 2, 3].map((review) => (
                  <div key={review} className="pb-6 border-b border-border last:border-0">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-semibold text-primary">JD</span>
                      </div>
                      <div>
                        <p className="font-medium">John Doe</p>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className="h-4 w-4 fill-primary text-primary"
                              />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">Il y a 2 jours</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-secondary leading-relaxed">
                      Excellente qualité et livraison rapide ! Les couleurs sont éclatantes et l'application était fluide. Hautement recommandé pour un usage professionnel.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProductDetail;
