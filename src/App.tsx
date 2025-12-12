import React from "react";
import { Toaster } from "@/components/ui/feedback/toaster";
import { Toaster as Sonner } from "@/components/ui/feedback/sonner";
import { TooltipProvider } from "@/components/ui/overlays/tooltip";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Home from "./pages/home";
import Store from "./pages/store";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { FavoritesProvider } from "./contexts/FavoritesContext";
import { SiteSettingsProvider } from "./contexts/SiteSettingsContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./pages/admin/dashboard";
import ProductsPage from "./pages/admin/products";
import CategoriesPage from "./pages/admin/categories";
import OrdersPage from "./pages/admin/orders";
import BannersPage from "./pages/admin/banners";
import CouponsPage from "./pages/admin/coupons";
import SettingsPage from "./pages/admin/settings/index";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <SiteSettingsProvider>
          <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              <FavoritesProvider>
                <Toaster />
                <Sonner />
              <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="store" element={<Store />} />
                    <Route path="product/:id" element={<ProductDetail />} />
                    <Route path="cart" element={<Cart />} />
                    <Route path="checkout" element={<Checkout />} />
                  </Route>
                  
                  {/* Admin Routes */}
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="products" element={<ProductsPage />} />
                    <Route path="categories" element={<CategoriesPage />} />
                    <Route path="orders" element={<OrdersPage />} />
                    <Route path="banners" element={<BannersPage />} />
                    <Route path="coupons" element={<CouponsPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                                      </Route>
                  
                  {/* 404 Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
              </FavoritesProvider>
            </CartProvider>
          </AuthProvider>
          </LanguageProvider>
        </SiteSettingsProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
