import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/interactive/button';
import { useToast } from '@/components/ui/feedback/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Plus,
  Download,
} from 'lucide-react';
import {
  AdminProduct,
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkUpdateProductsStatus,
  bulkDeleteProducts,
  getAllCategories,
  uploadProductImage,
  logActivity,
  type Product as SupabaseProduct,
  type ProductInsert,
  type Category,
} from '@/supabase';
import ProductForm from './ProductForm';
import ProductTable from './ProductTable';
import ProductFilters from './ProductFilters';
import StatsCard from '../dashboard/StatsCard';
import { useLottieAnimation } from '@/hooks/useLottieAnimation';

// Helper to convert Supabase product to AdminProduct type
const toLocalProduct = (p: SupabaseProduct): AdminProduct => ({
  id: p.id,
  name: p.name,
  description: p.description || '',
  category: p.category || 'Tous',
  price: p.price,
  cost: p.cost,
  status: p.status,
  sku: p.sku || '',
  images: p.images,
  createdAt: p.created_at,
  updatedAt: p.updated_at,
  tags: p.tags,
  specs: p.specs || [],
  condition: p.condition || 'new',
  viewer_count: p.viewer_count || 0,
});

// Helper to convert AdminProduct to Supabase insert type
const toSupabaseProduct = (p: Partial<AdminProduct>): ProductInsert => ({
  name: p.name || '',
  description: p.description || null,
  category: p.category || 'Tous',
  price: p.price || 0,
  cost: p.cost || 0,
  status: p.status || 'active',
  sku: p.sku || null,
  images: p.images || [],
  tags: p.tags || [],
  specs: p.specs || null,
  condition: p.condition || 'new',
  viewer_count: p.viewer_count || 0,
});

const statuses = ['all', 'active', 'inactive', 'discontinued'];

// French translations (default)
const fr = {
  title: 'Produits',
  subtitle: 'Gérer votre inventaire de produits',
  addProduct: 'Ajouter Produit',
  export: 'Exporter',
  stats: {
    totalProducts: 'Total Produits',
    activeProducts: 'Produits Actifs',
    inactiveProducts: 'Inactifs',
    totalValue: 'Valeur totale'
  },
  filters: {
    search: 'Rechercher...',
    all: 'All',
    allStatuses: 'Tous les statuts'
  },
  table: {
    product: 'Produit',
    ref: 'Réf',
    category: 'Catégorie',
    price: 'Prix',
    views: 'Vues',
    status: 'Statut',
    actions: 'Actions',
    catalogProducts: 'Catalogue produits',
    ofProducts: 'sur',
    products: 'produits',
    active: 'Actif',
    inactive: 'Inactif'
  },
  toast: {
    error: 'Erreur',
    loadError: 'Impossible de charger les produits.'
  }
};

const ProductsPage: React.FC = () => {
  const { toast } = useToast();
  const { t, language } = useLanguage();
  
  // Translation helper
  const getText = (key: string): string => {
    if (language === 'fr') {
      const keys = key.split('.');
      let value: unknown = fr;
      for (const k of keys) {
        if (value && typeof value === 'object') {
          value = (value as Record<string, unknown>)[k];
        } else {
          return key;
        }
      }
      return typeof value === 'string' ? value : key;
    }
    return t(key, 'admin_products');
  };
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<AdminProduct[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryNames, setCategoryNames] = useState<string[]>(['All']);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [formData, setFormData] = useState<Partial<AdminProduct>>({
    name: '',
    description: '',
    category: '',
    price: undefined,
    cost: undefined,
    status: 'active' as const,
    sku: '',
    images: [],
    tags: [],
    specs: [],
    condition: 'new',
    viewer_count: 0,
  });
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  // Load Lottie animations from public folder
  const { animationData: packageAnimation } = useLottieAnimation('/animations/package.json');
  const { animationData: warningAnimation } = useLottieAnimation('/animations/warning.json');
  const { animationData: emptyBoxAnimation } = useLottieAnimation('/animations/empty-box.json');
  const { animationData: revenueAnimation } = useLottieAnimation('/animations/revenue.json');

  const fetchCategories = async () => {
    try {
      const data = await getAllCategories();
      setCategories(data);
      setCategoryNames(['All', ...data.map(c => c.name)]);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getAllProducts();
      const localProducts = data.map(toLocalProduct);
      setProducts(localProducts);
      setFilteredProducts(localProducts);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les produits.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = products;

    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
      price: undefined,
      cost: undefined,
      status: 'active',
      sku: '',
      images: [],
      tags: [],
      specs: [],
      condition: 'new',
      viewer_count: 0,
    });
    setEditingProduct(null);
    setPendingFiles([]);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product: AdminProduct) => {
    setEditingProduct(product);
    setFormData(product);
    setPendingFiles([]);
    setIsFormOpen(true);
  };

  const handleSaveProduct = async () => {
    if (!formData.name) {
      toast({
        title: 'Erreur de validation',
        description: 'Veuillez remplir le nom du produit.',
        variant: 'destructive',
      });
      return;
    }
    
    // Ensure condition has a default value
    const productFormData = {
      ...formData,
      condition: formData.condition || 'new',
      category: formData.category || 'Tous',
    };

    setIsSaving(true);
    
    // Show progress toast
    const toastId = toast({
      title: '⏳ Sauvegarde en cours...',
      description: 'Préparation des données...',
      duration: 60000, // Keep it open
    });

    try {
      // Upload pending files first
      let finalImages = formData.images?.filter(url => !url.startsWith('blob:')) || [];
      
      if (pendingFiles.length > 0) {
        toast({
          title: '📤 Téléchargement des médias...',
          description: `Upload de ${pendingFiles.length} fichier(s)...`,
          duration: 60000,
        });
        
        for (let i = 0; i < pendingFiles.length; i++) {
          const file = pendingFiles[i];
          try {
            toast({
              title: '📤 Téléchargement en cours...',
              description: `Fichier ${i + 1}/${pendingFiles.length}: ${file.name}`,
              duration: 60000,
            });
            const url = await uploadProductImage(file);
            finalImages.push(url);
          } catch (uploadError) {
            console.error('Upload error:', uploadError);
            toast({
              title: 'Erreur d\'upload',
              description: `Impossible d'uploader ${file.name}`,
              variant: 'destructive',
            });
          }
        }
      }

      toast({
        title: '💾 Enregistrement...',
        description: 'Sauvegarde du produit dans la base de données...',
        duration: 60000,
      });

      const productData = {
        ...toSupabaseProduct(productFormData),
        images: finalImages,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        await logActivity({
          type: 'product',
          action: 'update',
          entity_id: editingProduct.id,
          entity_name: productFormData.name,
          details: { changes: productData },
          performed_by: null,
          performed_by_name: 'Admin'
        });
        toast({
          title: '✅ Produit mis à jour',
          description: `${productFormData.name} a été mis à jour avec succès.`,
        });
      } else {
        const newProduct = await createProduct(productData);
        await logActivity({
          type: 'product',
          action: 'create',
          entity_id: newProduct.id,
          entity_name: productFormData.name,
          details: { product: productData },
          performed_by: null,
          performed_by_name: 'Admin'
        });
        toast({
          title: '✅ Produit ajouté',
          description: `${productFormData.name} a été ajouté avec succès.`,
        });
      }
      
      setIsFormOpen(false);
      setEditingProduct(null);
      setPendingFiles([]);
      fetchProducts();
    } catch (error) {
      console.error('Save product error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue lors de la sauvegarde.';
      toast({
        title: '❌ Erreur',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      try {
        await deleteProduct(productId);
        await logActivity({
          type: 'product',
          action: 'delete',
          entity_id: productId,
          entity_name: product.name,
          details: null,
          performed_by: null,
          performed_by_name: 'Admin'
        });
        setSelectedProducts(new Set([...selectedProducts].filter(id => id !== productId)));
        toast({
          title: 'Produit supprimé',
          description: `${product.name} a été supprimé avec succès.`,
        });
        fetchProducts();
      } catch (error) {
        toast({
          title: 'Erreur',
          description: 'Impossible de supprimer le produit.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleToggleStatus = async (product: AdminProduct) => {
    const newStatus = product.status === 'active' ? 'inactive' : 'active';
    
    // Optimistic update - update UI immediately
    setProducts(prev => prev.map(p => 
      p.id === product.id ? { ...p, status: newStatus } : p
    ));
    
    try {
      await updateProduct(product.id, { status: newStatus });
      await logActivity({
        type: 'product',
        action: 'status_change',
        entity_id: product.id,
        entity_name: product.name,
        details: { from: product.status, to: newStatus },
        performed_by: null,
        performed_by_name: 'Admin'
      });
      toast({
        title: newStatus === 'active' ? '✅ Produit activé' : '⏸️ Produit désactivé',
        description: `${product.name} est maintenant ${newStatus === 'active' ? 'visible' : 'masqué'} dans la boutique.`,
      });
    } catch (error) {
      // Revert on error
      setProducts(prev => prev.map(p => 
        p.id === product.id ? { ...p, status: product.status } : p
      ));
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier le statut.',
        variant: 'destructive',
      });
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedProducts.size === 0) {
      toast({
        title: 'Aucune sélection',
        description: 'Veuillez sélectionner des produits.',
        variant: 'destructive',
      });
      return;
    }

    const ids = [...selectedProducts];

    try {
      switch (action) {
        case 'activate':
          await bulkUpdateProductsStatus(ids, 'active');
          await logActivity({
            type: 'product',
            action: 'bulk_activate',
            entity_id: null,
            entity_name: `${ids.length} products`,
            details: { ids },
            performed_by: null,
            performed_by_name: 'Admin'
          });
          toast({
            title: 'Produits activés',
            description: `${selectedProducts.size} produits ont été activés.`,
          });
          break;
        case 'deactivate':
          await bulkUpdateProductsStatus(ids, 'inactive');
          await logActivity({
            type: 'product',
            action: 'bulk_deactivate',
            entity_id: null,
            entity_name: `${ids.length} products`,
            details: { ids },
            performed_by: null,
            performed_by_name: 'Admin'
          });
          toast({
            title: 'Produits désactivés',
            description: `${selectedProducts.size} produits ont été désactivés.`,
          });
          break;
        case 'delete':
          await bulkDeleteProducts(ids);
          await logActivity({
            type: 'product',
            action: 'bulk_delete',
            entity_id: null,
            entity_name: `${ids.length} products`,
            details: { ids },
            performed_by: null,
            performed_by_name: 'Admin'
          });
          toast({
            title: 'Produits supprimés',
            description: `${selectedProducts.size} produits ont été supprimés.`,
          });
          break;
        case 'export':
          // CSV escape function: handles null/undefined, quotes, commas, newlines
          const escapeCsvValue = (value: unknown): string => {
            if (value === null || value === undefined) return '""';
            const str = String(value);
            // Replace double quotes with two double quotes, then wrap in quotes
            return `"${str.replace(/"/g, '""')}"`;
          };

          const csvData = filteredProducts
            .filter(p => selectedProducts.has(p.id))
            .map(p => ({
              Nom: p.name,
              SKU: p.sku,
              Catégorie: p.category,
              Prix: p.price,
              Coût: p.cost,
              Statut: p.status,
              État: p.condition === 'new' ? 'Neuf' : 'Occasion',
            }));
          
          // Guard for empty array
          if (csvData.length === 0) {
            toast({
              title: 'Aucun produit',
              description: 'Aucun produit sélectionné pour l\'export.',
              variant: 'destructive',
            });
            break;
          }

          const csvContent = [
            Object.keys(csvData[0]).map(escapeCsvValue).join(','),
            ...csvData.map(row => Object.values(row).map(escapeCsvValue).join(','))
          ].join('\n');
          
          const blob = new Blob([csvContent], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `products-export-${new Date().toISOString().split('T')[0]}.csv`;
          a.click();
          window.URL.revokeObjectURL(url);
          
          toast({
            title: 'Export terminé',
            description: `${selectedProducts.size} produits exportés avec succès.`,
          });
          break;
      }
      
      if (action !== 'export') {
        fetchProducts();
      }
      setSelectedProducts(new Set());
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue.',
        variant: 'destructive',
      });
    }
  };

  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.status === 'active').length;
  const totalValue = products.reduce((sum, p) => sum + p.price, 0);

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">{getText('title')}</h1>
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
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">{getText('title')}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">{getText('subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleBulkAction('export')} disabled={selectedProducts.size === 0} className="h-8 sm:h-9 text-xs sm:text-sm">
            <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">{getText('export')}</span> ({selectedProducts.size})
          </Button>
          <Button size="sm" onClick={handleAddProduct} className="h-8 sm:h-9 text-xs sm:text-sm">
            <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            {getText('addProduct')}
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title={getText('stats.totalProducts')}
          value={totalProducts}
          change={undefined}
          lottieAnimation={packageAnimation || undefined}
          svgIcon="/icons/products.svg"
          gradient="from-blue-500 to-indigo-600"
          iconColor="text-white"
        />
        
        <StatsCard
          title={getText('stats.activeProducts')}
          value={activeProducts}
          change={undefined}
          lottieAnimation={warningAnimation || undefined}
          svgIcon="/icons/low-stock.svg"
          gradient="from-green-500 to-emerald-600"
          iconColor="text-white"
        />
        
        <StatsCard
          title={getText('stats.totalValue')}
          value={`${totalValue.toLocaleString()} DA`}
          change={undefined}
          lottieAnimation={revenueAnimation || undefined}
          svgIcon="/icons/revenue.svg"
          gradient="from-purple-500 to-indigo-600"
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
        categories={categoryNames}
        statuses={statuses}
        selectedCount={selectedProducts.size}
        onBulkAction={handleBulkAction}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        translations={{
          search: getText('filters.search'),
          category: language === 'fr' ? 'Catégorie' : t('table.category', 'admin_products'),
          status: language === 'fr' ? 'Statut' : t('table.status', 'admin_products'),
          selected: language === 'fr' ? 'sél.' : t('bulk.selected', 'admin_products'),
          bulkActions: language === 'fr' ? 'Actions groupées' : 'Bulk Actions',
          activate: language === 'fr' ? 'Activer' : t('actions.activate', 'admin_products'),
          deactivate: language === 'fr' ? 'Désactiver' : t('actions.deactivate', 'admin_products'),
          delete: language === 'fr' ? 'Supprimer' : t('actions.delete', 'admin_products'),
          export: getText('export'),
        }}
      />

      <ProductTable
        products={filteredProducts}
        totalProducts={totalProducts}
        selectedProducts={selectedProducts}
        onSelectProduct={handleSelectProduct}
        onSelectAll={handleSelectAll}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
        onToggleStatus={handleToggleStatus}
        translations={{
          catalogTitle: getText('table.catalogProducts'),
          of: getText('table.ofProducts'),
          products: getText('table.products'),
          selectAll: language === 'fr' ? 'Tout sélectionner' : t('table.selectAll', 'admin_products'),
          edit: language === 'fr' ? 'Modifier' : t('actions.edit', 'admin_products'),
          delete: language === 'fr' ? 'Supprimer' : t('actions.delete', 'admin_products'),
          deleteTitle: language === 'fr' ? 'Supprimer le produit' : t('deleteConfirm.title', 'admin_products'),
          deleteConfirm: language === 'fr' ? 'Cette action est irréversible.' : t('deleteConfirm.message', 'admin_products'),
          cancel: language === 'fr' ? 'Annuler' : t('actions.cancel', 'admin_products'),
          active: getText('table.active'),
          inactive: getText('table.inactive'),
          discontinued: language === 'fr' ? 'Arrêté' : t('filters.discontinued', 'admin_products'),
          product: getText('table.product'),
          ref: getText('table.ref'),
          category: getText('table.category'),
          price: getText('table.price'),
          views: getText('table.views'),
          status: getText('table.status'),
          actions: getText('table.actions'),
        }}
      />

      <ProductForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        editingProduct={editingProduct}
        formData={formData}
        setFormData={setFormData}
        onSave={handleSaveProduct}
        categories={categoryNames.filter(c => c !== 'All')}
        pendingFiles={pendingFiles}
        setPendingFiles={setPendingFiles}
        isSaving={isSaving}
        setIsSaving={setIsSaving}
      />
    </div>
  );
};

export default ProductsPage;
