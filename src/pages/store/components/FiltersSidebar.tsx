import { Input } from "@/components/ui/forms/input";
import {
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Flame,
  Package,
  CheckCircle
} from "lucide-react";
import { FilterState } from "../types";

interface FiltersSidebarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  categories: string[];
}

const FiltersSidebar = ({
  filters,
  setFilters,
  selectedCategory,
  setSelectedCategory,
  categories
}: FiltersSidebarProps) => {
  const resetFilters = () => {
    setSelectedCategory("all");
    setFilters({
      priceRange: [0, 2000],
      categories: [],
      inStock: false,
      featured: false,
      isNew: false,
      onSale: false
    });
  };

  return (
    <aside className="w-full lg:w-56 flex-shrink-0">
      <div className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sticky top-4 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            Filtres
          </h3>
          <button 
            onClick={resetFilters}
            className="text-[10px] text-primary hover:underline"
          >
            Réinitialiser
          </button>
        </div>

        {/* Quick Filters - Tags */}
        <div>
          <label className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground block mb-2">Filtres rapides</label>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setFilters(prev => ({ ...prev, isNew: !prev.isNew }))}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold transition-all ${
                filters.isNew 
                  ? 'bg-green-500 text-white' 
                  : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
              }`}
            >
              <Sparkles className="h-3 w-3" />
              Nouveau
            </button>
            <button
              onClick={() => setFilters(prev => ({ ...prev, featured: !prev.featured }))}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold transition-all ${
                filters.featured 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20'
              }`}
            >
              <TrendingUp className="h-3 w-3" />
              Populaire
            </button>
            <button
              onClick={() => setFilters(prev => ({ ...prev, onSale: !prev.onSale }))}
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold transition-all ${
                filters.onSale 
                  ? 'bg-red-500 text-white' 
                  : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
              }`}
            >
              <Flame className="h-3 w-3" />
              Promo
            </button>
          </div>
        </div>

        {/* Categories */}
        <div>
          <label className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground block mb-2">Catégories</label>
          <div className="space-y-1">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
                selectedCategory === "all" 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-white/10 text-muted-foreground hover:text-foreground'
              }`}
            >
              <Package className="h-3.5 w-3.5" />
              Toutes
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedCategory === category 
                    ? 'bg-primary text-primary-foreground' 
                    : 'hover:bg-white/10 text-muted-foreground hover:text-foreground'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range - Min/Max Inputs */}
        <div>
          <label className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground block mb-2">Prix (DA)</label>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Input
                type="number"
                placeholder="Min"
                value={filters.priceRange[0] || ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  priceRange: [parseInt(e.target.value) || 0, prev.priceRange[1]] 
                }))}
                className="h-8 text-xs bg-white/5 border-white/10 text-center px-2"
              />
            </div>
            <span className="text-muted-foreground text-xs">—</span>
            <div className="flex-1">
              <Input
                type="number"
                placeholder="Max"
                value={filters.priceRange[1] || ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  priceRange: [prev.priceRange[0], parseInt(e.target.value) || 2000] 
                }))}
                className="h-8 text-xs bg-white/5 border-white/10 text-center px-2"
              />
            </div>
          </div>
          {/* Quick price buttons */}
          <div className="flex flex-wrap gap-1 mt-2">
            {[100, 500, 1000, 2000].map((price) => (
              <button
                key={price}
                onClick={() => setFilters(prev => ({ ...prev, priceRange: [0, price] }))}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                  filters.priceRange[1] === price 
                    ? 'bg-primary/20 text-primary' 
                    : 'bg-white/5 text-muted-foreground hover:bg-white/10'
                }`}
              >
                &lt;{price}
              </button>
            ))}
          </div>
        </div>

        {/* Availability */}
        <div>
          <label className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground block mb-2">Disponibilité</label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
              filters.inStock 
                ? 'bg-primary border-primary' 
                : 'border-white/30 group-hover:border-primary/50'
            }`}>
              {filters.inStock && <CheckCircle className="h-3 w-3 text-white" />}
            </div>
            <input
              type="checkbox"
              checked={filters.inStock}
              onChange={(e) => setFilters(prev => ({ ...prev, inStock: e.target.checked }))}
              className="hidden"
            />
            <span className="text-xs text-white/80 group-hover:text-white transition-colors">En stock uniquement</span>
          </label>
        </div>
      </div>
    </aside>
  );
};

export default FiltersSidebar;
