import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/interactive/button';
import { useToast } from '@/components/ui/feedback/use-toast';
import {
  Plus,
  Download,
} from 'lucide-react';
import { Product } from '@/types';
import ProductForm from './ProductForm';
import ProductTable from './ProductTable';
import ProductFilters from './ProductFilters';
import StatsCard from '../dashboard/StatsCard';
import { useLottieAnimation } from '@/hooks/useLottieAnimation';

// Mock data generator
const generateMockProducts = (): Product[] => [
  {
    id: '1',
    name: 'DTF Transfer Film',
    description: 'High-quality DTF transfer film for textile printing',
    category: 'Films',
    price: 49.99,
    cost: 25.50,
    stock: 150,
    minStock: 50,
    status: 'active',
    sku: 'DTF-FILM-001',
    images: ['/images/product-dtf-transfers.jpg'],
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-03-10T14:20:00Z',
    supplier: 'FilmTech Solutions',
    tags: ['film', 'dtf', 'textile'],
  },
  {
    id: '2',
    name: 'Heat Press Machine Pro',
    description: 'Professional heat press machine for DTF transfers',
    category: 'Equipment',
    price: 299.99,
    cost: 180.00,
    stock: 12,
    minStock: 5,
    status: 'active',
    sku: 'HP-MACHINE-PRO',
    images: ['/images/product-heat-press.jpg'],
    createdAt: '2024-01-20T09:15:00Z',
    updatedAt: '2024-03-12T11:45:00Z',
    supplier: 'PressTech Industries',
    tags: ['equipment', 'press', 'professional'],
  },
  {
    id: '3',
    name: 'Vinyl Sheets - White',
    description: 'Premium white vinyl sheets for cutting and printing',
    category: 'Vinyl',
    price: 12.99,
    cost: 6.50,
    stock: 25,
    minStock: 30,
    status: 'active',
    sku: 'VINYL-WHITE-001',
    images: ['/images/product-vinyl.jpg'],
    createdAt: '2024-02-01T08:00:00Z',
    updatedAt: '2024-03-08T16:30:00Z',
    supplier: 'VinylPro Materials',
    tags: ['vinyl', 'white', 'sheets'],
  },
  {
    id: '4',
    name: 'Printer Ink Set - CMYK',
    description: 'High-capacity CMYK ink cartridges for DTF printers',
    category: 'Ink',
    price: 89.99,
    cost: 45.00,
    stock: 8,
    minStock: 10,
    status: 'active',
    sku: 'INK-CMYK-SET',
    images: ['/images/product-ink-set.jpg'],
    createdAt: '2024-02-10T13:20:00Z',
    updatedAt: '2024-03-14T10:15:00Z',
    supplier: 'InkMaster Pro',
    tags: ['ink', 'cmyk', 'cartridge'],
  },
  {
    id: '5',
    name: 'Cutting Tools Set',
    description: 'Complete set of cutting tools for vinyl and film work',
    category: 'Tools',
    price: 34.99,
    cost: 18.75,
    stock: 0,
    minStock: 15,
    status: 'inactive',
    sku: 'TOOLS-CUT-SET',
    images: ['/images/product-tools.jpg'],
    createdAt: '2024-02-15T11:45:00Z',
    updatedAt: '2024-03-05T09:30:00Z',
    supplier: 'ToolCraft Solutions',
    tags: ['tools', 'cutting', 'set'],
  },
];

const categories = ['All', 'Films', 'Equipment', 'Vinyl', 'Ink', 'Tools', 'Accessories'];
const statuses = ['all', 'active', 'inactive', 'discontinued'];

const ProductsPage: React.FC = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    category: '',
    price: 0,
    cost: 0,
    stock: 0,
    minStock: 0,
    status: 'active' as const,
    sku: '',
    supplier: '',
    tags: [],
  });

  // Load Lottie animations from public folder
  const { animationData: packageAnimation } = useLottieAnimation('/animations/package.json');
  const { animationData: warningAnimation } = useLottieAnimation('/animations/warning.json');
  const { animationData: emptyBoxAnimation } = useLottieAnimation('/animations/empty-box.json');
  const { animationData: revenueAnimation } = useLottieAnimation('/animations/revenue.json');

  useEffect(() => {
    const timer = setTimeout(() => {
      const mockProducts = generateMockProducts();
      setProducts(mockProducts);
      setFilteredProducts(mockProducts);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let filtered = products;

    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.supplier?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(product => product.status === selectedStatus);
    }

    setFilteredProducts(filtered);
  }, [products, searchQuery, selectedCategory, selectedStatus]);

  const handleSelectProduct = (productId: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map(p => p.id)));
    }
  };

  const handleAddProduct = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      price: 0,
      cost: 0,
      stock: 0,
      minStock: 0,
      status: 'active',
      sku: '',
      supplier: '',
      tags: [],
    });
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setIsFormOpen(true);
  };

  const handleSaveProduct = () => {
    if (!formData.name || !formData.category || !formData.sku) {
      toast({
        title: 'Erreur de validation',
        description: 'Veuillez remplir tous les champs obligatoires.',
        variant: 'destructive',
      });
      return;
    }

    if (editingProduct) {
      const updatedProducts = products.map(p =>
        p.id === editingProduct.id ? { ...formData, id: editingProduct.id } as Product : p
      );
      setProducts(updatedProducts);
      toast({
        title: 'Produit mis à jour',
        description: `${formData.name} a été mis à jour avec succès.`,
      });
    } else {
      const newProduct: Product = {
        ...formData,
        id: Date.now().toString(),
        images: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Product;
      
      setProducts([...products, newProduct]);
      toast({
        title: 'Produit ajouté',
        description: `${formData.name} a été ajouté avec succès.`,
      });
    }
    
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setProducts(products.filter(p => p.id !== productId));
      setSelectedProducts(new Set([...selectedProducts].filter(id => id !== productId)));
      toast({
        title: 'Produit supprimé',
        description: `${product.name} a été supprimé avec succès.`,
      });
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedProducts.size === 0) {
      toast({
        title: 'Aucune sélection',
        description: 'Veuillez sélectionner des produits.',
        variant: 'destructive',
      });
      return;
    }

    switch (action) {
      case 'activate':
        setProducts(products.map(p => 
          selectedProducts.has(p.id) ? { ...p, status: 'active' as const } : p
        ));
        toast({
          title: 'Produits activés',
          description: `${selectedProducts.size} produits ont été activés.`,
        });
        break;
      case 'deactivate':
        setProducts(products.map(p => 
          selectedProducts.has(p.id) ? { ...p, status: 'inactive' as const } : p
        ));
        toast({
          title: 'Produits désactivés',
          description: `${selectedProducts.size} produits ont été désactivés.`,
        });
        break;
      case 'delete':
        setProducts(products.filter(p => !selectedProducts.has(p.id)));
        toast({
          title: 'Produits supprimés',
          description: `${selectedProducts.size} produits ont été supprimés.`,
        });
        break;
      case 'export':
        const csvData = filteredProducts
          .filter(p => selectedProducts.has(p.id))
          .map(p => ({
            Name: p.name,
            SKU: p.sku,
            Category: p.category,
            Price: p.price,
            Cost: p.cost,
            Stock: p.stock,
            Status: p.status,
            Supplier: p.supplier || '',
          }));
        
        const csvContent = [
          Object.keys(csvData[0] || {}).join(','),
          ...csvData.map(row => Object.values(row).join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `products-export-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        
        toast({
          title: 'Export terminé',
          description: `${selectedProducts.size} produits exportés avec succès.`,
        });
        break;
    }
    
    setSelectedProducts(new Set());
  };

  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.status === 'active').length;
  const lowStockProducts = products.filter(p => p.stock <= p.minStock && p.stock > 0).length;
  const outOfStockProducts = products.filter(p => p.stock === 0).length;
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Produits</h1>
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2 p-3 sm:p-4">
                <div className="h-3 sm:h-4 bg-muted rounded w-16 sm:w-20" />
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <div className="h-6 sm:h-8 bg-muted rounded w-12 sm:w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Produits</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Gérer votre inventaire de produits</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleBulkAction('export')} disabled={selectedProducts.size === 0} className="h-8 sm:h-9 text-xs sm:text-sm">
            <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Exporter</span> ({selectedProducts.size})
          </Button>
          <Button size="sm" onClick={handleAddProduct} className="h-8 sm:h-9 text-xs sm:text-sm">
            <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Ajouter</span> Produit
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Produits"
          value={totalProducts}
          change={undefined}
          lottieAnimation={packageAnimation || undefined}
          svgIcon="/icons/products.svg"
          gradient="from-blue-500 to-indigo-600"
          iconColor="text-white"
        />
        
        <StatsCard
          title="Stock faible"
          value={lowStockProducts}
          change={undefined}
          lottieAnimation={warningAnimation || undefined}
          svgIcon="/icons/low-stock.svg"
          gradient="from-orange-500 to-amber-600"
          iconColor="text-white"
        />
        
        <StatsCard
          title="Rupture"
          value={outOfStockProducts}
          change={undefined}
          lottieAnimation={emptyBoxAnimation || undefined}
          svgIcon="/icons/out-of-stock.svg"
          gradient="from-red-500 to-rose-600"
          iconColor="text-white"
        />
        
        <StatsCard
          title="Valeur totale"
          value={`${totalValue.toLocaleString()} DA`}
          change={undefined}
          lottieAnimation={revenueAnimation || undefined}
          svgIcon="/icons/revenue.svg"
          gradient="from-green-500 to-emerald-600"
          iconColor="text-white"
        />
      </div>

      <ProductFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        categories={categories}
        statuses={statuses}
        selectedCount={selectedProducts.size}
        onBulkAction={handleBulkAction}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <ProductTable
        products={filteredProducts}
        totalProducts={totalProducts}
        selectedProducts={selectedProducts}
        onSelectProduct={handleSelectProduct}
        onSelectAll={handleSelectAll}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
      />

      <ProductForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        editingProduct={editingProduct}
        formData={formData}
        setFormData={setFormData}
        onSave={handleSaveProduct}
        categories={categories}
      />
    </div>
  );
};

export default ProductsPage;
