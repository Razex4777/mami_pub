import { Button } from "@/components/ui/interactive/button";
import { ShoppingCart, Eye } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  image: string;
  specs: string;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleAddToCart = () => {
    toast.success("Added to cart", {
      description: product.name,
    });
  };

  return (
    <div
      className="gradient-card rounded-xl border border-border overflow-hidden hover-lift hover-glow group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="aspect-square overflow-hidden bg-muted relative">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              <Button size="lg" variant="secondary" className="backdrop-blur-sm">
                <Eye className="h-5 w-5 mr-2" />
                Voir les Détails
              </Button>
            </div>
          </div>
        </div>
      </Link>

      <div className="p-6">
        <div className="mb-4">
          <p className="text-xs text-primary uppercase tracking-wider mb-2 font-semibold">
            {product.category}
          </p>
          <Link to={`/product/${product.id}`}>
            <h3 className="text-lg font-semibold line-clamp-2 mb-2 hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>
          <p className="text-sm text-muted-foreground">{product.specs}</p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            <span className="text-3xl font-bold text-primary">
              {product.price.toFixed(2)}€
            </span>
          </div>

          <Button
            size="lg"
            className="gradient-primary hover:opacity-90 transition-opacity h-12 px-6"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            Ajouter
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
