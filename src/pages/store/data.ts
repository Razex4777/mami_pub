// Store data - Products
import { Product } from "./types";
import productImage1 from "/images/product-dtf-transfers.jpg";
import productImage2 from "/images/product-heat-press.jpg";
import productImage3 from "/images/product-vinyl.jpg";

export const products: Product[] = [
  {
    id: 1,
    name: "Premium DTF Transfer - Vibrant Graphics",
    category: "DTF Transfers",
    price: 24.99,
    image: productImage1,
    specs: "Full color, 300 DPI, washable",
    rating: 4.8,
    reviews: 156,
    inStock: true,
    featured: true,
    tags: ["premium", "vibrant", "washable"],
    deliveryTime: "24-48h",
    discount: 15
  },
  {
    id: 2,
    name: "Commercial Heat Press - 16x20",
    category: "Equipment",
    price: 1299.99,
    image: productImage2,
    specs: "Digital display, auto-release",
    rating: 4.9,
    reviews: 89,
    inStock: true,
    featured: true,
    tags: ["commercial", "digital", "auto-release"],
    deliveryTime: "3-5 days",
    discount: 0
  },
  {
    id: 3,
    name: "Premium Heat Transfer Vinyl",
    category: "Materials",
    price: 39.99,
    image: productImage3,
    specs: "50-yard roll, multiple colors",
    rating: 4.7,
    reviews: 234,
    inStock: true,
    featured: false,
    tags: ["premium", "50-yard", "multi-color"],
    deliveryTime: "24-48h",
    discount: 10
  },
  {
    id: 4,
    name: "Custom Design DTF Transfer",
    category: "DTF Transfers",
    price: 34.99,
    image: productImage1,
    specs: "Full color, gang sheet available",
    rating: 4.6,
    reviews: 98,
    inStock: true,
    featured: false,
    tags: ["custom", "gang sheet", "full color"],
    deliveryTime: "2-3 days",
    discount: 0
  },
  {
    id: 5,
    name: "Professional Heat Press - 15x15",
    category: "Equipment",
    price: 899.99,
    image: productImage2,
    specs: "Clamshell design, precision temp",
    rating: 4.8,
    reviews: 145,
    inStock: true,
    featured: true,
    tags: ["professional", "clamshell", "precision"],
    deliveryTime: "2-4 days",
    discount: 20
  },
  {
    id: 6,
    name: "Specialty Vinyl Collection",
    category: "Materials",
    price: 54.99,
    image: productImage3,
    specs: "Glitter, metallic, holographic",
    rating: 4.5,
    reviews: 67,
    inStock: false,
    featured: false,
    tags: ["specialty", "glitter", "metallic", "holographic"],
    deliveryTime: "3-5 days",
    discount: 0
  },
];
