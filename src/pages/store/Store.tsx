import { useState, useMemo, useEffect } from "react";
import RefinedProductGrid from "@/components/product/RefinedProductGrid";
import CartButton from "@/components/cart/CartButton";
import FloatingCart from "@/components/cart/FloatingCart";
import { FilterState, Product } from "./types";
import {
  PromoBannerCarousel,
  FiltersSidebar,
  SearchBar,
  ResultsHeader
} from "./components";
import { getActiveProducts, type Product as SupabaseProduct } from "@/supabase";

// Convert Supabase product to store Product type
const toStoreProduct = (p: SupabaseProduct): Product => ({
  id: parseInt(p.id.replace(/-/g, '').slice(0, 8), 16) || Math.random() * 1000000,
  name: p.name,
  category: p.category,
  price: p.price,
  image: p.images[0] || '/images/product-dtf-transfers.jpg',
  specs: p.specs || p.description || '',
  rating: p.rating,
  reviews: p.reviews_count,
  inStock: p.stock > 0,
  featured: p.featured,
  tags: p.tags,
  deliveryTime: p.delivery_time || undefined,
  discount: p.discount,
});

const Store = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 2000],
    categories: [],
    inStock: false,
    featured: false,
    isNew: false,
    onSale: false
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const data = await getActiveProducts();
        setProducts(data.map(toStoreProduct));
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const categories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category))];
    return cats;
  }, [products]);

  const filteredProducts = useMemo(() => {
    let filtered = products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      const matchesPrice = product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1];
      const matchesStock = !filters.inStock || product.inStock;
      const matchesFeatured = !filters.featured || product.featured;

      return matchesSearch && matchesCategory && matchesPrice && matchesStock && matchesFeatured;
    });

    // Sort products
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        filtered.sort((a, b) => b.id - a.id);
        break;
      case "featured":
      default:
        filtered.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return 0;
        });
        break;
    }

    return filtered;
  }, [searchQuery, selectedCategory, sortBy, filters]);

  const resetFilters = () => {
    setSearchQuery("");
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
    <div className="min-h-screen bg-background">
      {/* Promo Banner Carousel */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <PromoBannerCarousel />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20 pt-6">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* LEFT SIDEBAR - Filters */}
          <FiltersSidebar
            filters={filters}
            setFilters={setFilters}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            categories={categories}
          />

          {/* RIGHT CONTENT - Search + Products */}
          <main className="flex-1 min-w-0">
            <SearchBar 
              searchQuery={searchQuery} 
              setSearchQuery={setSearchQuery} 
            />

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

      {/* Cart Button and Floating Cart */}
      <CartButton />
      <FloatingCart />
    </div>
  );
};

export default Store;
