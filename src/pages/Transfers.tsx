import { useState } from "react";
import { Button } from "@/components/ui/interactive/button";
import { Input } from "@/components/ui/forms/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/forms/select";
import { Search, SlidersHorizontal, ShoppingCart } from "lucide-react";
import ProductCard from "@/components/ProductCard";
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
  },
  {
    id: 2,
    name: "Commercial Heat Press - 16x20",
    category: "Equipment",
    price: 1299.99,
    image: productImage2,
    specs: "Digital display, auto-release",
  },
  {
    id: 3,
    name: "Premium Heat Transfer Vinyl",
    category: "Materials",
    price: 39.99,
    image: productImage3,
    specs: "50-yard roll, multiple colors",
  },
  {
    id: 4,
    name: "Custom Design DTF Transfer",
    category: "DTF Transfers",
    price: 34.99,
    image: productImage1,
    specs: "Full color, gang sheet available",
  },
  {
    id: 5,
    name: "Professional Heat Press - 15x15",
    category: "Equipment",
    price: 899.99,
    image: productImage2,
    specs: "Clamshell design, precision temp",
  },
  {
    id: 6,
    name: "Specialty Vinyl Collection",
    category: "Materials",
    price: 54.99,
    image: productImage3,
    specs: "Glitter, metallic, holographic",
  },
];

const Transfers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold mb-4">Product Catalog</h1>
          <p className="text-secondary text-lg">
            Professional DTF transfers, equipment, and materials for commercial applications
          </p>
        </div>

        {/* Filters */}
        <div className="panel p-6 rounded-lg border border-border mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-border"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-64 bg-background border-border">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="DTF Transfers">DTF Transfers</SelectItem>
                <SelectItem value="Equipment">Equipment</SelectItem>
                <SelectItem value="Materials">Materials</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="border-border hover:bg-muted">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-muted">
            Showing {filteredProducts.length} of {products.length} products
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Transfers;
