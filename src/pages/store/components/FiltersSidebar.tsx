import { Input } from "@/components/ui/forms/input";
import {
  SlidersHorizontal,
  Sparkles,
  Package,
  Clock,
  Tag,
  Heart
} from "lucide-react";
import { FilterState } from "../types";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface FiltersSidebarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  categories: string[];
  maxPrice?: number;
  productCounts?: {
    total: number;
    new: number;
    used: number;
  };
}

const FiltersSidebar = ({
  filters,
  setFilters,
  selectedCategory,
  setSelectedCategory,
  categories,
  maxPrice = 100000,
  productCounts
}: FiltersSidebarProps) => {
  const { favoritesCount } = useFavorites();
  const { t, language } = useLanguage();

  // French text (default)
  const fr = {
    title: "Filtres",
    reset: "Réinitialiser",
    favorites: "Mes Favoris",
    condition: "État du produit",
    all: "Tous",
    new: "Neuf",
    used: "Occasion",
    categories: "Catégories",
    allCategories: "Toutes les catégories",
    priceRange: "Prix (DA)"
  };

  const getText = (key: string): string => {
    if (language === 'fr') {
      const value = fr[key as keyof typeof fr];
      return typeof value === 'string' ? value : key;
    }
    return t(`filters.${key}`, 'store');
  };
  
  const resetFilters = () => {
    setSelectedCategory("all");
    setFilters({
      priceRange: [0, maxPrice],
      categories: [],
      condition: 'all',
      showFavoritesOnly: false
    });
  };

  return (
    <aside className="w-full lg:w-64 flex-shrink-0">
      <div className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5 sticky top-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            {getText('title')}
          </h3>
          <button 
            onClick={resetFilters}
            className="text-xs text-primary hover:underline font-medium"
          >
            {getText('reset')}
          </button>
        </div>

        {/* Favorites Filter */}
        <div>
          <button
            onClick={() => setFilters(prev => ({ ...prev, showFavoritesOnly: !prev.showFavoritesOnly }))}
            className={cn(
              "w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all border flex items-center justify-between gap-2",
              filters.showFavoritesOnly
                ? 'bg-red-500 text-white border-red-500'
                : 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20'
            )}
          >
            <span className="flex items-center gap-2">
              <Heart className={cn("h-4 w-4", filters.showFavoritesOnly && "fill-current")} />
              {getText('favorites')}
            </span>
            <span className={cn(
              "px-2 py-0.5 rounded-full text-xs font-bold",
              filters.showFavoritesOnly ? "bg-white/20" : "bg-red-500/20"
            )}>
              {favoritesCount}
            </span>
          </button>
        </div>

        {/* Condition Filter - New/Used */}
        <div>
          <label className="text-xs font-bold tracking-wider uppercase text-muted-foreground block mb-3 flex items-center gap-2">
            <Tag className="h-3.5 w-3.5" />
            {getText('condition')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setFilters(prev => ({ ...prev, condition: 'all' }))}
              className={cn(
                "px-3 py-2 rounded-xl text-xs font-semibold transition-all border",
                filters.condition === 'all'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-white/5 text-muted-foreground hover:bg-white/10 border-white/10'
              )}
            >
              {getText('all')}
            </button>
            <button
              onClick={() => setFilters(prev => ({ ...prev, condition: 'new' }))}
              className={cn(
                "px-3 py-2 rounded-xl text-xs font-semibold transition-all border flex flex-col items-center gap-0.5",
                filters.condition === 'new'
                  ? 'bg-green-500 text-white border-green-500'
                  : 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border-green-500/20'
              )}
            >
              <Sparkles className="h-3.5 w-3.5" />
              {getText('new')}
              {productCounts && <span className="text-[10px] opacity-70">({productCounts.new})</span>}
            </button>
            <button
              onClick={() => setFilters(prev => ({ ...prev, condition: 'used' }))}
              className={cn(
                "px-3 py-2 rounded-xl text-xs font-semibold transition-all border flex flex-col items-center gap-0.5",
                filters.condition === 'used'
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 border-orange-500/20'
              )}
            >
              <Clock className="h-3.5 w-3.5" />
              {getText('used')}
              {productCounts && <span className="text-[10px] opacity-70">({productCounts.used})</span>}
            </button>
          </div>
        </div>

        {/* Categories */}
        <div>
          <label className="text-xs font-bold tracking-wider uppercase text-muted-foreground block mb-3 flex items-center gap-2">
            <Package className="h-3.5 w-3.5" />
            {getText('categories')}
          </label>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            <button
              onClick={() => setSelectedCategory("all")}
              className={cn(
                "w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between",
                selectedCategory === "all" 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-white/10 text-muted-foreground hover:text-foreground bg-white/5'
              )}
            >
              <span className="flex items-center gap-2">
                <Package className="h-3.5 w-3.5" />
                {getText('allCategories')}
              </span>
              {productCounts && <span className="text-[10px] opacity-70">{productCounts.total}</span>}
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all",
                  selectedCategory === category 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-white/10 text-muted-foreground hover:text-foreground bg-white/5'
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range Slider */}
        <div>
          <label className="text-xs font-bold tracking-wider uppercase text-muted-foreground block mb-3">
            {getText('priceRange')}
          </label>
          <div className="space-y-4">
            {/* Min/Max Inputs */}
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.priceRange[0] || ''}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    priceRange: [parseInt(e.target.value) || 0, prev.priceRange[1]] 
                  }))}
                  className="h-9 text-xs bg-white/5 border-white/10 text-center"
                />
              </div>
              <span className="text-muted-foreground text-sm font-medium">—</span>
              <div className="flex-1">
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.priceRange[1] || ''}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    priceRange: [prev.priceRange[0], parseInt(e.target.value) || maxPrice] 
                  }))}
                  className="h-9 text-xs bg-white/5 border-white/10 text-center"
                />
              </div>
            </div>
            
            {/* Quick price buttons */}
            <div className="flex flex-wrap gap-1.5">
              {[500, 1000, 5000, 10000, 50000].map((price) => (
                <button
                  key={price}
                  onClick={() => setFilters(prev => ({ ...prev, priceRange: [0, price] }))}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all",
                    filters.priceRange[1] === price 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-white/5 text-muted-foreground hover:bg-white/10'
                  )}
                >
                  &lt;{price.toLocaleString()}
                </button>
              ))}
              <button
                onClick={() => setFilters(prev => ({ ...prev, priceRange: [0, maxPrice] }))}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all",
                  filters.priceRange[1] === maxPrice 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-white/5 text-muted-foreground hover:bg-white/10'
                )}
              >
                +{maxPrice.toLocaleString()}
              </button>
            </div>
          </div>
        </div>

      </div>
    </aside>
  );
};

export default FiltersSidebar;
