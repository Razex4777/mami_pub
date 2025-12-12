import { useState, useMemo, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import RefinedProductGrid from "@/components/product/RefinedProductGrid";
import { FilterState, Product } from "./types";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/interactive/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/overlays/sheet";
import {
  PromoBannerCarousel,
  FiltersSidebar,
  SearchBar,
  ResultsHeader
} from "./components";
import { getActiveProducts, getActiveCategories, type Product as SupabaseProduct } from "@/supabase";
import { useFavorites } from "@/contexts/FavoritesContext";

// Helper to filter only images (no videos) for hover swipe
const filterImages = (urls: string[]): string[] => {
  const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.m4v'];
  return urls.filter(url => {
    try {
      // Try to parse as URL, fallback to stripping query/hash for relative URLs
      let pathname: string;
      try {
        pathname = new URL(url, window.location.origin).pathname;
      } catch {
        pathname = url.split('?')[0].split('#')[0];
      }
      // Check if pathname ends with a video extension
      return !videoExtensions.some(ext => pathname.toLowerCase().endsWith(ext));
    } catch {
      return true; // Keep URL if parsing fails
    }
  });
};

// Convert Supabase product to store Product type
const toStoreProduct = (p: SupabaseProduct): Product => {
  const images = filterImages(p.images || []);
  return {
    id: p.id, // Use full UUID as string
    name: p.name,
    category: p.category,
    price: p.price,
    image: images[0] || '/placeholder.svg',
    images: images, // All images for hover swipe
    description: p.description || undefined,
    specs: p.specs || undefined,
    tags: p.tags,
    condition: p.condition,
    viewerCount: p.viewer_count,
    createdAt: p.created_at, // For sorting by newest
  };
};

const Store = () => {
  const location = useLocation();
  const { favorites } = useFavorites();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [aiSearchKeywords, setAiSearchKeywords] = useState<string[]>([]);
  const [aiSuggestedCategory, setAiSuggestedCategory] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [maxPrice, setMaxPrice] = useState(100000);
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 100000],
    categories: [],
    condition: 'all',
    showFavoritesOnly: false
  });
  const [isLoading, setIsLoading] = useState(true);

  // Handle AI search results
  const handleAISearch = useCallback((keywords: string[], category: string | null) => {
    setAiSearchKeywords(keywords);
    setAiSuggestedCategory(category);
    
    // Auto-select category if AI suggests one and it exists
    if (category && categories.includes(category)) {
      setSelectedCategory(category);
    }
  }, [categories]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          getActiveProducts(),
          getActiveCategories()
        ]);
        const storeProducts = productsData.map(toStoreProduct);
        setProducts(storeProducts);
        setCategories(categoriesData.map(c => c.name));
        
        // Calculate max price from products
        if (storeProducts.length > 0) {
          const highestPrice = Math.max(...storeProducts.map(p => p.price));
          const roundedMax = Math.ceil(highestPrice / 1000) * 1000; // Round up to nearest 1000
          setMaxPrice(roundedMax);
          setFilters(prev => ({ ...prev, priceRange: [0, roundedMax] }));
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle auto-focus on search input from navigation state
  useEffect(() => {
    if (location.state?.focusSearch) {
      const timer = setTimeout(() => {
        const input = document.getElementById("store-search-input");
        if (input) {
          input.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Calculate product counts for filters
  const productCounts = useMemo(() => ({
    total: products.length,
    new: products.filter(p => p.condition === 'new').length,
    used: products.filter(p => p.condition === 'used').length,
  }), [products]);

  const filteredProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      // Favorites filter - if enabled, only show favorited products
      if (filters.showFavoritesOnly && !favorites.includes(product.id)) {
        return false;
      }
      
      // AI-powered search: use AI keywords when available, otherwise use searchQuery
      // AI keywords take priority even if searchQuery is empty (user cleared input after AI processed)
      const searchTerms = aiSearchKeywords.length > 0 
        ? aiSearchKeywords 
        : (searchQuery ? [searchQuery] : []);
      
      // No search terms = show all products (no filtering)
      const matchesSearch = searchTerms.length === 0 || searchTerms.some(term => {
        const lowerTerm = term.toLowerCase();
        return (
          product.name.toLowerCase().includes(lowerTerm) ||
          product.description?.toLowerCase().includes(lowerTerm) ||
          product.tags?.some(tag => tag.toLowerCase().includes(lowerTerm)) ||
          product.category?.toLowerCase().includes(lowerTerm)
        );
      });
      
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      const matchesPrice = product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1];
      const matchesCondition = filters.condition === 'all' || product.condition === filters.condition;

      return matchesSearch && matchesCategory && matchesPrice && matchesCondition;
    });

    // Sort products by date or view count
    switch (sortBy) {
      case "oldest":
        // Sort by created_at timestamp (oldest first)
        filtered.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateA - dateB;
        });
        break;
      case "mostViewed":
        // Sort by view count (highest first)
        filtered.sort((a, b) => {
          const viewsA = a.viewerCount || 0;
          const viewsB = b.viewerCount || 0;
          return viewsB - viewsA;
        });
        break;
      case "newest":
      default:
        // Sort by created_at timestamp (newest first)
        filtered.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        break;
    }

    return filtered;
  }, [searchQuery, aiSearchKeywords, selectedCategory, sortBy, filters, products, favorites]);

  const resetFilters = () => {
    setSearchQuery("");
    setAiSearchKeywords([]);
    setAiSuggestedCategory(null);
    setSelectedCategory("all");
    setFilters({
      priceRange: [0, maxPrice],
      categories: [],
      condition: 'all',
      showFavoritesOnly: false
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Promo Banner Carousel */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <PromoBannerCarousel />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20 pt-6">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* LEFT SIDEBAR - Desktop Only */}
          <div className="hidden lg:block">
            <FiltersSidebar
              filters={filters}
              setFilters={setFilters}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              categories={categories}
              maxPrice={maxPrice}
              productCounts={productCounts}
            />
          </div>

          {/* RIGHT CONTENT - Search + Products */}
          <main className="flex-1 min-w-0">
            {/* Mobile Filter & Search Header */}
            <div className="flex gap-3 mb-4 lg:hidden sticky top-[64px] z-30 bg-background/95 backdrop-blur-xl p-2 -mx-2 rounded-xl border border-white/5 shadow-sm">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="shrink-0 h-11 w-11 rounded-xl border-white/10 bg-card/50 hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all">
                    <SlidersHorizontal className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[85vw] sm:w-[400px] p-0 border-r-white/10 bg-background/95 backdrop-blur-2xl overflow-y-auto h-full">
                  <div className="p-6 pt-10 pb-40 min-h-full">
                    <FiltersSidebar
                      filters={filters}
                      setFilters={setFilters}
                      selectedCategory={selectedCategory}
                      setSelectedCategory={setSelectedCategory}
                      categories={categories}
                      maxPrice={maxPrice}
                      productCounts={productCounts}
                    />
                  </div>
                </SheetContent>
              </Sheet>
              
              <div className="flex-1">
                <SearchBar 
                  searchQuery={searchQuery} 
                  setSearchQuery={setSearchQuery}
                  onAISearch={handleAISearch}
                  products={products}
                />
              </div>
            </div>

            {/* Desktop Search */}
            <div className="hidden lg:block">
              <SearchBar 
                searchQuery={searchQuery} 
                setSearchQuery={setSearchQuery}
                onAISearch={handleAISearch}
                products={products}
              />
            </div>

            <ResultsHeader
              totalProducts={filteredProducts.length}
              sortBy={sortBy}
              setSortBy={setSortBy}
            />

            {/* Products Grid */}
            <RefinedProductGrid
              products={filteredProducts}
              isLoading={isLoading}
              onResetFilters={resetFilters}
            />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Store;
